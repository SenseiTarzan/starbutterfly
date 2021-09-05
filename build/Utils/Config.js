"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yamjs = require("yamljs");
const fs = require("fs");
const path_1 = require("path");
class Config {
    constructor(filename, defaults = {}) {
        this.config = {};
        this.nestedCache = {};
        this.defaults = defaults;
        this.load(this.filename = filename);
    }
    get(key, value = undefined) {
        var _a;
        return (_a = this.config[key]) !== null && _a !== void 0 ? _a : value;
    }
    getAll() {
        return this.config;
    }
    setAll(values) {
        this.config = values;
    }
    has(key) {
        return this.config[key] !== undefined;
    }
    set(key, value) {
        this.config[key] = value;
    }
    remove(key) {
        if (!this.has(key))
            return;
        delete (this.config[key]);
    }
    save() {
        fs.writeFileSync(this.filename, yamjs.stringify(this.config, 4), 'utf-8');
    }
    reload() {
        this.config = {};
        this.nestedCache = {};
        this.load(this.filename);
    }
    load(filename) {
        const path = (0, path_1.parse)(filename);
        if (!fs.existsSync(path.dir)) {
            fs.mkdirSync(path.dir, { recursive: true });
        }
        if (!fs.existsSync(filename)) {
            this.config = this.defaults;
            if (!fs.existsSync(filename)) {
                fs.writeFileSync(filename, yamjs.stringify(this.defaults, 4), 'utf8');
            }
        }
        this.config = yamjs.load(filename);
    }
    setNested(key, value) {
        const vars = key.split(".");
        let base = vars.shift();
        if (!this.isLiteralObject(this.config)) {
            this.config = {};
        }
        if (this.config[base] === undefined) {
            this.config[base] = {};
        }
        base = this.config[base];
        while (vars.length > 0) {
            let baseKey = vars.shift();
            if (base[baseKey] === undefined) {
                base[baseKey] = {};
            }
            if (vars.length === 0) {
                base[baseKey] = value;
            }
            else {
                base = base[baseKey];
            }
        }
        this.nestedCache = {};
    }
    /**
     *
     * @return mixed
     * @param key
     * @param defaults
     */
    getNested(key, defaults = undefined) {
        if (this.nestedCache[key] != undefined) {
            return this.nestedCache[key];
        }
        const vars = key.split(".");
        let base = vars.shift();
        if (!this.isLiteralObject(this.config)) {
            this.config = {};
        }
        if (this.config[base] !== undefined) {
            base = this.config[base];
        }
        else {
            return defaults;
        }
        while (vars.length > 0) {
            let baseKey = vars.shift();
            if (this.isLiteralObject(base) && base[baseKey]) {
                base = base[baseKey];
            }
            else {
                return defaults;
            }
        }
        return this.nestedCache[key] = base;
    }
    isLiteralObject(value) {
        return value instanceof Object && value.constructor === Object;
    }
    removeNested(key) {
        this.nestedCache = [];
        this.changed = true;
        const vars = key.split(".");
        let currentNode = this.config;
        while (vars.length > 0) {
            const nodeName = vars.shift();
            if (currentNode[nodeName] !== undefined) {
                if (vars.length === 0) { //final node
                    delete (currentNode[nodeName]);
                }
                if (this.isLiteralObject(currentNode[nodeName])) {
                    currentNode = currentNode[nodeName];
                }
            }
            else {
                break;
            }
        }
    }
}
exports.default = Config;
//# sourceMappingURL=Config.js.map