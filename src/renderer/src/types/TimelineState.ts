export class TimelineState {
    started: boolean = false;
    progressPercentage: number | null = null;
    progressCurrent: number | null = null;
    progressTotal: number | null = null;
    htmlReport: boolean = false;
    offlineExport: boolean = false;
    markdownExport: boolean = false;
    finished: boolean = false;

    public reset(): void
    {
        this.started = false;
        this.progressPercentage = null;
        this.progressCurrent = null;
        this.progressTotal = null;
        this.htmlReport = false;
        this.offlineExport = false;
        this.markdownExport = false;
        this.finished = false;
    }

}
