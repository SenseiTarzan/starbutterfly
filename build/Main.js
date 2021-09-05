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
const discord_js_1 = require("discord.js");
const Config_1 = require("./Utils/Config");
const CommandFactory_1 = require("./Utils/CommandFactory");
const VoteAPI_1 = require("./Api/VoteAPI");
const LanguageManager_1 = require("./Api/language/LanguageManager");
const VoteCommand_1 = require("./Commands/hevolia/VoteCommand");
const node_fetch_1 = require("node-fetch");
class Main {
    constructor() {
        this.prefix = "!/";
        this.config = new Config_1.default("resources/config.yml", { "token": "", "prefix": "!/" });
        this.client = new discord_js_1.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });
        this.prefix = this.config.get("prefix", "!/");
        this.commandMap = new CommandFactory_1.default(this.client, this.prefix);
        this.dataFolder = './resources/';
        Main.instance = this;
        this.loadApi();
        this.loadCommands();
        this.start();
        this.VoteInterval();
    }
    /*
        public test (): void{
            const passsanitaire = "HC1:NCFOXN%TS3DH2SC./JCVKO.P75J5NL-AH:UCIOOT-IGEFNK08WA0SF34DXC95D8:ZH6I1$4JN:IN1MKK9%OC*PP:+P*.1D9R+Q6646C%6RF6:X9AL5CBVW566LH 46+G9QJPKE04LT+EJLD3V.499TL EZW4P-AK.GNNVR*G0C7/JBA93PHNWEBLOV.TVOOVVLVQZV0INF*GUCJGVV6FNP/G/SNWD3B/S7-SN2H N37J3JFTULJ5CB3ZC115-BNF.456L X4CZKHKB-43.E3KD3OAJ/9TL4T1C9 UP IPTTE$UM6DE:RMJ7EC$1:/U.B9-TP571/20FR2.J89NT2V4$7UJ7WA.D98WLF9%FF$/EUDBQEAJJKIIIGECZI9$JAQJKH+GK3MZJKNGICZG35A5O4D3AXYP%TE1$4IKITLOQ2MWQLBRO8+RPX5WBJ17IHQQCESWWFO39Y%MSH0-:IDU3RGR-DL2LMNXND*T/:06DWX/2B*LL/AE FS50O0IG3".replace("HC1:","");
            const decodepass = b45.decode(passsanitaire);
            console.log(decodepass)
            const zlibdecompress = pako.inflate(decodepass);
            let decodedoriginal = decodeAllSync(zlibdecompress)
            const decoded = decodeAllSync(decodedoriginal[0].value[2]);
            const test = decoded[0].get(-260).get(1);
            test["dob"] = "2003-11-21";
            test['nam'] = {
                fn: 'Captari',
                fnt: 'CAPTARI',
                gn: 'Gabriel',
                gnt: 'GABRIEL'
            };
            decoded[0].set(-260,new Map().set(1,test))
            decodedoriginal[0].value[2] = encode(decoded[0]);
            let testd  = encodeAsync(decodedoriginal[0]);
            testd.then(result =>{
                const zlibdecompresstestd = pako.deflate(result);
                console.log("HC1:" + b45.encode(zlibdecompresstestd));
                this.config.set("passmodifier", "HC1:" + b45.encode(zlibdecompresstestd))
                this.config.save()
            })
    
            console.log(decodeAllSync(decodedoriginal[0].value[0]))
            console.log(decodeAllSync(decodedoriginal[0].value[0])[0].get(4).toString())
    
            /*
            */
    loadApi() {
        this.VoteApi = new VoteAPI_1.VoteAPI(this);
        this.LanguageManager = new LanguageManager_1.default(this);
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
    VoteInterval() {
        setInterval(function (voteapi, client, language, embed) {
            return __awaiter(this, void 0, void 0, function* () {
                if (voteapi.getServerAllType('mcbe') !== undefined) {
                    for (const value of Object.values(voteapi.getServerAllType('mcbe'))) {
                        const token = value['token'];
                        if (token !== undefined) {
                            const url = voteapi.getModalUrlVote('mcbe', token);
                            const time = value["time"];
                            if (new Date().toLocaleTimeString() == time) {
                                if (url !== undefined) {
                                    const data = yield (0, node_fetch_1.default)(url);
                                    const json = yield data.json();
                                    if (json["is_online"] == "1") {
                                        const guild = client.guilds.cache.get(value['guildId']);
                                        const time = value["time"];
                                        if (guild !== undefined) {
                                            const channel = guild.channels.cache.get(value['channelId']);
                                            if (channel instanceof discord_js_1.TextChannel || channel instanceof discord_js_1.NewsChannel) {
                                                embed.setFooter(client.user.username, client.user.avatarURL({
                                                    dynamic: true,
                                                    size: 256
                                                }));
                                                embed.setTitle(language.getLanguage('fra').getTranslate('server.embed.title'));
                                                embed.setURL(json["url"] + 'vote/');
                                                embed.addField(language.getLanguage('fra').getTranslate('server.embed.explication.title'), language.getLanguage('fra').getTranslate('server.embed.explication.desc'));
                                                embed.addField(language.getLanguage('fra').getTranslate('server.embed.notif.title'), language.getLanguage('fra').getTranslate('server.embed.notif.desc', [json["url"]]));
                                                embed.addField(language.getLanguage('fra').getTranslate('server.embed.Statistique.title'), language.getLanguage('fra').getTranslate('server.embed.Statistique.desc', [json["votes"], json["rank"], time.split(":")[0] + "h", json["players"]]));
                                                embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
                                                yield channel.send({ embeds: [embed], content: `<@&${value['role']}>` });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }, 1000, this.VoteApi, this.client, this.LanguageManager, new discord_js_1.MessageEmbed());
    }
    static UUID4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    getVoteApi() {
        return this.VoteApi;
    }
    getLanguageManager() {
        return this.LanguageManager;
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