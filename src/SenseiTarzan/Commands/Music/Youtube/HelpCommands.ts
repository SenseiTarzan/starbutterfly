
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";


export default class HelpCommands extends  SubCommand{

    constructor() {
        super("help","Permet de chercher et lire la musique");
        this.setAlias(['aide','start','lire'])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
            const sudccommand = Main.getInstance().get
    }

}