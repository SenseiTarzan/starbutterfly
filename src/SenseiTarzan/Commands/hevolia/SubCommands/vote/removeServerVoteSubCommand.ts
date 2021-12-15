import {SubCommand} from "../../../SubCommand";
import {Message, User} from "discord.js";
import Main from "../../../../Main";
import LanguageManager from "../../../../Api/language/LanguageManager";


export default class RemoveServerVoteSubCommand extends  SubCommand{

    constructor() {
        super("removeserver","commands d'enlver les server dans la system de vote");
        this.setPermissions(["ADMINISTRATOR"]);
        this.setChannelType(["GUILD_TEXT",'GUILD_NEWS']);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        if (this.testPermissionsSilent(message.member)) {
            const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    Main.getInstance().getVoteManager().RemoveServerData(args[0], message.guildId)
                    await user.send({content: language_manager.getTranslate("server.data.removeserver", [], "vous avez enlever un serveur dans la task de votre server")})
                }else {
                    await user.send({content: language_manager.getTranslate("server.error.removeserver", [], "Vous devez faire /vote removeserver <type>")})
                }
            } else {
                await user.send({content: language_manager.getTranslate("server.error.channel", [], "vous ne pouvez pas mettre dans se salon")})
            }
        }
    }

}