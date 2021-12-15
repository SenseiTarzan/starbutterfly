import {PermissionResolvable,} from "discord.js";
import {ChannelTypeResolvable} from "../Utils/CommandFactory";
import {Commands} from "./Command";

export abstract class SubCommand extends Commands{
  protected constructor(
    name: string,
    description: string,
    alias: string[] = [],
    category: string = "brick à brack",
    permissions: PermissionResolvable[] = [],
    channeltype: ChannelTypeResolvable[] = ["ALL"],
    groups: string[] = []
  ) {
    super(name, description, alias, category, permissions, channeltype, groups)
  }
}
