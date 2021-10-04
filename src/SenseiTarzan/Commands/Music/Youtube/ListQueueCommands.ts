
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";


export default class ListQueueCommands extends  SubCommand {

    constructor() {
        super("list", "music.commands.descirptions.list");
        this.setAlias(['queue'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {
            Main.getInstance().getQueueMusicManager().getQueueListMessage(message.guildId, message.member);
        } else {
            await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }
    }
}