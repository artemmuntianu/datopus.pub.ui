import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { BQRecordedSessionMeta } from '../models/bq-recorded-session';
import { SessionsListItemComponent } from "./session-list-item/session-list-item.component";
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
    standalone: true,
    selector: 'app-sessions-list',
    templateUrl: './sessions-list.component.html',
    styleUrl: './sessions-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SessionsListItemComponent, MatDividerModule, MatProgressSpinnerModule, NgScrollbarModule]
})
export class SessionsListComponent {
    selectSession = output<BQRecordedSessionMeta>();
    sessionList = input<BQRecordedSessionMeta[]>([]);
    loading = input<boolean>(false);
    selectedRecording = signal<BQRecordedSessionMeta | null>(null);
}
