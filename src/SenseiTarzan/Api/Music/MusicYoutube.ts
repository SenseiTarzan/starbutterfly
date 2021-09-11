import {videoInfo} from "ytdl-core";
import {Readable} from "stream";
import {AudioResource, createAudioResource} from "@discordjs/voice";
import Main from "../../Main";

export  default  class MusicYoutube {
    private readonly name: string;
    private readonly url: string;
    private readonly info: object;
    private readonly time: number = 0;
    private readonly likes: number;
    private readonly dislikes: number;
    private readonly description: string;
    private readonly icon: string;
    private readonly creator: string;
    private readonly creatorIcon: string;
    private readonly video: Readable;
    private readonly id: string;

    constructor(name: string, url: string, info: videoInfo, video: Readable) {
        this.id = Main.UUID4();
        this.name = name;
        this.url = url;
        this.info = info;
        this.time = parseInt(info.videoDetails.lengthSeconds);
        this.likes = info.videoDetails.likes ?? 0;
        this.dislikes = info.videoDetails.dislikes ?? 0;
        this.description = info.videoDetails.description;
        this.icon = info.videoDetails.thumbnails[0] !== undefined ? info.videoDetails.thumbnails[0].url : "";
        this.creator = info.videoDetails.author.name;
        this.creatorIcon = info.videoDetails.author.thumbnails[0] !== undefined ? info.videoDetails.author.thumbnails[0].url : "";
        this.video = video;
    }

    public getId(): string{
        return this.id;
    }

    /**
     *  Donne le nom de la Musique
     */
    public getName(): string {
        return this.name;
    }

    /**
     * donnes son url a la video
     */
    public getUrl(): string {
        return this.url;
    }

    /**
     * donne un object tout les info de la musique
     */
    public getRawInfo(): object {
        return this.info;
    }

    public getLikes(): number {
        return this.likes;
    }

    public getDisLikes(): number {
        return this.dislikes;
    }

    /**
     * donne la description de la video regarder
     */
    public getDescription(): string {
        return this.description;
    }

    /**
     * donne la minature de la video
     */
    public getIconUrl(): string {
        return this.icon;
    }

    /**
     * Donne le nom du createur de la video
     */
    public getCreator(): string {
        return this.creator;
    }

    /**
     * Donne le avatar du createur de la video
     */
    public getCreatorIcon(): string {
        return this.creatorIcon;
    }

    public getVideo(): AudioResource<null> {
        return createAudioResource(this.video);
    }

    public getTime() : number{
        return this.time;
    }

// if (resource.ended) return void this.emit("error", new PlayerError("Cannot play a resource that has already ended.") as unknown as AudioPlayerError);
    public getTimeString(): string {
        const time = {
            'h':
                ~~(this.time / 3600),
            'i':
                ~~((this.time % 3600) / 60),
            's':
                ~~(this.time % 60)
        };
        return (time.h < 10 ? "0" : "") + time.h + ":" + (time.i < 10 ? "0" : "") + time.i + ":" + (time.s < 10 ? "0" : "") + time.s.toString()
    }
}