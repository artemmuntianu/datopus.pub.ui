import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-connections',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './connections.component.html',
})
export class ConnectionsComponent {

    constructor() { }

}