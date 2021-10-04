import {AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, entersState, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus} from "@discordjs/voice";
import Main from "../Main";
import {GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, StageChannel, TextChannel, VoiceChannel} from "discord.js";
import {promisify} from 'util';
import Radio from "../Api/Radio/Radio";
import MusicYoutube from "../Api/Music/MusicYoutube";
import Language from "../Api/language/Language";
import YoutubeUrl from "../Api/Music/YoutubeUrl";
const wait = promisify(setTimeout);

interface  IStreamDispatcher{
     readonly channel: TextChannel,
     voice_connection: VoiceConnection | undefined,
     player: AudioPlayer | undefined,
     audio: AudioResource | undefined,
     volume_default: number,
     current_message: Message | undefined,
     queue: Array<Radio | MusicYoutube>,
     queue_back: Array<String>;
     play: boolean,
     readyLock: boolean ,
     queueLock: boolean ,
     current_audio: MusicYoutube | Radio | undefined,
     return: number,
     current_time: number,
     whoId: string
}

export  default  class StreamDispatcher implements IStreamDispatcher{
     readonly channel: TextChannel;
     voice_connection: VoiceConnection | undefined;
     player: AudioPlayer | undefined;
     audio: AudioResource | undefined;
     volume_default: number = 50;
     current_message: Message | undefined = undefined;
     queue: Array<Radio | MusicYoutube>;
     queue_back: Array<string>;
     play: boolean = false;
     readyLock: boolean = false;
     queueLock: boolean = false;
     current_audio: MusicYoutube | Radio | undefined = undefined;
     return: number = 0;
     current_time: number = 0;
     whoId: string = "";

    constructor(channel: TextChannel, voice_connection: VoiceConnection | undefined = undefined, player: AudioPlayer | undefined = undefined, audio: AudioResource | undefined = undefined) {
        this.queue = [];
        this.queue_back = [];
        this.channel = channel;
        this.voice_connection = voice_connection;
        this.player = player;
        this.audio = audio;

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
        const language: Language = Main.getInstance().getLanguageManager().getLanguage(this.channel.guildId);

        const list_embed = new MessageEmbed();
        list_embed.setColor([139, 0, 0]);
        list_embed.setTitle(language.getTranslate("music.queue.embed.title", [], "**List des Musique dans la Queue**"));
        list_embed.setDescription(this.getQueueListString(this.channel.guildId, page) + language.getTranslate("music.queue.embed.page", [page + 1, max_page], "page(s): &1 / &2"));
        list_embed.setAuthor(Main.getInstance().getClient().user.username, Main.getInstance().getClient().user.avatarURL());
        const filter = i => i.customId === 'next' || i.customId === 'previous';
        this.channel.send({content: `${member}`, embeds: [list_embed], components: [new MessageActionRow().addComponents(new MessageButton().setCustomId("next").setLabel(language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"))]}).then(message => {
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
                    list_embed_buttons.setTitle(language.getTranslate("music.queue.embed.title", [], "**List des Musique dans la Queue**"));
                    list_embed.setDescription(this.getQueueListString(this.channel.guildId, page) + language.getTranslate("music.queue.embed.page", [page + 1, max_page], "page(s): &1 / &2"));
                    list_embed_buttons.setAuthor(Main.getInstance().getClient().user.username, Main.getInstance().getClient().user.avatarURL());
                    let row: MessageActionRow = new MessageActionRow().addComponents(new MessageButton().setCustomId("next").setLabel(language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    if (page > 0) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"),
                            new MessageButton().setCustomId("next").setLabel(language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    }
                    if (page > 0 && (page + 1) < max_page) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"),
                            new MessageButton().setCustomId("next").setLabel(language.getTranslate("music.queue.buttons.next", [], "Suivant")).setStyle("DANGER"));
                    }
                    if (page > 0 && (page + 1) >= max_page) {
                        row = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setLabel(language.getTranslate("music.queue.buttons.previous", [], "Précédente")).setStyle("DANGER"));
                    }
                    await i.update({content: `${member}`, embeds: [list_embed], components: [row]});
                }
            });
            this.current_message = message;
        });
    }

    public getQueueListString(guilId: string, index: number = 0): string {
        const language: Language = Main.getInstance().getLanguageManager().getLanguage(guilId);
        if (this.queue.length <= 0) return language.getTranslate("music.queue.empty", [], "Vide%n");
        let text: string = "";
        let i = index > 0 ? index * 10 : 0;
        while (i <= (index > 0 ? index * 10 : 0) + 9) {
            const music: MusicYoutube | Radio | undefined = this.queue[i] ?? undefined;
            if (music !== undefined) {
                text = text + language.getTranslate("music.queue.format", [i + 1, music.getName()], "> **&1** - `&2`\n");
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
                adapterCreator: channel.guild.voiceAdapterCreator,
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
                        if (audio instanceof MusicYoutube) {
                            this.queue_back.push(audio.getUrl());
                        } else if (audio instanceof Radio) {
                            this.queue_back.push(audio.getName());
                        }
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
        if (this.return > 0 && this.queue.length <= 0){
            this.regenQueueWithBack();
        }else if (this.queue.length <= 0 && this.return <= 0) {
            this.deteleMessage();
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
                    if (audio instanceof MusicYoutube) {
                        this.queue_back.push(audio.getUrl());
                    } else if (audio instanceof Radio) {
                        this.queue_back.push(audio.getName());
                    }
                }
            } catch (error) {
                this.stop();
            }
        }
    }

    public sendMessagePlayMusique(audio: Radio | MusicYoutube, types: "add" | "play" | "stop" = "play") {
        if (this.channel !== undefined) {
            const language = Main.getInstance().getLanguageManager().getLanguage(this.channel.guildId);
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
                    embed.addField(language.getTranslate("music.emebed.radio.slogan", [], "**Slogan**"), "`" + audio.getDescription() + "`");
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
                                            this.SkipMusic(member,member.permissions.has("ADMINISTRATOR") || hasrole);
                                        }
                                    }
                                }

                                if (i.customId === 'pauseorplay') {
                                    this.PauseorPlay();
                                    await i.update({components: [row]}).catch(() => {});
                                }
                                if (i.customId === 'unmute') {
                                    this.setVolumePlayer(this.getVolumeDefault());
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
                    embed.addField(language.getTranslate("music.emebed.youtube.creator", [], "**Creator(s)**"), audio.getCreator(), false);
                    embed.addField(language.getTranslate("music.emebed.youtube.like", [], "**Like**"), audio.getLikes().toString(), true);
                    embed.addField(language.getTranslate("music.emebed.youtube.dislike", [], "**DisLike**"), audio.getDisLikes().toString(), true);
                    embed.addField(language.getTranslate("music.emebed.youtube.duree", [], "**Durée**"), audio.getTimeString(), true);
                    embed.addField(language.getTranslate("music.emebed.youtube.description", [], "**Description**"), audio.getDescription(), false);
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
                                            this.SkipMusic(member);
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
                                    this.setVolumePlayer(this.getVolumeDefault());
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
                embed.setTitle(language.getTranslate("music.add.queue", [], "Vous avez ajoutes dans la Queue 🛒"));
                if (audio instanceof Radio) {
                    let name = audio.getName();
                    name = name.charAt(0).toUpperCase() + name.slice(1)
                    embed.addField(language.getTranslate("music.emebed.radio.add", [], "**Radio**"), name);
                } else if (audio instanceof MusicYoutube) {
                    embed.addField(language.getTranslate("music.emebed.youtube.title", [], "**Titre**"), audio.getName());
                    embed.addField(language.getTranslate("music.emebed.youtube.creator", [], "**Creator(s)**"), audio.getCreator());
                }
                this.channel.send({embeds: [embed]}).catch(() => {});
            }
        }
    }


    public getAudioFluxMusic(audio: Radio | MusicYoutube): AudioResource<Radio | MusicYoutube> | undefined {
        let playaudio: AudioResource<Radio | MusicYoutube> | undefined = undefined;
        if (audio instanceof Radio) {
            playaudio = audio.getFluxAudio();
        } else if (audio instanceof MusicYoutube) {
            playaudio = audio.getVideo()
        }
        return playaudio;
    }


    public SkipMusic(member: GuildMember | null | undefined = null, hasperm: boolean = false) {
        this.player.stop(true);
    }

    public deteleMessage(): void {
        if (this.current_message instanceof Message) {
            if (!this.current_message.deleted && this.current_message.deletable) {
                this.current_message.edit({components: [], content: "",embeds: []}).then(  message => {
                    if (message.deleted && message.deletable) {
                         message.delete().catch(() => {});
                    }
                    this.current_message = undefined;
                }).catch(() => this.current_message = undefined)
            }
        }
    }

    public  regenQueueWithBack(): void {
        if (this.return > 0 && this.queue.length <= 0 && this.queue_back.length > 0) {
            const time = ~~(Date.now() / 1000);
            if (this.current_time <= time) {
                let i = 0;
                while (i <= this.queue_back.length - 1){
                    const music: string | undefined = this.queue_back[i];
                    if (music !== undefined) {
                        if (Main.getInstance().getRadioManager().existRadio(music)) {
                            this.queue.push(Main.getInstance().getRadioManager().getRadioData(music));
                        } else {
                            YoutubeUrl.SearchMusic(music).then(music_1 => {
                                if (music_1 !== null) this.queue.push(music_1);
                            })
                        }
                    }
                    i++;
                }

                this.ClearQueue(false);
                this.RemoveRetunrMusique(1);
                this.ReplayMusic();
                this.current_time = ~~(Date.now() / 1000) + 1;
            }
        } else {
            this.stop(true);
        }
    }

    public ClearQueue(cache: boolean = true): void {
        if (cache) {this.queue = [];}
        this.queueLock = false;
        this.queue_back = [];
    }


    public getVolumeDefault(): number {
        return this.volume_default;
    }


    public setVolumePlayer(volume: number): void {
        this.volume_default = volume;
        if (this.audio === undefined) return;
        this.audio.volume?.setVolume(this.volume_default > 0 ? this.volume_default / 100 : 0);
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

    private stop(force: boolean = false): void {
        this.play = false;
        if (this.return > 0 && !force){
            this.ReplayMusic().catch(() => {});
            return;
        }
        this.ClearQueue();
        if (this.return <= 0 || force) {
            this.return = 0;
            this.whoId = "";
            this.player?.stop(true);
            this.voice_connection?.destroy()
            this.voice_connection = undefined;
        }
    }

}