import Config from "../../Utils/Config";
import Main from "../../Main";
import {Collection} from "discord.js";

export default class Language {
    private name: string;
    private mini: string;
    private emote: string;
    private config: Config;
    private custom_language: Collection<string, Config> = new Collection<string, Config>();

    constructor(name: string, mini: string, emote: string, filename: string) {
        console.log(name)
        this.name = name;
        this.mini = mini;
        this.emote = emote;
        this.config = new Config(Main.getInstance().getDataFolder() + filename, {});
    }

    public addCustomLanguage(guild: string){
        this.custom_language.set(guild,new Config(Main.getInstance().getDataFolder() + "Language/data/guilds/"+ guild + "/" + this.getName().toLowerCase() +".yml"));
    }

    public getCustomLanguage(guild: string): Config | undefined {
        return this.custom_language.get(guild);
    }
    public removeCustomLanguage(guild: string){
        this.custom_language.delete(guild);
    }

    public getName(): string {
        return this.name;
    }

    public getMini(): string {
        return this.mini;
    }

    public getEmote(): string {
        return this.emote;
    }

    public Config(): Config{
        return this.config;
    }

    public getRawMessage(guild: string, message: string){
        const custom_language = this.getCustomLanguage(guild);
        if (custom_language !== undefined){
            custom_language.reload();
        }
        return  custom_language !== undefined ? (custom_language.getNested(message) !== undefined ? custom_language.getNested(message)  : this.Config().getNested(message)) : this.Config().getNested(message);
    }

    public getTranslate(guild: string,message: string, balise: any[] = [], defaults: any = "no found translate") {
        this.config.reload();
        let msg = this.getRawMessage(guild,message);

        if (msg === undefined ) {
            this.config.setNested(message, defaults);
            this.config.save();
            msg = defaults;
        }

        if (typeof msg === "string") {
            while (msg.includes("%n")) {
                msg = msg.replace("%n", "\n");
            }
            if (balise.length > 0) {
                balise.forEach((value, i) => {
                    msg = msg.replace(`&${i + 1}`, value);

                });
            }
        }

        return msg;
    }
}