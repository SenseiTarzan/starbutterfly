import {Commands} from "../Command";
import CommandFactory from "../../Utils/CommandFactory";
import {Message, MessageEmbed, User} from "discord.js";
import LanguageManager from "../../Api/language/LanguageManager";

export default class HelpCommands extends Commands {
    constructor() {
        super("help", "help.command.description");
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const commands_all = CommandFactory.getInstance().getAllCommands();
        const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
        let helptest = language_manager.getTranslate(message.guildId,"help.commands.help.line1", [], `**Commands:**%n`);
        let check = [];
        commands_all.forEach((command) => {
            if (!check.includes(command.getName())) {
                check.push(command.getName());
                if (command.getSubArguements().get("help") !== undefined) {
                    helptest = helptest + `> ${CommandFactory.getPrefix()}${command.getName()} help - _${language_manager.getTranslate(message.guildId, "help.commands.desc." + command.getName(), [], "Vous donne  les commands existante sur " + command.getName())}_\n`
                }else {
                    helptest = helptest + `> ${CommandFactory.getPrefix()}${command.getName()} - _${language_manager.getTranslate(message.guildId, command.getDescription(), [], command.getDescription())}_\n`
                }
            }
        });
        const embed = new MessageEmbed();
        embed.setColor('DARK_GOLD');
        embed.setTitle(language_manager.getTranslate(message.guildId, "help.commands.title", [], `**\`Command Help:\`**`));
        embed.setDescription(`\n${helptest}`);
        await message.channel.send({content:  `${message.member}`, embeds: [embed]});
    }
}