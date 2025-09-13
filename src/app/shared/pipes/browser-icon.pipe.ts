import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'browserIcon', pure: true, standalone: true })
export class BrowserIconPipe implements PipeTransform {
  private readonly browserIconMap: Record<string, string> = {
    'chrome': 'language',
    'safari': 'travel_explore',
    'firefox': 'local_fire_department',
    'edge': 'hub',
    'opera': 'track_changes',
    'samsung internet': 'smartphone',
    'android webview': 'mobile_friendly',
    'brave': 'security',
    'other': 'device_unknown',
  };

  transform(browser: string | null | undefined): string {
    const key = browser?.toLowerCase().trim() ?? 'other';
    return this.browserIconMap[key] || this.browserIconMap['other'];
  }
}