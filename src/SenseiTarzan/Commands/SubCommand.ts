import {
  User,
  DMChannel,
  TextChannel,
  NewsChannel,
  GuildMember,
  PermissionResolvable,
  Message, ThreadChannel, PartialDMChannel,
} from "discord.js";
import {ChannelTypeResolvable} from "../Utils/CommandFactory";
export abstract class SubCommand {
  private readonly name: string;
  private readonly description: string;
  private  category: string;
  private channeltype: ChannelTypeResolvable[];
  private permissions: PermissionResolvable[];
  private alias: string[];

  protected constructor(
    name: string,
    description: string,
    alias: string[] = [],
    category: string = "brick à brack",
    permissions: PermissionResolvable[] = [],
    channeltype: ChannelTypeResolvable[] = ["ALL"]
  ) {
    this.name = name;
    this.description = description;
    this.alias = alias;
    this.category = category;
    this.permissions = permissions;
    this.channeltype = channeltype;
  }

  /**
   * donne le nom de la commands
   * @returns string
   */
  public getName(): string {
    return this.name;
  }

  /**
   *  Donne la description des la commands
   * @returns string
   */
  public getDescription(): string {
    return this.description;
  }
  /**
   * Donne les alias que la commandes a
   * @returns string[]
   */
  public getAlias(): string[] {
    return this.alias;
  }
  /**
   *  Mettre des alias
   * @param alias
   */
  public setAlias(alias: string[]): void {
    this.alias = alias;
  }

  /**
   * donne le type de category
   * @returns string
   */
  public getCatergory(): string {
    return this.category;
  }
  /**
   * mettre le type de category de la commands
   * @param category
   */
  public setCatergory(category: string): void {
    this.category = category;
  }



  /**
   * Donne la permissions de la commands
   * @returns PermissionResolvable[]
   */
  public getPermissions(): PermissionResolvable[] {
    return this.permissions;
  }
  /**
   * Mettre la ou les permission de la commande
   * @param permissions
   */
  public setPermissions(permissions: PermissionResolvable[]): void {
    this.permissions = permissions;
  }
  /**
   * Regarde si l'utilisateur a la la permissions de la commands
   * @param member
   * @returns boolean
   */
  public hasPermission(member: GuildMember): boolean {
    let hasperm: boolean = false;
    if (member !== null) {
      if (this.permissions.length > 0) {
        this.permissions.forEach((permission) => {
          if (member.permissions.has(permission)) {
            hasperm = true;
            return;
          }
        });
      } else {
        if (this.permissions.length === 1) {
          hasperm = member.permissions.has(this.permissions.shift());
        }
      }
    } else {
      hasperm = true;
    }
    return hasperm;
  }
  /**
   * fait un test en silence de la permissions de l'utilisateur
   * @param member
   * @returns
   */
  public testPermissionsSilent(member: GuildMember): boolean {
    return this.hasPermission(member);
  }

  /**
   * donne le type de channel a ecrit
   * @returns string
   */
  public getChannelType(): ChannelTypeResolvable {
    return this.channeltype;
  }
  /**
   * mettre le type de channel de la commands
   * @param channeltype
   */
  public setChannelType(channeltype: ChannelTypeResolvable[]): void {
    this.channeltype = channeltype;
  }
  /**
   * Regarde si tu es dans le bon channel
   * @param channel TextChannel | DMChannel | NewsChannel
   * @returns boolean
   */
  public TestChannelSilent(
      channel: PartialDMChannel | DMChannel | TextChannel | NewsChannel | ThreadChannel
  ): boolean {
    return this.channeltype.includes("ALL")
        ? true
        : this.channeltype.includes(channel.type);
  }

  /**
   * creer un le fonctioment de la commands
   * @param sender
   * @param message
   * @param args
   */
  public async execute(
    sender: User,
    message: Message,
    args: Array<any>
  ): Promise<void> {}
}
