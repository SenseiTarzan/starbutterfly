import Radio from "../Api/Radio/Radio";
import MusicYoutube from "../Api/Music/MusicYoutube";
import {
    BitFieldResolvable,
    Collection,
    GuildMember, MessageEmbed,
    NewsChannel,
    StageChannel,
    TextChannel,
    User,
    VoiceChannel
} from "discord.js";
import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource, createAudioPlayer,
    createAudioResource,
    entersState, getVoiceConnection,
    joinVoiceChannel, NoSubscriberBehavior, VoiceConnection,
    VoiceConnectionStatus
} from '@discordjs/voice';
import Main from "../Main";
import YoutubeUrl from "../Api/Music/YoutubeUrl";
export type ActionTypeResolvable = BitFieldResolvable<ActionType, bigint>;

export type ActionType =
    | 'start'
    | 'stop';
export type PlayTypeResolvable = BitFieldResolvable<PlayType, bigint>;

export type PlayType =
    | 'youtube'
    | 'radio';

interface QeueMusiqueInterface{
    channel: TextChannel,
    type_music: PlayTypeResolvable,
    queue: Array<any>,
    volume_default: number,
    status: ActionTypeResolvable,
    audioPlayer: AudioPlayer |undefined,
    audioResource: AudioResource |undefined
}

export default class QueueMusicManager {
    private queuebyguild: Collection<string, QeueMusiqueInterface>;
    private main: Main;
    constructor(main: Main) {
        this.main = main;
        this.queuebyguild = new Collection<string, QeueMusiqueInterface>();
    }

    public getQueueMusique(guildId: string): QeueMusiqueInterface |undefined{
        return this.queuebyguild.get(guildId);
    }

    public addQueueMusique(member: GuildMember,channel: TextChannel, name_or_url: string, type_music: PlayTypeResolvable = "youtube"){
        if (member?.voice.channel !== null) {
            let queue: QeueMusiqueInterface | undefined = this.getQueueMusique(channel.guildId);
            let music: Radio | MusicYoutube | undefined | null;
            if (type_music == "radio") {
                if (this.main.getRadioManager().existRadio(name_or_url)) {
                    music = this.main.getRadioManager().getRadioData(name_or_url);
                }
                if (queue === undefined) {
                    queue = {
                        channel: channel,
                        type_music: type_music,
                        queue: [music],
                        volume_default: 5,
                        status: "start",
                        audioPlayer: undefined,
                        audioResource: undefined
                    }

                } else {
                    if (queue.status !== "stop") {
                        queue["queue"].push(music);
                    }
                }
                this.setQueueMusique(channel.guildId, queue);
                this.playMusic(member.voice.channel);
            } else if (type_music == "youtube") {
                const youtube = new YoutubeUrl(name_or_url);
                youtube.SearchMusic().then(video => {
                    music = video;
                    if (queue === undefined) {
                        queue = {
                            channel: channel,
                            type_music: type_music,
                            queue: [music],
                            volume_default: 50,
                            status: "start",
                            audioPlayer: undefined,
                            audioResource: undefined
                        }

                    } else {
                        if (queue.status !== "stop") {
                            queue["queue"].push(music);
                        }
                    }
                    this.setQueueMusique(channel.guildId, queue);
                    this.playMusic(member.voice.channel)
                });
            }
        }
    }


    public setQueueMusique(guildId: string, queue: QeueMusiqueInterface){
        this.queuebyguild.set(guildId, queue);
    }


    public RemoveQueueMusique(guildId: string): void {
        this.queuebyguild.delete(guildId);
    }

    public getMusic(guildId: string): Radio |MusicYoutube | undefined{
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return undefined;
        const first_music = queue.queue.shift();
        if (first_music === undefined) return undefined;
        this.setQueueMusique(guildId,queue);
        return first_music;
    }

    public getAudioFluxMusic(audio: Radio | MusicYoutube, guildId: string): AudioResource<null>{
        let playaudio: AudioResource<null> |undefined = undefined;
        if (audio instanceof Radio) {
            playaudio = audio.getAudioFlux();
            playaudio.volume?.setVolume(this.getVolumeDefault(guildId) / 100);
        } else if (audio instanceof MusicYoutube) {
            playaudio = audio.getVideo()
            playaudio.volume?.setVolume(this.getVolumeDefault(guildId) / 100);
        }
        return playaudio;
    }

    public getVolumeDefault(guildId: string): number | undefined{
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return 50;
        return queue.volume_default;
    }

    public setVolumeDefault(guildId: string, volume: number): void {
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return;
        queue.volume_default = volume;
        if (queue.audioResource !== undefined){
            queue.audioResource?.volume?.setVolume(volume / 200);
        }
        this.setQueueMusique(guildId,queue);
    }

    public getAudioPlayer(guildId: string): AudioPlayer{
        const queue = this.getQueueMusique(guildId);
        return queue === undefined ? undefined : queue.audioPlayer;
    }

    public setAudioPlayer(guildId: string, audioPlayer: AudioPlayer): void {
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return;
        queue.audioPlayer = audioPlayer;
        this.setQueueMusique(guildId,queue);
    }

    public setAudioResource(guildId: string, audioResource: AudioResource): void {
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return;
        queue.audioResource = audioResource;
        this.setQueueMusique(guildId,queue);
    }

    public getChannelText(guildId: string){
        const queue = this.getQueueMusique(guildId);
        if (queue === undefined) return undefined;
        if (queue.channel.deleted) return undefined;
        return queue.channel;
    }

    public playMusic(channel: VoiceChannel | StageChannel) {
        const guildId = channel.guildId;
        let channelvoice: VoiceConnection | undefined = this.getVoiceChannel(guildId);
        if (channelvoice === undefined) {
            channelvoice = joinVoiceChannel({
                channelId: channel.id,
                guildId: guildId,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
        }
        if (channelvoice.dispatchAudio() !== true) {
            const audio = this.getMusic(guildId);
            if (audio !== undefined) {
                try {
                    entersState(channelvoice, VoiceConnectionStatus.Ready, 30_000).then(() => {
                        let player = this.getAudioPlayer(guildId);
                        if (player === undefined) {
                            player = createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Pause}});
                        }
                        const playaudio = this.getAudioFluxMusic(audio,guildId);
                        if (playaudio !== undefined) {
                            player.on('stateChange', (oldState, newState) => {
                                if (newState.status === AudioPlayerStatus.Idle) {
                                    this.SkipMusic(guildId);
                                }
                            });
                            player.play(playaudio);
                            this.setAudioResource(guildId, playaudio);
                            this.setAudioPlayer(guildId, player);
                            channelvoice.subscribe(player);
                            this.sendMessagePlayMusique(guildId,audio);
                        }
                    });
                } catch (error) {
                    this.RemoveQueueMusique(guildId);
                    channelvoice.destroy();
                    throw error;
                }
            }else {
                this.RemoveQueueMusique(guildId);
                channelvoice.destroy();
            }
        }
    }


    public ReplayMusic(guildId: string) {

        const audio = this.getMusic(guildId);
        let channelvoice: VoiceConnection | undefined = this.getVoiceChannel(guildId);
        if (channelvoice === undefined) return;
        if (audio !== undefined) {
                try {
                    entersState(channelvoice, VoiceConnectionStatus.Ready, 30_000).then(() => {
                        const player = this.getAudioPlayer(guildId);
                        if (player === undefined) return;
                        const playaudio = this.getAudioFluxMusic(audio,guildId);
                        if (playaudio !== undefined) {
                            player.on('stateChange', (oldState, newState) => {
                                if (newState.status === AudioPlayerStatus.Idle) {
                                    this.SkipMusic(guildId);
                                }
                            });
                            player.play(playaudio);
                            this.setAudioResource(guildId, playaudio);
                            this.setAudioPlayer(guildId, player);
                            channelvoice.subscribe(player);
                            this.sendMessagePlayMusique(guildId,audio);
                        }
                    });
                } catch (error) {
                    this.RemoveQueueMusique(guildId);
                    channelvoice.destroy();
                    throw error;
                }
        }else {
            this.RemoveQueueMusique(guildId);
            channelvoice.destroy();
        }
    }
    public getVoiceChannel(guildId: string){
        return getVoiceConnection(guildId);
    }

    public sendMessagePlayMusique(guildId: string,audio: Radio |MusicYoutube){
        const channel = this.getChannelText(guildId);
        if (channel !== undefined){
            const embed = new MessageEmbed();
            embed.setColor([139, 0, 0]);
            if (audio instanceof Radio){
                let name = audio.getName();
                name = name.charAt(0).toUpperCase() + name.slice(1)
                embed.setTitle(name);
                embed.addField("**Slogan**","`" + audio.getDescription() + "`");
                embed.setThumbnail(audio.getIconUrl());
                channel.send({embeds:[embed]});
            }else if (audio instanceof MusicYoutube){
                embed.setTitle(audio.getName());
                embed.setURL(audio.getUrl());
                embed.addField("**Creator**",audio.getCreator(),false);
                embed.addField("**Like**",audio.getLikes().toString(),true);
                embed.addField("**DisLike**",audio.getDisLikes().toString(),true);
                embed.addField("**Durée**",audio.getTimeString(),true);
                embed.addField("**Description**",audio.getDescription(),false);
                embed.setThumbnail(audio.getCreatorIcon());
                embed.setImage(audio.getIconUrl());
                channel.send({embeds:[embed]}).then(message=>{
                    setTimeout(() => message.delete(), audio.getTime() * 1000);
                });

            }
        }
    }

    public PauseMusic(guildId: string): boolean{
        const voicechannel = this.getVoiceChannel(guildId);
        if (voicechannel !== undefined){
            return  true;
        }
        return  false;
    }

    public SkipMusic(guildId: string){
        this.ReplayMusic(guildId);
    }
}