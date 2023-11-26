import { HistoryItem } from './HistoryItem';

export class HistoryStorage {
    private static STORAGE_KEY = 'history';

    public addItem(item: HistoryItem): void {
        const items = this.getItems();
        items.push(item);
        localStorage.setItem(HistoryStorage.STORAGE_KEY, JSON.stringify(items));
    }

    public getItemByKey(key: string): HistoryItem | undefined {
        const items = this.getItems();
        return items.find(item => item.key === key);
    }

    public getItems(): HistoryItem[] {
        const data = localStorage.getItem(HistoryStorage.STORAGE_KEY);
        if (data) {
            return JSON.parse(data) as HistoryItem[];
        }
        return [];
    }

    public flush(): void {
        localStorage.setItem(HistoryStorage.STORAGE_KEY, JSON.stringify([]));
    }
}
