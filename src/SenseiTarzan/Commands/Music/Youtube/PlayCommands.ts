
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";


export default class PlayCommands extends  SubCommand{

    constructor() {
        super("play","Permet de chercher et lire la musique");
        this.setAlias(['join','start','lire'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    // @ts-ignore
                    Main.getInstance().getQueueMusicManager().addQueueMusique(message.member,message.channel,args.shift(), 'youtube')
                }else {
                    await message.channel.send({content: language_manager.getTranslate("music.commands.error.play", [], "Vous devez faire /music play <url or name>")})
                }
            } else {
                await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
            }
    }

}