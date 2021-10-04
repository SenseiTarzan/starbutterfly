
import {GuildMember, Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";
import CommandFactory from "../../../Utils/CommandFactory";


export default class VolumeCommands extends  SubCommand{

    constructor() {
        super("volume", "music.commands.descirptions.volume");
        this.setAlias(['vl','vol'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    // @ts-ignore
                    Main.getInstance().getQueueMusicManager().setVolumePlayer(message.guildId,parseInt(args[0]));
                }else {
                    await  message.channel.send({content: language_manager.getTranslate("music.commands.error.commands", [CommandFactory.getPrefix(),this.getName(), this.getAlias().join(" | "),"<volume>"], "Vous devez faire /music &1 | &2 &3")})                }
            } else {
                await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
            }
    }

}