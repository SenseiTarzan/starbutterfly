"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Config_1 = require("./Utils/Config");
const CommandFactory_1 = require("./Utils/CommandFactory");
const VoteAPI_1 = require("./Api/VoteAPI");
const LanguageAPI_1 = require("./Api/language/LanguageAPI");
const path = require("path");
const VoteCommand_1 = require("./Commands/hevolia/VoteCommand");
class Main {
    constructor() {
        this.prefix = "!/";
        this.config = new Config_1.default("resources/config.yml", { "token": "", "prefix": "!/" });
        this.client = new discord_js_1.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });
        this.prefix = this.config.get("prefix", "!/");
        this.commandMap = new CommandFactory_1.default(this.client, this.prefix);
        console.log(path.resolve(__dirname) + "resources/");
        this.dataFolder = './resources/';
        Main.instance = this;
        this.loadApi();
        this.loadCommands();
        this.start();
    }
    loadApi() {
        this.VoteApi = new VoteAPI_1.VoteAPI(this);
        this.LanguageApi = new LanguageAPI_1.default(this);
    }
    loadCommands() {
        const commandsMap = this.commandMap;
        commandsMap.registerCommands(new VoteCommand_1.default());
    }
    start() {
        this.client.once('ready', () => {
            console.log("ready:\n" + this.client.user.username + "#" + this.client.user.discriminator);
        });
        this.client.login(this.config.get("token"));
    }
    getVoteApi() {
        return this.VoteApi;
    }
    getLanguageApi() {
        return this.LanguageApi;
    }
    getDataFolder() {
        return this.dataFolder;
    }
    getClient() {
        return this.client;
    }
    getConfig() {
        return this.config;
    }
    static getInstance() {
        return this.instance;
    }
}
exports.default = Main;
new Main();
//# sourceMappingURL=Main.js.map