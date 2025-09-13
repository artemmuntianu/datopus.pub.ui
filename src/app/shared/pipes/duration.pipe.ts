import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'duration',
	standalone: true,
	pure: true
})
export class DurationPipe implements PipeTransform {
    transform(value: any): string {
		if (typeof value !== 'number') return 'N/A';
		
        const totalSeconds = Math.floor(value / 1000);

        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes < 60) {
            return `${this.pad(minutes)}:${this.pad(seconds)}`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        return `${this.pad(hours)}:${this.pad(remainingMinutes)}:${this.pad(seconds)}`;
    }

    private pad(num: number): string {
        return num.toString().padStart(2, '0');
    }
}
