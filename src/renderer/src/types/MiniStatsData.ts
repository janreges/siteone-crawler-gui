export class MiniStatsData {
    public htmlNumber: number | null = null;
    public htmlTimeTotal: number | null = null;
    public htmlTimeAvg: number | null = null;
    public htmlTimeMin: number | null = null;
    public htmlTimeMax: number | null = null;
    public htmlTimeAvgDirection: 'up' | 'down' | null = null;
    public code200x: number | null = null;
    public code300x: number | null = null;
    public code400x: number | null = null;
    public code500x: number | null = null;
    public codeErr: number | null = null;
    public contentHtmlNumber: number | null = null;
    public contentHtmlSize: number | null = null;
    public contentImgNumber: number | null = null;
    public contentImgSize: number | null = null;
    public contentJsNumber: number | null = null;
    public contentJsSize: number | null = null;
    public contentCssNumber: number | null = null;
    public contentCssSize: number | null = null;
    public contentFontsNumber: number | null = null;
    public contentFontsSize: number | null = null;
    public contentFilesNumber: number | null = null;
    public contentFilesSize: number | null = null;

    public reset(): void {
        this.htmlNumber = null;
        this.htmlTimeTotal = null;
        this.htmlTimeAvg = null;
        this.htmlTimeMin = null;
        this.htmlTimeMax = null;
        this.htmlTimeAvgDirection = null;
        this.code200x = null;
        this.code300x = null;
        this.code400x = null;
        this.code500x = null;
        this.codeErr = null;
        this.contentHtmlNumber = null;
        this.contentHtmlSize = null;
        this.contentImgNumber = null;
        this.contentImgSize = null;
        this.contentJsNumber = null;
        this.contentJsSize = null;
        this.contentCssNumber = null;
        this.contentCssSize = null;
        this.contentFontsNumber = null;
        this.contentFontsSize = null;
        this.contentFilesNumber = null;
        this.contentFilesSize = null;
    }

    public handleUrlInfoLine(line: string): { statusCode: number, fileType: string, duration: number, size: number } | null {
        const info = this.parseUrlInfoLine(line);
        if (info === null) {
            return null;
        }

        // html stats
        if (info.fileType.toLowerCase() === 'html') {
            this.htmlNumber++;
            this.htmlTimeTotal += info.duration;
            if (this.htmlTimeMin === null || info.duration < this.htmlTimeMin) {
                this.htmlTimeMin = info.duration;
            }
            if (this.htmlTimeMax === null || info.duration > this.htmlTimeMax) {
                this.htmlTimeMax = info.duration;
            }

            const avgTime = parseFloat(Number(this.htmlTimeTotal / this.htmlNumber).toFixed(3));
            if (this.htmlTimeAvg !== null) {
                if (avgTime > this.htmlTimeAvg) {
                    this.htmlTimeAvgDirection = 'up';
                } else if (avgTime < this.htmlTimeAvg) {
                    this.htmlTimeAvgDirection = 'down';
                }
            }
            this.htmlTimeAvg = avgTime;
        }

        // status code stats
        if (info.statusCode >= 200 && info.statusCode < 300) {
            this.code200x++;
        } else if (info.statusCode >= 300 && info.statusCode < 400) {
            this.code300x++;
        } else if (info.statusCode >= 400 && info.statusCode < 500) {
            this.code400x++;
        } else if (info.statusCode >= 500 && info.statusCode < 600) {
            this.code500x++;
        } else {
            this.codeErr++;
        }

        // content stats
        if (info.fileType === 'HTML') {
            this.contentHtmlNumber++;
            this.contentHtmlSize += info.size;
        } else if (info.fileType === 'Image') {
            this.contentImgNumber++;
            this.contentImgSize += info.size;
        } else if (info.fileType === 'JS') {
            this.contentJsNumber++;
            this.contentJsSize += info.size;
        } else if (info.fileType === 'CSS') {
            this.contentCssNumber++;
            this.contentCssSize += info.size;
        } else if (info.fileType === 'Font') {
            this.contentFontsNumber++;
            this.contentFontsSize += info.size;
        } else {
            this.contentFilesNumber++;
            this.contentFilesSize += info.size;
        }

        return info;
    }

    private parseUrlInfoLine(line: string): { statusCode: number, fileType: string, duration: number, size: number } | null {
        if (!line || !line.includes('|')) {
            return null;
        }

        function convertToBaseUnit(value, unit): number {
            const units = {
                'ms': 1 / 1000,
                's': 1,
                'B': 1,
                'kB': 1024,
                'MB': 1024 * 1024,
                'GB': 1024 * 1024 * 1024
            };
            return value * (units[unit] || 1);
        }

        // remove ASCII colors
        const cleanedLine = line.replace(/\x1b\[[0-9;]*m/g, '');

        // split by pipe
        const parts = cleanedLine.split('|').map(part => part.trim());

        // extract values
        const statusCode = Number(parts[4]);
        const fileType = parts[5];
        let [duration, durationUnit] = parts[6].split(' ');
        let [size, sizeUnit] = parts[7].split(' ');

        // convert units
        const durationNumber = convertToBaseUnit(parseFloat(duration), durationUnit);
        const sizeNumber = convertToBaseUnit(parseFloat(size), sizeUnit);

        return {
            statusCode,
            fileType,
            duration: durationNumber,
            size: sizeNumber
        };
    }
}
