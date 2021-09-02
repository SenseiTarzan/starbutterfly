import Main from "../../Main";
import Config from "../../Utils/Config";
import Language from "./Language";
import {Collection, Collector} from "discord.js";

interface LanguageConfig{
    mini: string,
    emote: string,
    config: string
    default: boolean | undefined
}
export default class LanguageAPI {
    private config: Config;
    private languages: Collection<string, Language> = new Collection<string, Language>();
    private data: Config;

    constructor(client: Main) {
        this.config = new Config(client.getDataFolder() + "Language/config.yml", {
            "English": {
                "mini": "en",
                "emote": "🇬🇧",
                "config": "Language/english.yml"
            },
            "Francais": {
                "mini": "fr",
                "emote": "🇫🇷",
                "config": "Language/french.yml",
                "default": true
            }
        });
        this.data = new Config(client.getDataFolder() + "Language/data.yml", {});
        this.loadLanguage();
    }

    public loadLanguage(): void{
        for (const [keys, values] of Object.entries(this.config.getAll())){
            if (values["default"] !== undefined && values["default"]){
                this.registerLanguage(new Language(keys,values["mini"],values["emote"],values["config"]))
                this.registerLanguage(new Language(keys,"default",values["emote"],values["config"]))
            }
            this.registerLanguage(new Language(keys,values["mini"],values["emote"],values["config"]))
        }
    }


    public getLanguageUser(userid: string){
        return this.data.get(userid,"default");
    }

    public setLanguageUser(userid: string,language: string){
       this.data.set(userid,language);
        this.data.save();
    }

    public registerLanguage(language: Language) {
        this.languages.set(language.getMini(), language);
    }

    public existeLanguage(language: string): boolean {
        return this.languages.has(language);
    }

    public getLanguage(userid: string): Language {
        return this.languages.get(this.getLanguageUser(userid));
    }
}