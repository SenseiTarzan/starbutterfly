import {BitFieldResolvable, Client, Collection} from "discord.js";
import { Commands } from "../Commands/Command";

export type ChannelTypeResolvable = BitFieldResolvable<ChannelType, bigint>;

export type ChannelType =
    | 'ALL'
    | 'DM'
    | 'GUILD_NEWS'
    | 'GUILD_TEXT'
    | 'GUILD_NEWS_THREAD'
    | 'GUILD_PUBLIC_THREAD'
    | 'GUILD_PRIVATE_THREAD';

export default class CommandFactory {
  private commands: Collection<string, Commands>;
  private static prefix: string;
  private static instance: CommandFactory;
  constructor(client: Client, prefix: string) {
    this.commands = new Collection<string, Commands>();
    CommandFactory.instance = this;
    CommandFactory.prefix = prefix;
    client.on("messageCreate", async (message) => {
      if (!message.content.startsWith(prefix) || message.author.bot) return;
      const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
      const command: string = args.shift().toLowerCase();
      if (this.hasCommand(command)) {
        const commands: Commands | null = this.getCommand(command);
        if (commands instanceof Commands) {
          await commands.execute(message.author, message, args);
          return;
        }
      }
    });
  }

  public static getPrefix(): string{
    return  this.prefix;
  }
  public static getInstance(): CommandFactory{
    return  this.instance;
  }


  /**
   * Permet de d'erengistre des Commands Discord
   * @param Command
   * @param overide
   * @returns
   */
  public registerCommands(Command: Commands, overide: boolean = false): void {
    const CommandName: string = Command.getName();
    const CommandAlias: string[] = Command.getAlias();
    if (!this.hasCommand(CommandName)) {
      this.commands.set(CommandName, Command);
      console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre`);
    } else {
      if (overide) {
        this.commands.set(CommandName, Command);
        console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre`);
        return;
      }
      console.log(
        `Vous ne pouvez pas enregistre ${CommandName} car il est deja existante`
      );
    }
    CommandAlias.forEach((alias) => {
      if (!this.hasCommand(alias)) {
        console.log(`Command ${CommandFactory.prefix}${CommandName} a été enregistre avec avec l'alias: ${alias}`);
        this.commands.set(alias, Command);
      } else {
        console.log(
          `Vous ne pouvez pas enregistre ${alias} car il est deja existante`
        );
      }
    });
  }

  /**
   * Donne true si la commands existe sinon false
   * @param CommandName
   * @returns
   */
  public hasCommand(CommandName: string): boolean {
    return this.commands.has(CommandName);
  }
  /**
   * donnes la Classe de la commande si elle existe sinon null
   * @param CommandName
   * @returns
   */
  public getCommand(CommandName: string): Commands | null {
    try {
      return this.commands.get(CommandName);
    } catch (error) {
      return null;
    }
  }
}
