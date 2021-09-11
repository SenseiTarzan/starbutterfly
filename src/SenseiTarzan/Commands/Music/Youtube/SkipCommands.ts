
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";


export default class SkipCommands extends  SubCommand {

    constructor() {
        super("skip", "Permet de change de musique");
        this.setAlias(['next', 'suivant'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {
            const player = Main.getInstance().getQueueMusicManager().getAudioPlayer(message.guildId);
            if (player === undefined) return;
            if (player.stop()) {
                // @ts-ignore
                //await user.send({content: language_manager.getTranslate("music.commands.succes.play", [], "Vous aves ")})
            } else {
                await message.channel.send({content: language_manager.getTranslate("music.commands.error.play", [], "Vous devez faire /music play <url or name>")})
            }
        } else {
            await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }

    }

}