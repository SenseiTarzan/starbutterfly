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
import PatCommand from "./Commands/Reaction/PatCommand";
import HelpCommands from "./Commands/Manager/HelpCommands";
import LanguageCommands from "./Commands/Manager/LanguageCommands";
import * as path from "path";

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
        this.dataFolder = path.join(path.dirname(__dirname),"resources\\");
        this.config = new Config(this.dataFolder + "config.yml",{"token": "", "prefix": "!/"});
        this.client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS","DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGES",'GUILD_VOICE_STATES'], partials: ["CHANNEL"] });
        this.prefix = this.config.get("prefix","!/");
        this.loadApi();
        this.loadCommands();
        this.start();
        this.VoteInterval();
    }

    public loadApi(): void{
        this.commandMap = new CommandFactory(this.client,this.prefix);
        this.VoteManager = new VoteManager(this);
        this.LanguageManager = new LanguageManager(this);
        this.radioManager = new RadioManager(this);
        this.queueMusicManager = new QueueMusicManager(this);
    }

    public loadCommands(): void{
        const commandsMap = this.commandMap;
        commandsMap.registerCommands(new HelpCommands());
        commandsMap.registerCommands(new LanguageCommands());
        commandsMap.registerCommands(new MusicCommands());
        commandsMap.registerCommands(new PatCommand());
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
                                            embed.setTitle(language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.title'));
                                            embed.setURL(json["url"] + 'vote/');
                                            embed.addField(language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.explication.title'), language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.explication.desc'));
                                            embed.addField(language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.notif.title'), language.getLanguage('fra').getTranslate(channel.guildId,'channel.guildId,server.embed.notif.desc', [json["url"]]));
                                            embed.addField(language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.Statistique.title'), language.getLanguage('fra').getTranslate(channel.guildId,'server.embed.Statistique.desc', [json["votes"], json["rank"], time.split(":")[0] + "h", json["players"]]));
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

    public getRadioManager(): RadioManager{
        return this.radioManager;
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
