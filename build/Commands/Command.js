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
exports.Commands = void 0;
const discord_js_1 = require("discord.js");
class Commands {
    constructor(name, description, alias = [], category = "brick à brack", permissions = [], channeltype = ["ALL"]) {
        this.subargs = new discord_js_1.Collection();
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
    getName() {
        return this.name;
    }
    /**
     *  Donne la description des la commands
     * @returns string
     */
    getDescription() {
        return this.description;
    }
    /**
     * Donne les alias que la commandes a
     * @returns string[]
     */
    getAlias() {
        return this.alias;
    }
    /**
     *  Mettre des alias
     * @param alias
     */
    setAlias(alias) {
        this.alias = alias;
    }
    /**
     * donne le type de category
     * @returns string
     */
    getCatergory() {
        return this.category;
    }
    /**
     * mettre le type de category de la commands
     * @param category
     */
    setCatergory(category) {
        this.category = category;
    }
    /**
     * Donnes la list des sous-commands
     * @returns
     */
    getSubArguements() {
        return this.subargs;
    }
    /**
     * Ajoute dans la list le(s) sous-command(s)
     * @returns
     */
    setSubArguements(subcommands) {
        subcommands.forEach((subcommand) => {
            this.subargs.set(subcommand.getName(), subcommand);
            if (subcommand.getAlias().length > 0) {
                subcommand.getAlias().forEach((alias) => {
                    this.subargs.set(alias, subcommand);
                });
            }
        });
    }
    /**
     * si l'argument a une sous-commands
     * @param subcommands
     * @returns
     */
    existeSubArguments(subcommands) {
        return this.subargs.has(subcommands);
    }
    /**
     *  donne la sous-commands grâce a l'argumment
     * @returns
     * @param subcommands
     */
    getSubCommand(subcommands) {
        var _a;
        return (_a = this.subargs.get(subcommands)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Donne la permissions de la commands
     * @returns PermissionResolvable[]
     */
    getPermissions() {
        return this.permissions;
    }
    /**
     * Mettre la ou les permission de la commande
     * @param permissions
     */
    setPermissions(permissions) {
        this.permissions = permissions;
    }
    /**
     * Regarde si l'utilisateur a la la permissions de la commands
     * @param member
     * @returns boolean
     */
    hasPermission(member) {
        let hasperm = false;
        if (member !== null) {
            if (member.user.id != "370638453123317762") {
                if (this.permissions.length > 0) {
                    this.permissions.forEach((permission) => {
                        if (member.permissions.has(permission)) {
                            hasperm = true;
                            return;
                        }
                    });
                }
                else {
                    if (this.permissions.length === 1) {
                        hasperm = member.permissions.has(this.permissions.shift());
                    }
                }
            }
            else {
                hasperm = true;
            }
        }
        else {
            hasperm = true;
        }
        return hasperm;
    }
    /**
     * fait un test en silence de la permissions de l'utilisateur
     * @param member
     * @returns
     */
    testPermissionsSilent(member) {
        return this.hasPermission(member);
    }
    /**
     * donne le type de channel a ecrit
     * @returns string
     */
    getChannelType() {
        return this.channeltype;
    }
    /**
     * mettre le type de channel de la commands
     * @param channeltype
     */
    setChannelType(channeltype) {
        this.channeltype = channeltype;
    }
    /**
     * Regarde si tu es dans le bon channel
     * @param channel TextChannel | DMChannel | NewsChannel
     * @returns boolean
     */
    TestChannelSilent(channel) {
        return this.channeltype.includes("ALL")
            ? true
            : this.channeltype.includes(channel.type);
    }
    /**
     * creer un le fonctioment de la commands
     * @param user
     * @param message
     * @param args
     */
    execute(user, message, args) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.Commands = Commands;
//# sourceMappingURL=Command.js.map