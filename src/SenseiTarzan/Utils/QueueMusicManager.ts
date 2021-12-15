import Radio from "../Api/Radio/Radio";
import MusicYoutube from "../Api/Music/MusicYoutube";
import {BitFieldResolvable, Collection, GuildMember, TextChannel,} from "discord.js";
import Main from "../Main";
import YoutubeUrl from "../Api/Music/YoutubeUrl";
import {StreamDispatcher} from "./StreamDispatcher ";

export type ActionTypeResolvable = BitFieldResolvable<ActionType, bigint>;

export type ActionType = | 'start' | 'stop';
export type PlayTypeResolvable = BitFieldResolvable<PlayType, bigint>;

export type PlayType = | 'youtube' | 'radio';

interface QueueMusiqueMapInterface{
    status: ActionTypeResolvable,
    whoId: string,
    stream_dispatcher: StreamDispatcher |undefined
}

export default class QueueMusicManager {
    private queuebyguild: Collection<string, QueueMusiqueMapInterface>;
    private main: Main;
    private static instance: QueueMusicManager;

    constructor(main: Main) {
        this.main = main;
        this.queuebyguild = new Collection<string, QueueMusiqueMapInterface>();
        QueueMusicManager.instance = this;
    }
    public static getInstance(): QueueMusicManager{
        return this.instance;
    }
    public getQueueMusique(guildId: string): QueueMusiqueMapInterface | undefined {
        return this.queuebyguild.get(guildId);
    }

    public async addQueueMusique(member: GuildMember, channel: TextChannel, name_or_url: string, type_music: PlayTypeResolvable = "youtube") {
        if (member?.voice.channel !== null) {
            let music: Radio | MusicYoutube | undefined | null = null;
            let queue: QueueMusiqueMapInterface | undefined = this.getQueueMusique(channel.guildId);
            if (type_music == "radio") {
                if (this.main.getRadioManager().existRadio(name_or_url)) {
                    music = this.main.getRadioManager().getRadioData(name_or_url);
                }

                if (music === undefined || music === null) return;
                if (queue === undefined) {
                    queue = {
                        status: "start",
                        whoId: member.id,
                        stream_dispatcher: new StreamDispatcher(channel)
                    }
                    this.setQueueMusique(channel.guildId, queue);
                }
                this.getStreamDispatcher(channel.guildId)?.addQueue(member, music);
            } else if (type_music == "youtube") {
                music = await YoutubeUrl.SearchMusic(name_or_url);
                if (music === undefined || music === null) return;
                if (queue === undefined) {
                    queue = {
                        status: "start",
                        whoId: member.id,
                        stream_dispatcher: new StreamDispatcher(channel)
                    }
                    this.setQueueMusique(channel.guildId, queue);
                }
                this.getStreamDispatcher(channel.guildId)?.addQueue(member, music);

            }

        }
    }


    public setQueueMusique(guildId: string, queue: QueueMusiqueMapInterface) {
        this.queuebyguild.set(guildId, queue);
    }

    public removeQueueMusique(guildId: string) {
        if (this.queuebyguild.has(guildId)){
            this.queuebyguild.delete(guildId);
        }
    }


    public getVolumeDefault(guildId: string): number | undefined {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) return streamAudio.getVolumeDefault();
        return 50;
    }

    public getQueueListMessage(guildId: string, member: GuildMember | null): void {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null && member !== null) streamAudio.getQueueListMessage(member);
    }

    public getStreamDispatcher(guildId: string): StreamDispatcher | undefined {
        const queue = this.getQueueMusique(guildId);
        return queue === undefined ? null : queue.stream_dispatcher;
    }

    public PauseorPlay(guildId: string): void {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) streamAudio.PauseorPlay();
    }

    public setVolumePlayer(guildId: string, volume: number, member: GuildMember | null | undefined = null, hasperm: boolean = false): boolean {
        const streamAudio = this.getStreamDispatcher(guildId);

        if (streamAudio === null) {
            return false;
        }
        if (member !== null && member !== undefined) {
            if (streamAudio.whoId !== member.id || !hasperm) {
                return false;
            }
            streamAudio.setVolumePlayer(volume);
        } else {
            streamAudio.setVolumePlayer(volume);
        }

        return true;
    }
    public setVolumeDefaultPlayer(guildId: string, volume: number, member: GuildMember | null | undefined = null, hasperm: boolean = false): boolean {
        const streamAudio = this.getStreamDispatcher(guildId);

        if (streamAudio === null) {
            return false;
        }
        if (member !== null && member !== undefined) {
            if (streamAudio.whoId !== member.id || !hasperm) {
                return false;
            }
            streamAudio.setVolumeDefault(volume);
        } else {
            streamAudio.setVolumeDefault(volume);
        }

        return true;
    }


    public setReturnMusique(guildId: string, value: number = 0): void {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) streamAudio.setReturnMusique(value);
    }

    public AddReturnMusique(guildId: string, value: number = 0): void {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) streamAudio.addRetunrMusique(value);
    }

    public RemoveReturnMusique(guildId: string, value: number = 0): void {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) streamAudio.RemoveRetunrMusique(value);
    }

    public SkipMusic(guildId: string, member: GuildMember | null | undefined = null, hasperm: boolean = false): boolean {
        const queueMusique = this.getQueueMusique(guildId);
        if (queueMusique !== null) {
            const streamAudio = queueMusique.stream_dispatcher;
            if (streamAudio !== null) {
                if (member !== null && member !== undefined) {
                    if (queueMusique.whoId === member.id || hasperm) {
                        streamAudio.SkipMusic();
                        return true;
                    }
                } else {
                    streamAudio.SkipMusic();
                    return true;
                }
            }
        }
        return false;
    }

    public deteleMessage(guildId: string) {
        const streamAudio = this.getStreamDispatcher(guildId);
        if (streamAudio !== null) streamAudio.deteleMessage();
    }

}