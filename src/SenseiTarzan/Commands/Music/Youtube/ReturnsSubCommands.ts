
import {GuildMember, Message, MessageEmbed, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";
import CommandFactory from "../../../Utils/CommandFactory";


export default class ReturnsSubCommands extends  SubCommand {

    constructor() {
        super("return", "music.commands.descirptions.return");
        this.setAlias(['replay'])
        this.setChannelType(["GUILD_TEXT"]);
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (this.TestChannelSilent(message.channel)) {

            if (args.length == 1) {
                const embed = new MessageEmbed();
                embed.setColor([139, 0, 0]);
                embed.setTitle(language_manager.getTranslate("music.commands.return.title", [], "Nombre de fois a Rejouer"));
                embed.setDescription(language_manager.getTranslate("music.commands.return.desc", [args[0]], "la Queue va etre rejouer &1 fois"));
                Main.getInstance().getQueueMusicManager().setReturnMusique(message.guildId, parseInt(args[0]));
                await message.channel.send({content: `${user}`, embeds: [embed]})
            } else {
                await message.channel.send({content: language_manager.getTranslate("music.commands.error.commands", [CommandFactory.getPrefix(), this.getName(), this.getAlias().join(" | "), "  <number>"], "Vous devez faire /music &1 | &2 &3")})
            }
            //await  message.channel.send({content: language_manager.getTranslate("Commands.maintenace", [CommandFactory.getPrefix(), "music", "`" + this.getName() + "` | `"  + (this.getAlias().length > 1 ? this.getAlias().join("` | `")  + "`": this.getAlias().join("") + "`")], "La commande &1&2 &3 est en maintenance")})
        }else {
            await message.channel.send({content: language_manager.getTranslate("music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
        }
    }
}