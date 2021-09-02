import {Client, Intents} from "discord.js";
import Config from "./Utils/Config";
import CommandFactory from "./Utils/CommandFactory";
import {VoteAPI} from "./Api/VoteAPI";
import LanguageAPI from "./Api/language/LanguageAPI";
import * as path from "path";
import VoteCommand from "./Commands/hevolia/VoteCommand";
export default class Main {
    private readonly config: Config;
    private readonly client: Client;
    private readonly prefix: string = "!/";
    private readonly commandMap: CommandFactory;
    private readonly dataFolder: string;
    private static instance: Main;
    private VoteApi: VoteAPI;
    private LanguageApi: LanguageAPI;

    constructor() {
        this.config = new Config("resources/config.yml",{"token": "", "prefix": "!/"});
        this.client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], partials: ["CHANNEL"] });
        this.prefix = this.config.get("prefix","!/");
        this.commandMap = new CommandFactory(this.client,this.prefix);
        console.log(path.resolve(__dirname) + "resources/")
        this.dataFolder = './resources/';
        Main.instance = this;
        this.loadApi();
        this.loadCommands();
        this.start();
    }

    public loadApi(): void{
        this.VoteApi = new VoteAPI(this);
        this.LanguageApi = new LanguageAPI(this);
    }

    public loadCommands(): void{
        const commandsMap = this.commandMap;
        commandsMap.registerCommands(new VoteCommand());
    }

    public start(): void{
        this.client.once('ready', () => {
            console.log("ready:\n"  + this.client.user.username  + "#" + this.client.user.discriminator)
        });
        this.client.login(this.config.get("token"));

    }

    public getVoteApi(): VoteAPI{
        return this.VoteApi;
    }
    public getLanguageApi(): LanguageAPI{
        return this.LanguageApi;
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