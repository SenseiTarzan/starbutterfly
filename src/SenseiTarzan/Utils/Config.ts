import * as yamjs from 'yamljs';
import * as fs from 'fs';
import {parse} from 'path';

export default class Config {
    private readonly filename: string;
    private config: object = {};
    private readonly defaults: object;
    private nestedCache: object = {};
    private changed: boolean;

    constructor(filename: string, defaults: object = {}) {
        this.defaults = defaults;
        this.load(this.filename = filename);
    }

    public get(key: string, value: any = undefined): any {
        return this.config[key] ?? value;
    }

    public getAll(): {} {
        return this.config;
    }

    public setAll(values: object) {
        this.config = values;
    }

    public has(key: string){
        return this.config[key] !== undefined;
    }

    public set(key: string, value: any): void {
        this.config[key] = value;
    }

    public remove(key: string): void {
        if (!this.has(key)) return;
        delete(this.config[key]);
    }

    public save(): void {
        fs.writeFileSync(this.filename, yamjs.stringify(this.config, 4),'utf-8');
    }

    public reload(): void {
        this.config = {};
        this.nestedCache = {};
        this.load(this.filename);
    }

    public load(filename: string): void {
        const path = parse(filename)
        if (!fs.existsSync(path.dir)) {
            fs.mkdirSync(path.dir, {recursive: true});
        }
        if (!fs.existsSync(filename)) {
            this.config = this.defaults;
            if (!fs.existsSync(filename)) {
                fs.writeFileSync(filename, yamjs.stringify(this.defaults, 4), 'utf8');
            }
        }

        this.config = yamjs.load(filename);
    }


    public setNested(key: string, value){
        const vars: string[] = key.split(".");
        let base = vars.shift();

        if (!this.isLiteralObject(this.config)){
            this.config = {};
        }
        if(this.config[base] === undefined){
            this.config[base] = {};
        }

        base = this.config[base];
        while(vars.length > 0){
            let baseKey = vars.shift();
            if(base[baseKey] === undefined){
                base[baseKey] = {};
            }
            if (vars.length === 0) {
                base[baseKey] = value;
            }else {
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
    public getNested(key: string, defaults: any = undefined){
        if(this.nestedCache[key] != undefined){
            return this.nestedCache[key];
        }

        const vars: string[] = key.split(".");
        let base: any = vars.shift();
        if (!this.isLiteralObject(this.config)){
            this.config = {};
        }
        if(this.config[base] !== undefined){
            base = this.config[base];
        }else{
            return defaults;
        }

        while(vars.length > 0){
            let baseKey = vars.shift();
            if(this.isLiteralObject(base) && base[baseKey]){
                base = base[baseKey];
            }else{
                return defaults;
            }
        }

        return this.nestedCache[key] = base;
    }

    public  isLiteralObject(value) {
        return value instanceof Object && value.constructor === Object;
    }

    public  removeNested(key: string) : void {
        this.nestedCache = [];
        this.changed = true;

        const vars: string[] = key.split(".");

        let currentNode = this.config;
        while (vars.length > 0) {
            const nodeName = vars.shift();
            if (currentNode[nodeName] !== undefined) {
                if (vars.length === 0) { //final node
                    delete(currentNode[nodeName]);
                }
                if (this.isLiteralObject(currentNode[nodeName])) {
                    currentNode = currentNode[nodeName];
                }
            } else {
                break;
            }
        }
    }
}