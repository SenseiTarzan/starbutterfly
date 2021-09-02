import {Commands} from "../Command";
import AddServerVoteSubCommand from "./SubCommands/vote/AddServerVoteSubCommand";
import {Message, User} from "discord.js";
import Main from "../../Main";
import CommandFactory from "../../Utils/CommandFactory";

export default class VoteCommand extends  Commands{

    constructor() {
        super("vote","command de vote");
        this.setSubArguements([new AddServerVoteSubCommand]);
    }

    public async execute(sender: User, message: Message, args: Array<any>): Promise<void> {
        const subarg = (args.shift() ?? '').toLowerCase();
        console.log(subarg);
        const  languageapi = Main.getInstance().getLanguageApi().getLanguage(sender.id);
        if (this.existeSubArguments(subarg)){
            const subcommand = this.getSubCommand(subarg);
            await subcommand.execute(sender,message,args);
        }else {
            await  sender.send({content:languageapi.getTranslate("Command.error.subcommand",[CommandFactory.getPrefix(),this.getName()], "faites %1%2 `help`|`aide`")})
        }
    }
}