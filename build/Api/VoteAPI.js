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
exports.VoteAPI = void 0;
const node_fetch_1 = require("node-fetch");
const Config_1 = require("../Utils/Config");
class VoteAPI {
    constructor(client) {
        this.config = new Config_1.default(client.getDataFolder() + "Vote/config.yml");
        this.data = new Config_1.default(client.getDataFolder() + "Vote/data.yml");
    }
    getServerData(type, guild) {
        var _a;
        return (_a = this.data.get(type, {})[guild]) !== null && _a !== void 0 ? _a : undefined;
    }
    getTokenServer(type, guild) {
        const data = this.getServerData(type, guild);
        return data !== undefined ? data["token"] : undefined;
    }
    setServerData(type, guild, data) {
        const types = this.data.get(type, {});
        types[guild] = data;
        this.data.set(type, types);
        this.data.save();
    }
    getModalUrlVote(type, token) {
        const url = this.config.get(type, undefined);
        return url !== undefined ? url.replace("{token}", token) : undefined;
    }
    setModalUrlVote(type, modal) {
        if (modal.includes("{token}")) {
            this.config.set(type, modal);
            this.config.save();
            return true;
        }
        return false;
    }
    queryvote(type, guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = this.getTokenServer(type, guild);
            if (token !== undefined) {
                const url = this.getModalUrlVote(type, token);
                if (url !== undefined) {
                    const data = yield (0, node_fetch_1.default)(url);
                    const json = yield data.json();
                    console.log(json);
                }
            }
        });
    }
}
exports.VoteAPI = VoteAPI;
//# sourceMappingURL=VoteAPI.js.map