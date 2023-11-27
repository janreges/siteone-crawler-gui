<script lang="ts">
    import type {TimelineState} from "../types/TimelineState";

    export let state:TimelineState;
</script>

<div>
    <ul class="timeline">
        <li>
            <div class="timeline-start timeline-box timeline-box-small">Start</div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-success={state.started}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <hr class:bg-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:bg-success={state.progressPercentage === 100}/>
        </li>
        <li>
            <hr class:bg-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:bg-success={state.progressPercentage === 100}/>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-warning={state.progressPercentage !== null && state.progressPercentage < 100} class:text-success={state.progressPercentage === 100}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <div class="timeline-end timeline-box timeline-box-small text-center" style="min-width: 100px;">{#if state.progressPercentage !== null}{state.progressPercentage}%: {state.progressCurrent}/{state.progressTotal}{:else}0%{/if}</div>
            <hr class:bg-success={state.htmlReport}/>
        </li>
        <li>
            <hr class:bg-success={state.htmlReport}/>
            <div class="timeline-start timeline-box timeline-box-small">HTML report</div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                     class="w-5 h-5" class:text-success={state.htmlReport}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <hr class:bg-success={state.offlineExport || state.finished}>
        </li>
        <li>
            <hr class:bg-success={state.offlineExport || state.finished}>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" class:text-success={state.offlineExport}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
            <div class="timeline-end timeline-box timeline-box-small">Offline export</div>
            <hr class:bg-success={state.finished}>
        </li>
        <li>
            <hr class:bg-success={state.finished}>
            <div class="timeline-start timeline-box timeline-box-small">Finished</div>
            <div class="timeline-middle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" class:text-success={state.finished}>
                    <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clip-rule="evenodd"/>
                </svg>
            </div>
        </li>
    </ul>
    <progress class="progress progress-success w-148" value={state.progressPercentage} max="100"></progress>
</div>

