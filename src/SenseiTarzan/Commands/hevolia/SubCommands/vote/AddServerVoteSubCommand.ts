import {SubCommand} from "../../../SubCommand";
import {Message, User} from "discord.js";
import Main from "../../../../Main";
import LanguageManager from "../../../../Api/language/LanguageManager";


export default class AddServerVoteSubCommand extends  SubCommand{

    constructor() {
        super("addserver","commands ajoute les server dans la query");
        this.setPermissions(["ADMINISTRATOR"]);
        this.setChannelType(["GUILD_TEXT",'GUILD_NEWS']);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        if (this.testPermissionsSilent(message.member)) {
            const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length === 4) {
                    Main.getInstance().getVoteManager().setServerData(args[0], message.guildId, {
                        guildId: message.guildId,
                        channelId: message.channelId,
                        token: args[1],
                        time: args[2],
                        role: args[3]
                    });
                    await user.send({content: language_manager.getTranslate("server.data.addserver", [], "vous avez ajouter un serveur dans la task de votre server")})
                }else {
                    await user.send({content: language_manager.getTranslate("server.error.addserveur", [], "Vous devez faire /vote addserver  <type>  <token> <time> <role_id>")})
                }
            } else {
                await user.send({content: language_manager.getTranslate("server.error.channel", [], "vous ne pouvez pas mettre dans se salon")})
            }
        }
    }

}