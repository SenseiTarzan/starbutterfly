import {Commands} from "../Command";
import AddServerVoteSubCommand from "./SubCommands/vote/AddServerVoteSubCommand";
import {Message, User} from "discord.js";
import Main from "../../Main";
import CommandFactory from "../../Utils/CommandFactory";
import RemoveServerVoteSubCommand from "./SubCommands/vote/removeServerVoteSubCommand";

export default class VoteCommand extends  Commands{

    constructor() {
        super("vote","command de vote");
        this.setSubArguements([new AddServerVoteSubCommand,new RemoveServerVoteSubCommand]);
    }

    public async execute(sender: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        const  languageapi = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(sender,message,args);
        }else {
            await  sender.send({content:languageapi.getTranslate("Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites %1%2 `help`|`aide`")})
        }
    }
}