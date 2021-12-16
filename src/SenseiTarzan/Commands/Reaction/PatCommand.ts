import {Commands} from "../Command";
import {Message, MessageEmbed, User} from "discord.js";
import LanguageManager from "../../Api/language/LanguageManager";
import fetch from "node-fetch";
import Main from "../../Main";

export default class PatCommand extends Commands{
    private readonly url: string;
    constructor() {
        super("pat","pat.commands.description");
        this.url = Main.getInstance().getConfig().getNested('api.pat');
        this.setChannelType(["DM"]);
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        const data = await fetch(this.url);
        const json = await data.json();
        const language = LanguageManager.getInstance().getLanguage(message.guildId);
        const mentions = message.mentions.members.first();
        const embed = new MessageEmbed();
        embed.setTitle(language.getTranslate(message.guildId, "pat.embed.title",[],"**Pat**"));
        embed.setColor('GOLD');
        embed.setImage(json['link'] ?? "");
        if (mentions === undefined){
            await  message.channel.send({embeds:[embed],content: language.getTranslate(message.guildId, "pat.message",[message.member,message.guild.me],"&1%n&2 vous avez un tape sur la tete")})
        }else {
            await  message.channel.send({embeds:[embed],content: language.getTranslate(message.guildId, "pat.message",[mentions,message.member],"&1%n&2 vous avez un tape sur la tete")})

        }
    }
}
