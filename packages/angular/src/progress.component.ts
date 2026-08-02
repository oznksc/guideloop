import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { createProgress } from '@guideloop/vanilla';
import type { Theme, ThemeConfig } from '@guideloop/vanilla';

/**
 * Standalone progress dots indicator.
 */
@Component({
  selector: 'guideloop-progress',
  standalone: true,
  template: `<div #host class="guideloop-angular-progress-host"></div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .guideloop-angular-progress-host {
        display: contents;
      }
    `,
  ],
})
export class ProgressComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  @Input() current = 1;
  @Input() total = 1;
  @Input() theme: Theme = 'tailwind';
  @Input() customTheme: Partial<ThemeConfig> | undefined;

  private progress: ReturnType<typeof createProgress> | null = null;

  ngOnInit(): void {
    this.progress = createProgress({
      current: this.current,
      total: this.total,
      theme: this.theme,
      customTheme: this.customTheme,
    });
    this.progress.mount(this.host.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.progress) return;
    if (changes['current'] || changes['total']) {
      this.progress.update(this.current, this.total);
    }
  }

  ngOnDestroy(): void {
    this.progress?.destroy();
    this.progress = null;
  }
}
