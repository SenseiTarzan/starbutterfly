
import {GuildMember, Message, User} from "discord.js";
import {Commands} from "../Command";
import Main from "../../Main";
import CommandFactory from "../../Utils/CommandFactory";
import PlayCommands from "./Youtube/PlayCommands";
import SkipCommands from "./Youtube/SkipCommands";
import VolumeCommands from "./Youtube/VolumeCommands";
import RadioCommands from "./Youtube/RadioCommands";
import HelpCommands from "./Youtube/HelpCommands";

export default class MusicCommands extends  Commands{

    constructor() {
        super("music","command de vote");
        this.setAlias(['m','musique']);
        this.setSubArguements([new RadioCommands,new PlayCommands,new SkipCommands,new VolumeCommands, new HelpCommands]);
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        const  language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(user,message,args);
        }else {
            await  message.channel.send({content:language_manager.getTranslate("Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites %1%2 `help`|`aide`")})
        }
    }
}