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
const Command_1 = require("../Command");
const AddServerVoteSubCommand_1 = require("./SubCommands/vote/AddServerVoteSubCommand");
const Main_1 = require("../../Main");
const CommandFactory_1 = require("../../Utils/CommandFactory");
const removeServerVoteSubCommand_1 = require("./SubCommands/vote/removeServerVoteSubCommand");
class VoteCommand extends Command_1.Commands {
    constructor() {
        super("vote", "command de vote");
        this.setSubArguements([new AddServerVoteSubCommand_1.default, new removeServerVoteSubCommand_1.default]);
    }
    execute(sender, message, args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const subarg = ((_a = args.shift()) !== null && _a !== void 0 ? _a : '').toLowerCase();
            const languageapi = Main_1.default.getInstance().getLanguageManager().getLanguage(message.guildId);
            if (this.existeSubArguments(subarg)) {
                const subcommand = this.getSubCommand(subarg);
                yield subcommand.execute(sender, message, args);
            }
            else {
                yield sender.send({ content: languageapi.getTranslate("Command.error.subcommand", [CommandFactory_1.default.getPrefix(), this.getName()], "faites %1%2 `help`|`aide`") });
            }
        });
    }
}
exports.default = VoteCommand;
//# sourceMappingURL=VoteCommand.js.map