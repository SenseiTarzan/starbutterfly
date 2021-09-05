import fetch from "node-fetch";
import Config from "../Utils/Config";
import Main from "../Main";

interface Vote{
    guildId: string,
    channelId: string,
    token: string,
    time: string //hh:mm:ss,
    role: string
}
export class VoteAPI {
    private data: Config;
    private config: Config;

    constructor(client: Main) {
        this.config = new Config(client.getDataFolder() + "Vote/config.yml");
        this.data = new Config(client.getDataFolder() + "Vote/data.yml");
    }

    public getServerData(type: string, guild: string): Vote | undefined {
        return this.data.get(type, {})[guild] ?? undefined;
    }

    public getServerAllType(type:string): Object {
        return this.data.get(type);
    }

    public getTokenServer(type: string, guild: string): string |undefined{
        const data = this.getServerData(type,guild);
        return data !== undefined ? data["token"] : undefined;
    }

    public setServerData(type: string, guild: string, data: Vote): void {
        const types = this.data.get(type, {});
        types[guild] = data;
        this.data.set(type, types);
        this.data.save();
    }
    public RemoveServerData(type: string, guild: string): void {
        this.data.removeNested(type + "." + guild);
        this.data.save();
    }

    public getModalUrlVote(type: string, token: string): string | undefined {
        const url: string = this.config.get(type, undefined);
        return url !== undefined ? url.replace("{token}", token) : undefined;
    }

    public setModalUrlVote(type: string, modal: string): boolean {
        if (modal.includes("{token}")) {
            this.config.set(type, modal);
            this.config.save();
            return true;
        }
        return false;
    }
}