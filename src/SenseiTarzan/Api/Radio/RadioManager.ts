import Main from "../../Main";
import Config from "../../Utils/Config";
import {Collection} from "discord.js";
import Radio from "./Radio";
import Language from "../language/Language";
interface RadioFormat{
    url: string,
    desc: string | undefined,
    icon: string | undefined
}
export  default class RadioManager {
    private config: Config;
private radio: Collection<string, Radio> = new Collection<string, Radio>();
    constructor(main: Main) {
        this.config = new Config(main.getDataFolder() + "radio/config.yml");
        this.loadRadio();
    }

    public loadRadio(): void {
        for (const [name, serverinfo] of Object.entries(this.config.getAll())) {
            if (this.existRadio(name)){
                this.registerRadio(new Radio(name,serverinfo["url"],serverinfo["desc"],serverinfo["icon"]))
            }
        }
    }

    /**
     * dis si la radio existe dans la config
     * @param nameradio
     */
    public existRadio(nameradio: string): boolean{
        return this.radio.has(nameradio);
    }

    /**
     * Donne la donne de la radio qui est dans la config
     * @param nameradio
     */
    public getRadioData(nameradio: string): Radio {
        return this.radio.get(nameradio);
    }

    public registerRadio(radio: Radio): void{
        this.radio.set(radio.getName(),radio);
    }

}