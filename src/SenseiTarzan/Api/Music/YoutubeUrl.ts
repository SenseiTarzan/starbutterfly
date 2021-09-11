import * as ytdl from "ytdl-core";
import MusicYoutube from "./MusicYoutube";
export  default  class YoutubeUrl {
    private readonly name_or_url: string;

    constructor(name_or_url: string) {
        this.name_or_url = name_or_url;
    }

    public isUrlYoutube(): boolean {
        return ytdl.validateURL(this.name_or_url);
    }

    public async SearchMusic(): Promise<MusicYoutube | null>{
        if (this.isUrlYoutube()) {
            const infoVideo = await ytdl.getBasicInfo(this.name_or_url);
            return  new MusicYoutube(infoVideo.videoDetails.title,this.name_or_url,infoVideo,await ytdl(this.name_or_url, {filter: "audioandvideo", quality: 'highestaudio'}))
        }
        return  null;
    }
}