import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BQRecordedSessionMeta } from '../../models/bq-recorded-session';
import { NgClass, TitleCasePipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { CountryEmojiPipe } from '../../../shared/pipes/country.pipe';
import { MatIconModule } from '@angular/material/icon';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { OsIconPipe } from '../../../shared/pipes/os-icon.pipe';
import { BrowserIconPipe } from '../../../shared/pipes/browser-icon.pipe';

@Component({
    standalone: true,
    selector: 'app-session-list-item',
    templateUrl: './session-list-item.component.html',
    styleUrl: './session-list-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatTooltipModule,
        TimeAgoPipe,
        CountryEmojiPipe,
        DurationPipe,
        MatIconModule,
        NgClass,
        TitleCasePipe,
        OsIconPipe,
        BrowserIconPipe
    ]
})
export class SessionsListItemComponent {
    selectSession = output<BQRecordedSessionMeta>();
    session = input<BQRecordedSessionMeta>();
    selected = input<boolean>(false);
}
