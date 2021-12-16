import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import CommandFactory from "../../../Utils/CommandFactory";
import QueueMusicManager from "../../../Utils/QueueMusicManager";
import LanguageManager from "../../../Api/language/LanguageManager";


export default class RadioCommands extends  SubCommand{

    constructor() {

        super("radio", "music.commands.descirptions.radio");
        //"Permet de chercher la station radio et ecouter la station"
        this.setAlias(['fm'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    // @ts-ignore
                    await QueueMusicManager.getInstance().addQueueMusique(message.member, message.channel, args.shift(), 'radio')
                }else {

                    await  message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.commands", [CommandFactory.getPrefix(),this.getName(), this.getAlias().join(" | "),"<radio name>"], "Vous devez faire /music &1 | &2 &3")})                }
            } else {
                await message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
            }
    }

}