
import {GuildMember, Message, MessageEmbed, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import Main from "../../../Main";
import CommandFactory from "../../../Utils/CommandFactory";


export default class HelpCommands extends  SubCommand {

    constructor() {
        super("help", "donne les commands musique existante");
        this.setAlias(['aide'])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
        const command = CommandFactory.getInstance().getCommand("music");
        if (command !== undefined) {
            const subcommand = command.getSubArguements();
            let helptest = `**Commands:**\n`;
            subcommand.forEach((value,name) => {
                helptest = helptest + `> ${CommandFactory.getPrefix()}${command.getName()} \`\`${name}\`\` - _${value.getDescription()}_\n`
            })
            helptest = helptest + `**\`\`Alias:\`\`** ` + command.getAlias().join(" | ")
            const embed = new MessageEmbed();
            embed.setColor([139, 0, 0]);
            embed.setTitle(`**\`\`Music Help:\`\`**`);
            embed.setDescription(`<@${user.id}>\n${helptest}`);
            await message.channel.send({embeds: [embed]});
        }
    }

}