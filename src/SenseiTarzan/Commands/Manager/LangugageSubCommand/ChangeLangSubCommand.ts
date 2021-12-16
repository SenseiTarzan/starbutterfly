
import {Message, User} from "discord.js";
import {SubCommand} from "../../SubCommand";
import LanguageManager from "../../../Api/language/LanguageManager";

export default class ChangeLangSubCommand extends SubCommand {
    constructor() {
        super("change", "lang.command.sub.change.description");
        this.setPermissions(["ADMINISTRATOR"])
    }

    public async execute(user: User, message: Message, args: Array<any>): Promise<void> {
        if (this.testPermissionsSilent(message.member)) {
            if (args.length > 0) {
                const language_mini = args.shift();
                if (LanguageManager.getInstance().existeLanguage(language_mini) && language_mini !== LanguageManager.getInstance().getLanguageGuild(message.guildId)) {
                    LanguageManager.getInstance().setLanguageGuild(message.guildId, language_mini);
                    const langauge = LanguageManager.getInstance().getLanguage(message.guildId);
                    await message.channel.send(langauge.getTranslate(message.guildId, "lang.set-languages", [message.member, langauge.getName()], "&1 Vous avez mis la langue &2"))
                }
            }
        }
    }
}