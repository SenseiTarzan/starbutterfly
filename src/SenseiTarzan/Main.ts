import {Client, MessageEmbed, NewsChannel, TextChannel} from "discord.js";
import Config from "./Utils/Config";
import CommandFactory from "./Utils/CommandFactory";
import {VoteManager} from "./Api/VoteManager";
import LanguageManager from "./Api/language/LanguageManager";
import VoteCommand from "./Commands/hevolia/VoteCommand";
import fetch from "node-fetch";
import RadioManager from "./Api/Radio/RadioManager";
import QueueMusicManager from "./Utils/QueueMusicManager";
import MusicCommands from "./Commands/Music/MusicCommands";
export default class Main {
    private readonly config: Config;
    private readonly client: Client;
    private readonly prefix: string = "!/";
    private commandMap: CommandFactory;
    private readonly dataFolder: string;
    private static instance: Main;
    private VoteManager: VoteManager;
    private LanguageManager: LanguageManager;
    private radioManager: RadioManager;
    private queueMusicManager: QueueMusicManager;

    constructor() {
        Main.instance = this;
        this.dataFolder = './resources/';
        this.config = new Config(this.dataFolder + "config.yml",{"token": "", "prefix": "!/"});
        this.client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS","DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGES",'GUILD_VOICE_STATES'], partials: ["CHANNEL"] });
        this.prefix = this.config.get("prefix","!/");
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

}
        */
    public loadApi(): void{
        this.commandMap = new CommandFactory(this.client,this.prefix);
        this.VoteManager = new VoteManager(this);
        this.LanguageManager = new LanguageManager(this);
        this.radioManager = new RadioManager(this);
        this.queueMusicManager = new QueueMusicManager(this);
    }

    public loadCommands(): void{
        const commandsMap = this.commandMap;
        commandsMap.registerCommands(new VoteCommand());
        commandsMap.registerCommands(new MusicCommands());
    }

    public start(): void{
        this.client.once('ready', () => {
            console.log("ready:\n"  + this.client.user.username  + "#" + this.client.user.discriminator)
        });
        this.client.login(this.config.get("token"));
    }

    public VoteInterval(): void {
        setInterval(async function (vote_manager: VoteManager, client: Client, language: LanguageManager) {
            if (vote_manager.getServerAllType('mcbe') !== undefined) {
                for (const value of Object.values(vote_manager.getServerAllType('mcbe'))) {
                    const token = value['token'];
                    if (token !== undefined) {
                        const url = vote_manager.getModalUrlVote('mcbe', token);
                        const time = value["time"];
                        if (new Date().toLocaleTimeString() == time) {
                            if (url !== undefined) {
                                const data = await fetch(url);
                                const json = await data.json();
                                if (json["is_online"] == "1") {
                                    const guild = client.guilds.cache.get(value['guildId']);
                                    const time = value["time"];
                                    if (guild !== undefined) {
                                        const channel = guild.channels.cache.get(value['channelId']);
                                        if (channel instanceof TextChannel || channel instanceof NewsChannel) {
                                            const embed: MessageEmbed = new MessageEmbed();
                                            embed.setFooter(client.user.username, client.user.avatarURL({
                                                dynamic: true,
                                                size: 256
                                            }));
                                            embed.setTitle(language.getLanguage('fra').getTranslate('server.embed.title'));
                                            embed.setURL(json["url"] + 'vote/');
                                            embed.addField(language.getLanguage('fra').getTranslate('server.embed.explication.title'), language.getLanguage('fra').getTranslate('server.embed.explication.desc'));
                                            embed.addField(language.getLanguage('fra').getTranslate('server.embed.notif.title'), language.getLanguage('fra').getTranslate('server.embed.notif.desc', [json["url"]]));
                                            embed.addField(language.getLanguage('fra').getTranslate('server.embed.Statistique.title'), language.getLanguage('fra').getTranslate('server.embed.Statistique.desc', [json["votes"], json["rank"], time.split(":")[0] + "h", json["players"]]));
                                            embed.setThumbnail(guild.iconURL({dynamic: true, size: 256}));
                                            await channel.send({embeds: [embed], content: `<@&${value['role']}>`});
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }, 1000, this.VoteManager, this.client, this.LanguageManager)
    }


    public static UUID4(): string{
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public getVoteManager(): VoteManager{
        return this.VoteManager;
    }
    public getLanguageManager(): LanguageManager{
        return this.LanguageManager;
    }

    public getRadioManager(): RadioManager{
        return this.radioManager;
    }

    public getQueueMusicManager(): QueueMusicManager{
        return this.queueMusicManager;
    }

    public getDataFolder() :string{
        return this.dataFolder;
    }

    public getClient(): Client{
        return this.client;
    }

    public getConfig(): Config{
        return this.config;
    }

    public static getInstance(): Main{
        return this.instance;
    }
}

new Main();