import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/api/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-demo-use-cases',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule],
    templateUrl: './demo-use-cases.component.html',
    styleUrl: './demo-use-cases.component.scss'
})
export class DemoUseCasesComponent {

    constructor(private authService: AuthService, private toastr: ToastrService) { }

    async signIn(credsIndex: number) {
        const creds = [
            ['demo1@gmail.com', '012345'],
            ['demo2@gmail.com', '012345']
        ];
        const { data, error } = await this.authService.signIn(creds[credsIndex][0], creds[credsIndex][1]);
        if (error)
            this.toastr.error(error.message);
        else
            window.location.pathname = '/';
    }

}