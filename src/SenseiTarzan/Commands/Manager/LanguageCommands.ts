import {Commands} from "../Command";
import {Message,  User} from "discord.js";
import LanguageManager from "../../Api/language/LanguageManager";
import ChangeLangSubCommand from "./LangugageSubCommand/ChangeLangSubCommand";
import CommandFactory from "../../Utils/CommandFactory";
import GetLangCustomSubCommand from "./LangugageSubCommand/getLangCustomSubCommand";
import SetLangCustomSubCommand from "./LangugageSubCommand/setLangCustomSubCommand";

export default class LanguageCommands extends Commands {
    constructor() {
        super("lang", "lang.command.description");
        this.setSubArguements([
            new ChangeLangSubCommand,
            new GetLangCustomSubCommand,
            new SetLangCustomSubCommand,
        ])
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        const  language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(user,message,args);
        }else {
            await  user.send({content:language_manager.getTranslate(message.guildId, "Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites %1%2 `help`|`aide`")})
        }
    }
}