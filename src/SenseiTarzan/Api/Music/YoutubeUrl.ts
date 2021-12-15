import * as ytdl from "ytdl-core";
import MusicYoutube from "./MusicYoutube";

export  default  class YoutubeUrl {

    public static  isUrlYoutube(name_or_url: string): boolean {
        return ytdl.validateURL(name_or_url);
    }

    public static async SearchMusic(name_or_url: string): Promise<MusicYoutube | null>{
        if (this.isUrlYoutube(name_or_url)) {
            const infoVideo = await ytdl.getBasicInfo(name_or_url);
            return  new MusicYoutube(infoVideo.videoDetails.title,name_or_url,infoVideo,await ytdl(name_or_url, { filter: "audioonly", highWaterMark: 1 << 25}))
        }
        return  null;
    }
}