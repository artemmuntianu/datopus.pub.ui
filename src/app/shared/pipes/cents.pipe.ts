import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cents', pure: true, standalone: true })
export class CentsPipe implements PipeTransform {
    transform(value: number | null | undefined): number {
        return (value ?? 0) / 100;
    }
}