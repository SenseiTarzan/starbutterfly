export  default  class Radio{
    private readonly name: string;
    private readonly description: string;
    private readonly icon: string;
    private readonly url: string;
    constructor(name: string, url: string,description: string, icon: string) {
        this.name = name;
        this.url = url;
        this.description = description;
        this.icon = icon;
    }

    public getName(): string{
        return  this.name;
    }

    public getUrl(): string{
        return this.url;
    }

    public getDescription(): string{
        return  this.description;
    }
    public  getIconUrl(): string{
        return this.icon;
    }
}