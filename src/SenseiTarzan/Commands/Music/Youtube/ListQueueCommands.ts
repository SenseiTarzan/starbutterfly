import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import QueueMusicManager from "../../../Utils/QueueMusicManager";
import LanguageManager from "../../../Api/language/LanguageManager";


export default class ListQueueCommands extends  SubCommand {

    constructor() {
        super("list", "music.commands.descirptions.list");
        this.setAlias(['queue'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {
            QueueMusicManager.getInstance().getQueueListMessage(message.guildId, message.member);
        } else {
            await message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }
    }
}