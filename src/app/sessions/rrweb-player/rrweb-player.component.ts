import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    input,
    signal,
    untracked,
    ViewChild
} from '@angular/core';
import rrwebPlayer from 'rrweb-player';
import { eventWithTime } from '@rrweb/types';
import { NgClass } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type PlayerState = 'initial' | 'loading' | 'playing' | 'error' | 'empty';

@Component({
    selector: 'app-rrweb-player',
    templateUrl: './rrweb-player.component.html',
    standalone: true,
    styleUrls: ['./rrweb-player.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, MatProgressSpinnerModule]
})
export class RRwebPlayerComponent {
    @ViewChild('playerContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

    events = input<eventWithTime[] | null>(null);
    player = signal<rrwebPlayer | null>(null);
    playerState = signal<PlayerState>('initial');
    loading = input<boolean>(false);
    private resizeObserver!: ResizeObserver;
    private initialResolution: {
        width: number;
        height: number;
    } | null = null;
    private PLAYER_CONTROLS_HEIGHT = 100;

    constructor(private elRef: ElementRef) {
        effect(
            () => {
                const events = this.events();

                this.destroyPlayer();

                if (events === null || events === undefined) {
                    this.setState('initial');
                    return;
                }

                this.createPlayer(events);
            },
            { allowSignalWrites: true }
        );
    }

    ngOnDestroy(): void {
        this.destroyPlayer();
        window.removeEventListener('resize', this.handleResize);
    }

    stopPlayer() {
        const player = this.player();
        if (player !== null) {
            player.pause();
        }
    }

    destroyPlayer() {
        try {
            untracked(this.player)?.getReplayer().destroy();
        } finally {
            this.player.set(null);
            this.containerRef.nativeElement.innerHTML = '';
        }
    }

    ngAfterViewInit(): void {
        this.resizeObserver = new ResizeObserver(() => this.updateStyles());
        this.resizeObserver.observe(this.elRef.nativeElement);
    }

    handleResize = () => {
        this.player()?.triggerResize();
    };

    private setState(state: PlayerState) {
        if (this.loading()) {
            this.playerState.set('loading');
        } else {
            this.playerState.set(state);
        }
    }

    private createPlayer(events: eventWithTime[]): void {
        try {
            if (events?.length <= 2) {
                this.setState('empty');
                return;
            }

            setTimeout(() => {
                const rect = this.elRef.nativeElement.getBoundingClientRect();
                const player = new rrwebPlayer({
                    target: this.containerRef.nativeElement,
                    props: {
                        events,
                        showWarning: false,
                        autoPlay: true,
                        height: rect.height - this.PLAYER_CONTROLS_HEIGHT,
                        width: rect.width
                    }
                });

                this.initialResolution = null;

                this.setState('playing');

                this.player.set(player);

                setTimeout(() => {
                    this.updateStyles();
                });
            });
        } catch {
            this.setState('error');
        }
    }

    private updateStyles() {
        if (this.initialResolution === null) {
            this.initialResolution = this.getRecordedResolutionFromScale();
        }

        const isFullScreen = this.isFullScreen();
        const rect = isFullScreen
            ? { width: window.innerWidth, height: window.innerHeight }
            : this.elRef.nativeElement.getBoundingClientRect();

        const frame = this.containerRef.nativeElement.querySelector(
            '.rr-player__frame'
        ) as HTMLElement;
        const player = this.containerRef.nativeElement.querySelector('.rr-player') as HTMLElement;
        const wrapper = this.containerRef.nativeElement.querySelector(
            '.replayer-wrapper'
        ) as HTMLElement;

        if (!player || !frame || !wrapper) {
            return;
        }

        player.style.width = `${rect.width}px`;
        player.style.height = `${rect.height}px`;
        frame.style.width = `${rect.width}px`;
        frame.style.height = `${rect.height}px`;

        if (!this.initialResolution) {
            return;
        }

        const scaleX = this.axisScale(rect.width, this.initialResolution.width);
        const scaleY = this.axisScale(rect.height, this.initialResolution.height);

        const scale = Math.min(scaleX, scaleY);

        wrapper.style.transform = `scale(${scale}) translate(-50%, -50%)`;
        wrapper.style.transformOrigin = 'top left';
    }

    private axisScale(available: number, initial: number): number {
        return available >= initial ? initial / available : available / initial;
    }

    private isFullScreen(): boolean {
        return document.fullscreenElement != null;
    }

    private getRecordedResolutionFromScale(): { width: number; height: number } | null {
        const wrapper = this.containerRef.nativeElement.querySelector(
            '.replayer-wrapper'
        ) as HTMLElement;
        if (!wrapper) {
            return null;
        }

        const transform = wrapper.style.transform;
        const scaleMatch = /scale\(([\d.]+)\)/.exec(transform);
        if (!scaleMatch) {
            return null;
        }

        const scale = parseFloat(scaleMatch[1]);
        if (!scale) {
            return null;
        }

        const rect = this.elRef.nativeElement.getBoundingClientRect();
        const containerWidth = rect.width;
        const containerHeight = rect.height;

        return {
            width: containerWidth / scale,
            height: containerHeight / scale
        };
    }
}
