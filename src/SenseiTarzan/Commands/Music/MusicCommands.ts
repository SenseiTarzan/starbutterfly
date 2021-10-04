
import {GuildMember, Message, User} from "discord.js";
import {Commands} from "../Command";
import Main from "../../Main";
import CommandFactory from "../../Utils/CommandFactory";
import PlayCommands from "./Youtube/PlayCommands";
import SkipCommands from "./Youtube/SkipCommands";
import VolumeCommands from "./Youtube/VolumeCommands";
import RadioCommands from "./Youtube/RadioCommands";
import HelpCommands from "./Youtube/HelpCommands";
import ListQueueCommands from "./Youtube/ListQueueCommands";
import ReturnsSubCommands from "./Youtube/ReturnsSubCommands";

export default class MusicCommands extends  Commands{

    constructor() {
        super("music", "music.commands.descirptions.music");
        //"command de Musique"
        this.setAlias(['m','musique']);
        this.setSubArguements([new RadioCommands,new PlayCommands,new SkipCommands,new VolumeCommands, new HelpCommands, new ListQueueCommands,new ReturnsSubCommands()]);
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        const  language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(user,message,args);
        }else {
            await  message.channel.send({content:language_manager.getTranslate("Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites &1&2 `help`|`aide`")})
        }
    }
}