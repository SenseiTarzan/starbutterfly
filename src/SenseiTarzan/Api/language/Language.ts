import Config from "../../Utils/Config";
import Main from "../../Main";

export default class Language {
    private name: string;
    private mini: string;
    private emote: string;
    private config: Config;

    constructor(name: string, mini: string, emote: string, filename: string) {
        this.name = name;
        this.mini = mini;
        this.emote = emote;
        this.config = new Config(Main.getInstance().getDataFolder() + filename, {});
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

    public getTranslate(message: string, balise: any[] = [], defaults: any = "no found translate") {
        this.config.reload();
        let msg = this.config.getNested(message);
        if (msg === undefined) {
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