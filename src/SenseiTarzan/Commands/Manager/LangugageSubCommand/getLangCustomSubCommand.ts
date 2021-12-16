
import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import LanguageManager from "../../../Api/language/LanguageManager";

export default class GetLangCustomSubCommand extends SubCommand {
    constructor() {
        super("file_get", "lang.command.file_get.change.description");
        this.setPermissions(["ADMINISTRATOR"])
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        if (message.deletable && !message.deleted){
            await message.delete();
        }
        if (this.testPermissionsSilent(message.member)) {
            const lang = LanguageManager.getInstance().getLanguage(message.guildId);
            const lang_custom = lang.getCustomLanguage(message.guildId);
            if (lang_custom !== undefined) {
                user.send({
                    files: [
                        {
                            attachment: lang.Config().getFileName(),
                            name: lang.getName().toLowerCase() + ".yml"
                        }]
                })
            }
        }
    }
}