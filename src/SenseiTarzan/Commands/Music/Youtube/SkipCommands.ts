import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import QueueMusicManager from "../../../Utils/QueueMusicManager";
import LanguageManager from "../../../Api/language/LanguageManager";


export default class SkipCommands extends  SubCommand {

    constructor() {
        super("skip", "music.commands.descirptions.skip");
        this.setAlias(['next', 'suivant'])
        this.setChannelType(["GUILD_TEXT"]);
        this.setPermissions(["ADMINISTRATOR", "MUTE_MEMBERS"]);
        this.setGroup(["DJ"])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {
            if (!QueueMusicManager.getInstance().SkipMusic(message.guildId, message.member, this.hasGroup(message.member) || this.hasPermission(message.member))) {
                await message.channel.send({content: language_manager.getTranslate(message.guildId, "Commands.error.nohasgroup", ["`" + this.getGroup().join("`|`") + "`", "`" + this.getPermissions().join("`|`") + "`"], "Vous de fait avoir le group &1 ou les permissions suivante(s) &2 pour pour pouvoir utilise la commands")})
            }
        } else {
            await message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }

    }

}