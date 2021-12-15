import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    entersState,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
    VoiceConnectionDisconnectReason,
    VoiceConnectionStatus
} from "@discordjs/voice";
import Main from "../Main";
import {
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    StageChannel,
    TextChannel,
    VoiceChannel
} from "discord.js";
import {promisify} from 'util';
import Radio from "../Api/Radio/Radio";
import MusicYoutube from "../Api/Music/MusicYoutube";
import Language from "../Api/language/Language";
import QueueMusicManager from "./QueueMusicManager";
import LanguageManager from "../Api/language/LanguageManager";

const wait = promisify(setTimeout);
interface  IStreamDispatcher{
     readonly channel: TextChannel,
     voice_connection: VoiceConnection | undefined,
     player: AudioPlayer | undefined,
     audio: AudioResource | undefined,
     volume_default: number,
    volume: number,
     current_message: Message | undefined,
     queue: Array<Radio | MusicYoutube>,
     play: boolean,
     readyLock: boolean ,
     queueLock: boolean ,
     current_audio: MusicYoutube | Radio | undefined,
     return: number,
     current_time: number,
     whoId: string,
     language: Language
}

export class StreamDispatcher implements IStreamDispatcher{
    readonly channel: TextChannel;
    voice_connection: VoiceConnection | undefined;
    player: AudioPlayer | undefined;
    audio: AudioResource | undefined;
    volume_default: number = 50;
    volume: number = 50;
    current_message: Message | undefined = undefined;
    queue: Array<Radio | MusicYoutube>;
    play: boolean = false;
    readyLock: boolean = false;
    queueLock: boolean = false;
    current_audio: MusicYoutube | Radio | undefined = undefined;
    return: number = 0;
    current_time: number = 0;
    whoId: string = "";
    language: Language;

    constructor(channel: TextChannel, voice_connection: VoiceConnection | undefined = undefined, player: AudioPlayer | undefined = undefined, audio: AudioResource | undefined = undefined) {
        this.queue = [];
        this.channel = channel;
        this.voice_connection = voice_connection;
        this.player = player;
        this.audio = audio;
        this.language = LanguageManager.getInstance().getLanguage(channel.guildId);

    }

    public getChannel(): TextChannel | undefined {
        return this.channel;
    }

    public setVoiceConnection(voice_connection: VoiceConnection) {
        if (this.voice_connection === null) {
            voice_connection.on('stateChange', async (oldState, newState) => {
                if (newState.status === VoiceConnectionStatus.Disconnected) {
                    if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                        /*
                            If the WebSocket closed with a 4014 code, this means that we should not manually attempt to reconnect,
                            but there is a chance the connection will recover itself if the reason of the disconnect was due to
                            switching voice channels. This is also the same code for the bot being kicked from the voice channel,
                            so we allow 5 seconds to figure out which scenario it is. If the bot has been kicked, we should destroy
                            the voice connection.
                        */
                        try {
                            await entersState(this.voice_connection, VoiceConnectionStatus.Connecting, 5_000);
                            // Probably moved voice channel
                        } catch {
                            this.voice_connection.destroy();
                            // Probably removed from voice channel
                        }
                    } else if (this.voice_connection.rejoinAttempts < 5) {
                        /*
                            The disconnect in this case is recoverable, and we also have <5 repeated attempts so we will reconnect.
                        */
                        await wait((this.voice_connection.rejoinAttempts + 1) * 5_000);
                        this.voice_connection.rejoin();
                    } else {
                        /*
                            The disconnect in this case may be recoverable, but we have no more remaining attempts - destroy.
                        */
                        this.voice_connection.destroy();
                    }
                } else if (newState.status === VoiceConnectionStatus.Destroyed) {
                    /*
                        Once destroyed, stop the subscription
                    */
                    this.stop();
                } else if (
                    !this.readyLock &&
                    (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
                ) {
                    /*
                        In the Signalling or Connecting states, we set a 20 second time limit for the connection to become ready
                        before destroying the voice connection. This stops the voice connection permanently existing in one of these
                        states.
                    */
                    this.readyLock = true;
                    try {
                        await entersState(this.voice_connection, VoiceConnectionStatus.Ready, 20_000);
                    } catch {
                        if (this.voice_connection.state.status !== VoiceConnectionStatus.Destroyed) this.voice_connection.destroy();
                    } finally {
                        this.readyLock = false;
                    }
                }
            });
        }
        this.voice_connection = voice_connection;

    }


    public getFirstMusicInQueue(): MusicYoutube | Radio | undefined {
        return this.queue.length > 0 ? this.queue.shift() : undefined;
    }

    public getQueue(): Array<MusicYoutube | Radio> {
        return this.queue;
    }

    public getQueueListMessage(member: GuildMember) {
        let page = 0;
        let max_page = Math.round(this.queue.length / 10) === 0 ? 1 : Math.round(this.queue.length / 10);
        const list_embed = new MessageEmbed();
        list_embed.setColor([139, 0, 0]);
        list_embed.setTitle(this.language.getTranslate("music.queue.embed.title", [], "**List des Musique dans la Queue**"));
        list_embed.setDescription(this.getQueueListString(this.channel.guildId, page) + this.language.getTranslate("music.queue.embed.page", [page + 1, max_page], "page(s): &1 / &2"));
        list_embed.setAuthor(Main.getInstance().getClient().user.username, Main.getInstance().getClient().user.avatarURL());
        const filter = i => i.customId === 'next' || i.customId === 'previous';
        this.channel.send({content: `${member}`, embeds: [list_embed], components: [new MessageActionRow().addComponents(new MessageButton().setCustomId("next").setLabel(this.language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"))]}).then(message => {
            const collector = message.createMessageComponentCollector({filter});
            collector.on('collect', async i => {
                const member = i.member;
                if (member instanceof GuildMember) {
                    let max_page = Math.round(this.queue.length / 10) === 0 ? 1 : Math.round(this.queue.length / 10);
                    if (i.customId === 'next') {
                        page++;
                    } else if (i.customId === 'previous') {
                        page--;
                    }
                    if (page < 0) {
                        page = 0;
                    }
                    if (page >= max_page) {
                        page = 0;
                    }
                    const list_embed_buttons = new MessageEmbed();
                    list_embed_buttons.setColor([139, 0, 0]);
                    list_embed_buttons.setTitle(this.language.getTranslate("music.queue.embed.title", [], "**List des Musique dans la Queue**"));
                    list_embed.setDescription(this.getQueueListString(this.channel.guildId, page) + this.language.getTranslate("music.queue.embed.page", [page + 1, max_page], "page(s): &1 / &2"));
                    list_embed_buttons.setAuthor(Main.getInstance().getClient().user.username, Main.getInstance().getClient().user.avatarURL());
                    let row: MessageActionRow = new MessageActionRow().addComponents(new MessageButton().setCustomId("next").setLabel(this.language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    if (page > 0) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(this.language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"),
                            new MessageButton().setCustomId("next").setLabel(this.language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    }
                    if (page > 0 && (page + 1) < max_page) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(this.language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"),
                            new MessageButton().setCustomId("next").setLabel(this.language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    }
                    if (page > 0 && (page + 1) >= max_page) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(this.language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"));
                    }
                    await i.update({content: `${member}`, embeds: [list_embed], components: [row]});
                }
            });
            this.current_message = message;
        });
    }

    public getQueueListString(guilId: string, index: number = 0): string {
        if (this.queue.length <= 0) return this.language.getTranslate("music.queue.empty", [], "Vide%n");
        let text: string = "";
        let i = index > 0 ? index * 10 : 0;
        while (i <= (index > 0 ? index * 10 : 0) + 9) {
            const music: MusicYoutube | Radio | undefined = this.queue[i] ?? undefined;
            if (music !== undefined) {
                text = text + this.language.getTranslate("music.queue.format", [i + 1, music.getName()], "> **&1** - `&2`\n");
            }
            i++;
        }
        return text;
    }

    public addQueue(member: GuildMember, music: MusicYoutube | Radio | Array<MusicYoutube | Radio>): void {
        if (this.queue.length > 99) {
            if (!this.queueLock) {
                this.queueLock = true;
            }
            return;
        } else {
            this.queueLock = false;
        }
        if (this.whoId === ""){
            this.whoId = member.id;
        }
        if (!this.queueLock) {
            if (music instanceof Array){
                music.forEach((value, index) =>{
                    if (index === 0){
                        this.current_audio = value;
                    }
                    this.queue.push(value);
                });
            }else {
                this.queue.push(music);
                this.current_audio = music;
            }
                this.playMusic(member.voice.channel);

        }
    }

    public getVoiceConnection(): VoiceConnection | undefined {
        return this.voice_connection;
    }

    public getPlayer(): AudioPlayer | undefined {
        return this.player;
    }

    public setPlayer(player: AudioPlayer): void {
        if (this.player === undefined) {
            player.on("stateChange",  (oldState, newState) => {
                if (newState.status === AudioPlayerStatus.Idle) {
                     this.ReplayMusic().catch();
                }
            });
            player.on('error',  () => {});
        }
        this.player = player;
    }

    public getAudioSource(): AudioResource | undefined {
        return this.audio;
    }

    public setAudioSource(audio: AudioResource): void {
        this.audio = audio;
    }


    public async playMusic(channel: VoiceChannel | StageChannel): Promise<void> {
        const guildId = channel.guildId;
        let channelvoice: VoiceConnection | undefined = this.getVoiceConnection();
        if (channelvoice === undefined) {
            this.setVoiceConnection(joinVoiceChannel({
                channelId: channel.id,
                guildId: guildId,
                // @ts-ignore
                adapterCreator:  channel.guild.voiceAdapterCreator,
                selfDeaf: true
            }));
            channelvoice = this.getVoiceConnection();
        }
        if (!this.play) {
            let audio = this.getFirstMusicInQueue();
            let verification: number = 0;
            while(audio === undefined) {
                if (verification >= 9) {this.stop();break;}
                audio = this.getFirstMusicInQueue();
                verification++;
            }
            if (audio !== undefined) {
                try {
                    await entersState(channelvoice, VoiceConnectionStatus.Ready, 30_000);
                    let player = this.getPlayer();
                    if (player === undefined) {
                        this.setPlayer(createAudioPlayer({behaviors: {noSubscriber: NoSubscriberBehavior.Pause}}))
                        player = this.getPlayer();
                    }
                    const playaudio = this.getAudioFluxMusic(audio);
                    if (playaudio !== undefined) {
                        this.setAudioSource(playaudio);
                        player.play(playaudio);
                        channelvoice.subscribe(player);
                        this.sendMessagePlayMusique(audio);
                        this.play = true;
                    }
                } catch (error) {
                    this.stop();
                }
            }
        } else {
            if (this.current_audio !== undefined) {
                this.sendMessagePlayMusique(this.current_audio, "add");
                this.current_audio = undefined;
            }
        }
    }

    public async ReplayMusic(): Promise<void> {
        this.deteleMessage()
        if (this.voice_connection === undefined) {
            this.stop();
            return;
        }
        if (this.queue.length <= 0) {
            this.stop();
            return;
        }

        let audio = this.getFirstMusicInQueue();
        let verification: number = 0;
        while(audio === undefined) {
            if (verification >= 9) {
                break;
            }
            audio = this.getFirstMusicInQueue();
            verification++;
        }
        if (audio !== undefined) {
            try {
                await entersState(this.voice_connection, VoiceConnectionStatus.Ready, 30_000)
                if (this.player === undefined) return;
                const playaudio = this.getAudioFluxMusic(audio);
                if (playaudio !== undefined) {
                    this.audio = playaudio;
                    this.player.stop()
                    this.player.play(this.audio);
                    this.voice_connection.subscribe(this.player);
                    this.sendMessagePlayMusique(audio);
                    this.play = true;
                }
            } catch (error) {
                this.stop();
            }
        }
    }

    public sendMessagePlayMusique(audio: Radio | MusicYoutube, types: "add" | "play" | "stop" = "play") {
        if (this.channel !== undefined) {
            if (types == "play") {
                const row = new MessageActionRow().addComponents(
                    new MessageButton().setCustomId("unmute").setLabel("🔊").setStyle("DANGER"),
                    new MessageButton().setCustomId("skip").setLabel("⏭").setStyle("SECONDARY"),
                    new MessageButton().setCustomId("pauseorplay").setLabel("⏯").setStyle("PRIMARY"),
                    new MessageButton().setCustomId("mute").setLabel("🔇").setStyle("DANGER"));
                const filter = i => i.customId === 'skip' || i.customId === 'pauseorplay' || i.customId === 'unmute' || i.customId === 'mute';
                const embed = new MessageEmbed();
                embed.setColor([139, 0, 0]);
                if (audio instanceof Radio) {
                    let name = audio.getName();
                    name = name.charAt(0).toUpperCase() + name.slice(1)
                    embed.setTitle(name);
                    embed.addField(this.language.getTranslate("music.emebed.radio.slogan", [], "**Slogan**"), "`" + audio.getDescription() + "`");
                    embed.setThumbnail(audio.getIconUrl());
                    this.channel.send({embeds: [embed], components: [row]}).then(message => {
                        const collector = message.createMessageComponentCollector({filter});
                        collector.on('collect', async i => {
                            const member = i.member;
                            if (member instanceof GuildMember) {
                                if (member.voice.channel?.id == member.guild.me.voice.channel?.id) {

                                    if (i.customId === 'skip') {
                                        let hasrole: boolean = false;
                                        member.roles.cache.map((role) => {
                                            if (role.name.toLowerCase() == "dj") {
                                                hasrole = true;
                                                return;
                                            }
                                        });
                                        if (member.permissions.has("ADMINISTRATOR") || hasrole || this.whoId === member.id) {
                                            this.current_message = undefined;
                                            await i.update({components: []}).catch(() => {});
                                            await i.deleteReply().catch(() => {});
                                            this.SkipMusic();
                                        }
                                    }
                                }

                                if (i.customId === 'pauseorplay') {
                                    this.PauseorPlay();
                                    await i.update({components: [row]}).catch(() => {});
                                }
                                if (i.customId === 'unmute') {
                                    this.setVolumePlayer(50);
                                    await i.update({components: [row]}).catch(() => {});
                                }
                                if (i.customId === 'mute') {
                                    this.setVolumePlayer(0);
                                    await i.update({components: [row]}).catch(() => {});
                                }
                            }
                        });
                        this.current_message = message;
                    });
                } else if (audio instanceof MusicYoutube) {
                    embed.setTitle(audio.getName());
                    embed.setURL(audio.getUrl());
                    embed.addField(this.language.getTranslate("music.emebed.youtube.creator", [], "**Creator(s)**"), audio.getCreator(), false);
                    embed.addField(this.language.getTranslate("music.emebed.youtube.like", [], "**Like**"), audio.getLikes().toString(), true);
                    embed.addField(this.language.getTranslate("music.emebed.youtube.dislike", [], "**DisLike**"), audio.getDisLikes().toString(), true);
                    embed.addField(this.language.getTranslate("music.emebed.youtube.duree", [], "**Durée**"), audio.getTimeString(), true);
                    embed.addField(this.language.getTranslate("music.emebed.youtube.description", [], "**Description**"), audio.getDescription(), false);
                    embed.setThumbnail(audio.getCreatorIcon());
                    embed.setImage(audio.getIconUrl());
                    this.channel.send({embeds: [embed], components: [row]}).then(message => {
                        setTimeout(() => message.delete(), audio.getTime() * 2000);
                        const collector = message.createMessageComponentCollector({
                            filter,
                            time: audio.getTime() * 1000
                        });
                        collector.on('collect', async i => {
                            const member = i.member;
                            if (member instanceof GuildMember) {
                                if (member.voice.channel?.id == member.guild.me.voice.channel?.id) {

                                    if (i.customId === 'skip') {
                                        let hasrole: boolean = false;
                                        member.roles.cache.map((role) => {
                                            if (role.name.toLowerCase() == "dj") {
                                                hasrole = true;
                                                return;
                                            }
                                        });
                                        if (member.permissions.has("ADMINISTRATOR") || hasrole || this.whoId === member.id) {
                                            this.current_message = undefined;
                                            await i.update({components: []}).catch(() => {});
                                            await i.deleteReply().catch(() => {});
                                            this.SkipMusic();
                                        }
                                    }
                                }else {
                                    await i.update({components: []}).catch(() => {});
                                    await i.deleteReply().catch(() => {});
                                }

                                if (i.customId === 'pauseorplay') {
                                    this.PauseorPlay();
                                    await i.update({components: [row]}).catch(() => {});
                                }
                                if (i.customId === 'unmute') {
                                    this.setVolumePlayer(50);
                                    await i.update({components: [row]}).catch(() => {});
                                }
                                if (i.customId === 'mute') {
                                    this.setVolumePlayer(0);
                                    await i.update({components: [row]}).catch(() => {});
                                }
                            }
                        });
                        this.current_message = message;
                    });

                }
            } else if (types == "add") {
                const embed = new MessageEmbed();
                embed.setColor([139, 0, 0]);
                embed.setTitle(this.language.getTranslate("music.add.queue", [], "Vous avez ajoutes dans la Queue 🛒"));
                if (audio instanceof Radio) {
                    let name = audio.getName();
                    name = name.charAt(0).toUpperCase() + name.slice(1)
                    embed.addField(this.language.getTranslate("music.emebed.radio.add", [], "**Radio**"), name);
                } else if (audio instanceof MusicYoutube) {
                    embed.addField(this.language.getTranslate("music.emebed.youtube.title", [], "**Titre**"), audio.getName());
                    embed.addField(this.language.getTranslate("music.emebed.youtube.creator", [], "**Creator(s)**"), audio.getCreator());
                }
                this.channel.send({embeds: [embed]}).catch(() => {});
            }
        }
    }


    public getAudioFluxMusic(audio: Radio | MusicYoutube): AudioResource<Radio | MusicYoutube> | undefined {
        let playaudio: AudioResource<Radio | MusicYoutube> | undefined = undefined;
        if (audio instanceof Radio) {
            playaudio = audio.getFluxAudio();
            playaudio.volume?.setVolume(this.volume_default > 0 ? this.volume_default / 100 : 0);
        } else if (audio instanceof MusicYoutube) {
            playaudio = audio.getVideo()
            playaudio.volume?.setVolume(this.volume_default > 0 ? this.volume_default / 100 : 0);
        }
        return playaudio;
    }


    public SkipMusic() {

        this.player.stop(true);
        if (this.channel.guild.me?.voice.channel === null) {
            // @ts-ignore
            this.ReplayMusic().then(() => {});
            //this.ReplayMusic().catch()
        }
    }

    public deteleMessage(): void {
        if (this.current_message instanceof Message) {
            if (!this.current_message.deleted && this.current_message.deletable) {
                this.current_message.edit({components: [], content: "",embeds: []}).then(  message => {
                    console.log(message.deleted);
                    if (!message.deleted && message.deletable) {
                         message.delete().catch(() => {});
                    }
                    this.current_message = undefined;
                }).catch(() => this.current_message = undefined)
            }
        }
    }

    public ClearQueue(): void {
        this.queue = [];
        this.queueLock = false;
    }


    public getVolumeDefault(): number {
        return this.volume_default;
    }

    public setVolumeDefault(volume: number): void {
        this.volume_default = volume;
    }

    public getVolume(): number{
        return this.volume;
    }

    public setVolume(volume: number): void {
        this.volume = volume;
    }


    public setVolumePlayer(volume: number): void {
        this.setVolume(volume);
        if (this.audio === undefined) return;
        this.audio.volume?.setVolume(this.volume > 0 ? this.volume / 100 : 0);
    }

    public setReturnMusique(value: number = 0) {
        this.return = value;
    }

    public RemoveRetunrMusique(value: number = 0) {
        this.return -= value;
        if (this.return < 0) {
            this.return = 0;
        }
    }

    public addRetunrMusique(value: number = 0) {
        this.return += value;
        if (this.return > 50) {
            this.return = 50
        }
    }


    public PauseorPlay(): void {
        const player = this.player;
        if (player === undefined) return;
        if (player.state.status == AudioPlayerStatus.Paused) {
            player.unpause()
        } else if (player.state.status == AudioPlayerStatus.Playing) {
            player.pause()
        }
    }

    private stop(): void {
        this.play = false;
        this.ClearQueue();
        this.whoId = "";
        this.player?.stop(true);
        this.voice_connection?.destroy();
        this.player = undefined;
        this.voice_connection = undefined;
        QueueMusicManager.getInstance().removeQueueMusique(this.channel.guildId);

    }

}