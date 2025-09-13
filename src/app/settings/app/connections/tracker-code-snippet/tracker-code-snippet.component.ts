import { Component, input, computed, output, ViewChild, ElementRef, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    standalone: true,
    selector: 'app-tracker-code-snippet',
    templateUrl: './tracker-code-snippet.component.html',
    styleUrl: './tracker-code-snippet.component.scss',
    imports: [MatCardModule, MatButtonModule]
})
export class TrackerCodeSnippetComponent {
    @ViewChild('codeBlock') codeBlock: ElementRef;

    identifier = input<string>();
    copyCodeBtnTitle = signal<string>('Copy');

    private trackerCodeSnippet = `&lt;script&gt;
	((d,a,t,o,p,u,s)=>{if(!d[p]){let e={view:p+":prevViewFeature",action0:p+":prevActionFeature0",action1:p+":prevActionFeature1"};Object.values(e).forEach(key=>t.setItem(key,"")),d.GlobalDatopusNamespace=d.GlobalDatopusNamespace||[],d.GlobalDatopusNamespace.push(p),d[p]=function(...args){["trackView","trackAction"].includes(args[0])&&(args.length<3&&Array.prototype.push.call(args,{}),"trackView"===args[0]?(args[2].prevFeature=t.getItem(e.view),t.setItem(e.view,args[1])):t.getItem(e.action1)===args[1]?args[2].prevFeature=t.getItem(e.action0):(args[2].prevFeature=t.getItem(e.action1),t.setItem(e.action0,args[2].prevFeature),t.setItem(e.action1,args[1]))),(d[p].q=d[p].q||[]).push(args)},d[p].q=d[p].q||[],u=a.createElement("script"),s=a.getElementsByTagName("script")[0],u.async=!0,u.src="https://datopus.blob.core.windows.net/scripts/ds.min.js",s.parentNode.insertBefore(u,s)}})(window,document,localStorage,0,"datopus");
	window.datopus("newTracker", "<datasource_identifier>");
&lt;/script&gt;`;

    snippet = computed(() => {
        const identifier = this.identifier();
        return this.trackerCodeSnippet.replace('<datasource_identifier>', identifier ?? '');
    });

    async copyCode() {
        try {
            const code = this.codeBlock.nativeElement.innerText;
            await navigator.clipboard.writeText(code);
            this.copyCodeBtnTitle.set('Copied!');
            setTimeout(() => this.copyCodeBtnTitle.set('Copy'), 2000);
        } catch (error) {
            this.copyCodeBtnTitle.set('Error!');
            setTimeout(() => this.copyCodeBtnTitle.set('Copy'), 2000);
        }
    }
}
