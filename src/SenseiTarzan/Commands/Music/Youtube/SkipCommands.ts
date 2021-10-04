
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";
import CommandFactory from "../../../Utils/CommandFactory";


export default class SkipCommands extends  SubCommand {

    constructor() {
        super("skip", "music.commands.descirptions.skip");
        this.setAlias(['next', 'suivant'])
        this.setChannelType(["GUILD_TEXT"]);
        this.setPermissions(["ADMINISTRATOR", "MUTE_MEMBERS"]);
        this.setGroup(["DJ"])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {
            const skip = Main.getInstance().getQueueMusicManager().SkipMusic(message.guildId, message.member, this.hasGroup(message.member) || this.hasPermission(message.member));
            if (!skip) {
                await message.channel.send({content: language_manager.getTranslate("Commands.error.nohasgroup", ["`" + this.getGroup().join("`|`") + "`", "`" + this.getPermissions().join("`|`") + "`"], "Vous de fait avoir le group &1 ou les permissions suivante(s) &2 pour pour pouvoir utilise la commands")})
            }
        } else {
            await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }

    }

}