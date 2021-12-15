import Main from "../../Main";
import Config from "../../Utils/Config";
import {Collection} from "discord.js";
import Radio from "./Radio";


export  default class RadioManager {
    private config: Config;
    private radio: Collection<string, Radio> = new Collection<string, Radio>();

    constructor(main: Main) {
        this.config = new Config(main.getDataFolder() + "radio/config.yml");
        this.loadRadio();
    }

    public loadRadio(): void {
        for (const [name, radio_info] of Object.entries(this.config.getAll())) {
            if (!this.existRadio(name)) {
                this.registerRadio(new Radio(name, radio_info["url"], radio_info["desc"], radio_info["icon"]))
            }
        }
    }

    /**
     * dis si la radio existe dans la config
     * @param name_radio
     */
    public existRadio(name_radio: string): boolean {
        return this.radio.has(name_radio);
    }

    /**
     * Donne la donne de la radio qui est dans la config
     * @param name_radio
     */
    public getRadioData(name_radio: string): Radio {
        return this.radio.get(name_radio);
    }

    public registerRadio(radio: Radio): void {
        this.radio.set(radio.getName(), radio);
    }

}