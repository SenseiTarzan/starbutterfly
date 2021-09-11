
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";


export default class RadioCommands extends  SubCommand{

    constructor() {
        super("radio","Permet de chercher la station radio et lire la musique");
        this.setAlias(['fm'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    // @ts-ignore
                    Main.getInstance().getQueueMusicManager().addQueueMusique(message.member,message.channel,args.shift(), 'radio')
                }else {
                    await message.channel.send({content: language_manager.getTranslate("music.commands.error.radio", [], "Vous devez faire /music radio <name radio>")})
                }
            } else {
                await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
            }
    }

}