
import {GuildMember, Message, MessageEmbed, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";
import CommandFactory from "../../../Utils/CommandFactory";


export default class HelpCommands extends  SubCommand {

    constructor() {
        super("help", "music.commands.descirptions.help");

        //""donne les commands musique existante"
        this.setAlias(['aide'])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const command = CommandFactory.getInstance().getCommand("music");
        const language_manager = Main.getInstance().getLanguageManager().getLanguage(message.guildId);
        if (command !== undefined) {
            const subcommand = command.getSubArguements();
            let helptest =  language_manager.getTranslate( "music.commands.help.line1",[],`**Commands:**%n`);
            subcommand.forEach((value,name) => {
                helptest = helptest + `> ${CommandFactory.getPrefix()}${command.getName()} \`${name}\` - _${language_manager.getTranslate(value.getDescription(),[],value.getDescription())}_\n`
            })

            helptest = helptest + language_manager.getTranslate( "commands.alias",[command.getAlias().join(" | ")], `**\`Alias:\`** &1`)
            const embed = new MessageEmbed();
            embed.setColor([139, 0, 0]);
            embed.setTitle(language_manager.getTranslate( "music.commands.help.title",[],`**\`Music Help:\`**`));
            embed.setDescription(`\n${helptest}`);
            await message.channel.send({content: `<@${user.id}>`,embeds: [embed]});
        }
    }

}