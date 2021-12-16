import Main from "../../Main";
import Config from "../../Utils/Config";
import Language from "./Language";
import {Collection} from "discord.js";


export default class LanguageManager {
    private config: Config;
    private languages: Collection<string, Language> = new Collection<string, Language>();
    private data: Config;
    private static  instance: LanguageManager;

    constructor(client: Main) {
        LanguageManager.instance = this;
        this.config = new Config(client.getDataFolder() + "Language/config.yml", {
            "English": {
                "mini": "en",
                "emote": "🇬🇧",
                "config": "Language/english.yml"
            },
            "Francais": {
                "mini": "fr",
                "emote": "🇫🇷",
                "config": "Language/francais.yml",
                "default": true
            }
        });
        this.data = new Config(client.getDataFolder() + "Language/data.yml", {});
        this.loadLanguage();
        this.loadLanguageGuild();

    }
    public static getInstance(): LanguageManager{
        return this.instance;
    }

    public loadLanguage(): void{
        for (const [keys, values] of Object.entries(this.config.getAll())){
            if (!this.existeLanguage(values["mini"])) {
                this.registerLanguage(new Language(keys, values["mini"], values["emote"], values["config"]))
                if (values["default"] !== undefined && values["default"]) {
                    this.registerLanguage(new Language(keys, "default", values["emote"], values["config"]))
                }
            }
        }
    }

    public loadLanguageGuild(): void{
        for (const [guild, info] of Object.entries(this.data.getAll())) {
            this.languages.get(info.toString()).addCustomLanguage(guild);
        }
    }

    public addLanguageGuild(guild: string, language: string): void{
        this.languages.get(language).addCustomLanguage(guild);
    }

    public removeCustomLanguage(guild: string, language: string): void{
        this.languages.get(language).removeCustomLanguage(guild);
    }


    public getLanguageGuild(guildId: string){
        return this.data.get(guildId,"default");
    }

    public setLanguageGuild(guildid: string, language: string){
        this.removeCustomLanguage(guildid,this.getLanguageGuild(guildid))
        this.data.set(guildid,language);
        this.data.save();
        this.addLanguageGuild(guildid,language);
    }

    public registerLanguage(language: Language) {
        this.languages.set(language.getMini(), language);
    }

    public existeLanguage(language: string): boolean {
        return this.languages.has(language);
    }

    public getLanguage(guildId: string): Language {
        return this.languages.get(this.getLanguageGuild(guildId));
    }
}