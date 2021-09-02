"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../../Utils/Config");
const Language_1 = require("./Language");
const discord_js_1 = require("discord.js");
class LanguageAPI {
    constructor(client) {
        this.languages = new discord_js_1.Collection();
        this.config = new Config_1.default(client.getDataFolder() + "Language/config.yml", {
            "English": {
                "mini": "en",
                "emote": "🇬🇧",
                "config": "Language/english.yml"
            },
            "Francais": {
                "mini": "fr",
                "emote": "🇫🇷",
                "config": "Language/french.yml",
                "default": true
            }
        });
        this.data = new Config_1.default(client.getDataFolder() + "Language/data.yml", {});
        this.loadLanguage();
    }
    loadLanguage() {
        for (const [keys, values] of Object.entries(this.config.getAll())) {
            if (values["default"] !== undefined && values["default"]) {
                this.registerLanguage(new Language_1.default(keys, values["mini"], values["emote"], values["config"]));
                this.registerLanguage(new Language_1.default(keys, "default", values["emote"], values["config"]));
            }
            this.registerLanguage(new Language_1.default(keys, values["mini"], values["emote"], values["config"]));
        }
    }
    getLanguageUser(userid) {
        return this.data.get(userid, "default");
    }
    setLanguageUser(userid, language) {
        this.data.set(userid, language);
        this.data.save();
    }
    registerLanguage(language) {
        this.languages.set(language.getMini(), language);
    }
    existeLanguage(language) {
        return this.languages.has(language);
    }
    getLanguage(userid) {
        return this.languages.get(this.getLanguageUser(userid));
    }
}
exports.default = LanguageAPI;
//# sourceMappingURL=LanguageAPI.js.map