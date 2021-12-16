
import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import LanguageManager from "../../../Api/language/LanguageManager";
import * as yamjs from "yamljs";
import fetch from "node-fetch";

export default class SetLangCustomSubCommand extends SubCommand {
    constructor() {
        super("file_set", "lang.command.file_set.change.description");
        this.setPermissions(["ADMINISTRATOR"])
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        if (this.testPermissionsSilent(message.member)) {
            if (message.deletable && !message.deleted) {
                await message.delete()
            }
            const lang = LanguageManager.getInstance().getLanguage(message.guildId);
            const lang_custom = lang.getCustomLanguage(message.guildId);
            if (lang_custom !== undefined) {
                const attachement = message.attachments.toJSON().shift();
                const namelang = (lang.getName() + ".yml").toLowerCase();
                if (attachement !== undefined && namelang === attachement.name) {
                    const text = await (await fetch(attachement.url)).text()
                    lang_custom.setAll(yamjs.parse(text))
                    lang_custom.save();
                }
            }
        }
    }
}