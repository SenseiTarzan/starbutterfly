import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import CommandFactory from "../../../Utils/CommandFactory";
import QueueMusicManager from "../../../Utils/QueueMusicManager";
import LanguageManager from "../../../Api/language/LanguageManager";


export default class VolumeCommands extends  SubCommand{

    constructor() {
        super("volume", "music.commands.descirptions.volume");
        this.setAlias(['vl','vol'])
        this.setChannelType(["GUILD_TEXT"]);
        this.setPermissions(["ADMINISTRATOR", "MUTE_MEMBERS"]);
        this.setGroup(["DJ"])
    }

    public async execute(user: User, message: Message, args: any): Promise<void> {
            const language_manager = LanguageManager.getInstance().getLanguage(message.guildId);
            if (this.TestChannelSilent(message.channel)) {
                if (args.length > 0) {
                    // @ts-ignore
                    if (!QueueMusicManager.getInstance().setVolumePlayer(message.guildId,parseInt(args[0]),message.member,this.hasGroup(message.member) || this.hasPermission(message.member))) {
                        await message.channel.send({content: language_manager.getTranslate(message.guildId, "Commands.error.nohasgroup", ["`" + this.getGroup().join("`|`") + "`", "`" + this.getPermissions().join("`|`") + "`"], "Vous de fait avoir le group &1 ou les permissions suivante(s) &2 pour pour pouvoir utilise la commands")})
                    }
                }else {
                    await  message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.commands", [CommandFactory.getPrefix(),this.getName(), this.getAlias().join(" | "),"<volume>"], "Vous devez faire /music &1 | &2 &3")})                }
            } else {
                await message.channel.send({content: language_manager.getTranslate(message.guildId, "music.commands.error.channel", [], "Vous ne pouvaez pas chercher et exucter de music dans se channel")})
            }
    }

}