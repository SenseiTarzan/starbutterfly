
import {GuildMember, Message, User} from "discord.js";
import {Commands} from "../Command";
import Main from "../../Main";
import CommandFactory from "../../Utils/CommandFactory";
import RemoveServerVoteSubCommand from "./SubCommands/vote/removeServerVoteSubCommand";
import AddServerVoteSubCommand from "./SubCommands/vote/AddServerVoteSubCommand";

export default class VoteCommand extends  Commands{

    constructor() {
        super("vote","command de vote");
        this.setSubArguements([new AddServerVoteSubCommand,new RemoveServerVoteSubCommand]);
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        const  language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(user,message,args);
        }else {
            await  user.send({content:language_manager.getTranslate("Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites %1%2 `help`|`aide`")})
        }
    }
}