import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'osIcon', pure: true, standalone: true })
export class OsIconPipe implements PipeTransform {
  private readonly osIconMap: Record<string, string> = {
    'windows': 'windows',
    'macintosh': 'laptop_mac',
    'linux': 'terminal',
    'android': 'android',
    'ios': 'phone_iphone',
    'chrome os': 'laptop_chromebook',
    'other': 'devices_other',
  };

  transform(os: string | null | undefined): string {
    const key = os?.toLowerCase().trim() ?? 'other';
    return this.osIconMap[key] || this.osIconMap['other'];
  }
}