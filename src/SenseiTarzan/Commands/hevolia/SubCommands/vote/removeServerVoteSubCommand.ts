import {SubCommand} from "../../../SubCommand";
import {Message, User} from "discord.js";
import Main from "../../../../Main";


export default class RemoveServerVoteSubCommand extends  SubCommand{

    constructor() {
        super("removeserver","commands d'enlver les server dans la system de vote");
        this.setPermissions(["ADMINISTRATOR"]);
        this.setChannelType(["GUILD_TEXT",'GUILD_NEWS']);
    }

    public async execute(sender: User, message: Message, args: any): Promise<void> {
        if (this.testPermissionsSilent(message.member)) {
            const languageapi = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    Main.getInstance().getVoteApi().RemoveServerData(args[0], message.guildId)
                    await sender.send({content: languageapi.getTranslate("server.data.removeserver", [], "vous avez enlever un serveur dans la task de votre server")})
                }else {
                    await sender.send({content: languageapi.getTranslate("server.error.removeserver", [], "Vous devez faire /vote removeserver <type>")})
                }
            } else {
                await sender.send({content: languageapi.getTranslate("server.error.channel", [], "vous ne pouvez pas mettre dans se salon")})
            }
        }
    }

}