"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("../../Utils/Config");
const Main_1 = require("../../Main");
class Language {
    constructor(name, mini, emote, filename) {
        this.name = name;
        this.mini = mini;
        this.emote = emote;
        this.config = new Config_1.default(Main_1.default.getInstance().getDataFolder() + filename, {});
    }
    getName() {
        return this.name;
    }
    getMini() {
        return this.mini;
    }
    getEmote() {
        return this.emote;
    }
    getTranslate(message, balise = [], defaults = "no found translate") {
        this.config.reload();
        let msg = this.config.getNested(message);
        if (msg === undefined) {
            this.config.setNested(message, defaults);
            this.config.save();
            msg = defaults;
        }
        if (typeof msg === "string") {
            while (msg.includes("%n")) {
                msg = msg.replace("%n", "\n");
            }
            if (balise.length > 0) {
                balise.forEach((value, i) => {
                    msg = msg.replace(`&${i + 1}`, value);
                });
            }
        }
        return msg;
    }
}
exports.default = Language;
//# sourceMappingURL=Language.js.map