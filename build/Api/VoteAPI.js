"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteAPI = void 0;
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
    getServerAllType(type) {
        return this.data.get(type);
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
    RemoveServerData(type, guild) {
        this.data.removeNested(type + "." + guild);
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
}
exports.VoteAPI = VoteAPI;
//# sourceMappingURL=VoteAPI.js.map