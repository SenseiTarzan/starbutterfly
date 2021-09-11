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
        this.setChannelType(["GUILD_TEXT", 'GUILD_NEWS']);
    }
    execute(user, message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.testPermissionsSilent(message.member)) {
                const language_manager = Main_1.default.getInstance().getLanguageManager().getLanguage(message.guildId);
                if (this.TestChannelSilent(message.channel)) {
                    if (args.length === 4) {
                        Main_1.default.getInstance().getVoteManager().setServerData(args[0], message.guildId, {
                            guildId: message.guildId,
                            channelId: message.channelId,
                            token: args[1],
                            time: args[2],
                            role: args[3]
                        });
                        yield user.send({ content: language_manager.getTranslate("server.data.addserver", [], "vous avez ajouter un serveur dans la task de votre server") });
                    }
                    else {
                        yield user.send({ content: language_manager.getTranslate("server.error.addserveur", [], "Vous devez faire /vote addserver  <type>  <token> <time> <role_id>") });
                    }
                }
                else {
                    yield user.send({ content: language_manager.getTranslate("server.error.channel", [], "vous ne pouvez pas mettre dans se salon") });
                }
            }
        });
    }
}
exports.default = AddServerVoteSubCommand;
//# sourceMappingURL=AddServerVoteSubCommand.js.map