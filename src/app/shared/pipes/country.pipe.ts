import { Pipe, PipeTransform } from '@angular/core';
import countryNameToCodeMap from './countryNameToCodeMap';

@Pipe({
    name: 'countryEmoji',
    standalone: true,
    pure: true
})
export class CountryEmojiPipe implements PipeTransform {
    transform(value: unknown, ...args: unknown[]): string {
        if (typeof value !== 'string' || !value) {
            return '';
        }

        let countryCode: string | null | undefined = null;


        if (value.trim().length !== 2) {
           countryCode = countryNameToCodeMap.get(value);

           if (!countryCode) return '';

        } else {
            countryCode = value.trim().toUpperCase();
        }
       

        if (!/^[A-Z]{2}$/.test(countryCode)) {
            return '';
        }

        try {
            const codePoints = countryCode
                .split('') // ['U', 'S']
                .map(char => 0x1f1e6 + (char.charCodeAt(0) - 65));

            return String.fromCodePoint(...codePoints);
        } catch (error) {
            console.error(
                `CountryEmojiPipe: Error processing country code "${countryCode}"`,
                error
            );
            return '❓';
        }
    }
}
