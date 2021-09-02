import {SubCommand} from "../../../SubCommand";
import {Message, User} from "discord.js";
import Main from "../../../../Main";


export default class AddServerVoteSubCommand extends  SubCommand{

    constructor() {
        super("addserver","commands ajoute les server dans la query");
        this.setPermissions(["ADMINISTRATOR"]);
        this.setChannelType(["GUILD_TEXT",'GUILD_PUBLIC_THREAD','GUILD_PRIVATE_THREAD','GUILD_NEWS','GUILD_NEWS_THREAD']);
    }

    public async execute(sender: User, message: Message, args: any): Promise<void> {
        if (this.TestChannelSilent(message.channel)){
            if (args.length === 2) {
                const  languageapi = Main.getInstance().getLanguageApi().getLanguage(sender.id);
                Main.getInstance().getVoteApi().setServerData(args[0], message.guildId, {
                    "token": args[1],
                    channelId: message.channelId
                });
                await sender.send({content: languageapi.getTranslate("server.data.add.server",[],"vous avez ajouter un serveur dans la task de votre server")})
            }
        }else {

        }
    }

}