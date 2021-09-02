"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SubCommand_1 = require("../../../SubCommand");
const Main_1 = require("../../../../Main");
class AddServerVoteSubCommand extends SubCommand_1.SubCommand {
    constructor() {
        super("addserver", "commands ajoute les server dans la query");
        this.setPermissions(["ADMINISTRATOR"]);
        this.setChannelType(["GUILD_TEXT", 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD', 'GUILD_NEWS', 'GUILD_NEWS_THREAD']);
    }
    execute(sender, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.TestChannelSilent(message.channel)) {
                if (args.length === 2) {
                    const languageapi = Main_1.default.getInstance().getLanguageApi().getLanguage(sender.id);
                    Main_1.default.getInstance().getVoteApi().setServerData(args[0], message.guildId, {
                        "token": args[1],
                        channelId: message.channelId
                    });
                    yield sender.send({ content: languageapi.getTranslate("server.data.add.server", [], "vous avez ajouter un serveur dans la task de votre server") });
                }
            }
            else {
            }
        });
    }
}
exports.default = AddServerVoteSubCommand;
//# sourceMappingURL=AddServerVoteSubCommand.js.map