// HistoryItem.ts
export class HistoryItem {
    key: string;
    datetime: string;
    url: string;
    formData: string;

    constructor(datetime: string, url: string, formData: string) {
        this.key = this.generateUniqueString();
        this.datetime = datetime;
        this.url = url;
        this.formData = formData;
    }

    private generateUniqueString(): string {
        const time = Date.now();
        const random = Math.random() * Math.pow(10, 17);
        return (time.toString(36) + random.toString(36)).substr(0, 20);
    }
}
