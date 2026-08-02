import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { GuideLoop as TourEngine } from '@guideloop/vanilla';
import type {
  AnimationConfig,
  ButtonLabels,
  PersistConfig,
  Step,
  Theme,
  ThemeConfig,
} from '@guideloop/vanilla';

/**
 * Angular wrapper around the vanilla tour engine.
 *
 * @example
 * ```html
 * <guideloop-tour
 *   [steps]="steps"
 *   [isOpen]="open"
 *   theme="tailwind"
 *   (closed)="open = false"
 *   (complete)="onDone()"
 * />
 * ```
 */
@Component({
  selector: 'guideloop-tour',
  standalone: true,
  template: '',
})
export class GuideLoopComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) steps: Step[] = [];
  @Input() isOpen = false;
  @Input() theme: Theme = 'tailwind';
  @Input() customTheme: Partial<ThemeConfig> | undefined;
  @Input() initialStep = 0;
  @Input() overlay = true;
  @Input() keyboard = true;
  @Input() scrollSmooth = true;
  @Input() spotlightPadding = 8;
  @Input() animations: AnimationConfig | undefined;
  @Input() zIndex = 2000;
  @Input() defaultButtonLabels: ButtonLabels | undefined;
  @Input() persist: PersistConfig | undefined;
  @Input() debug: boolean | 'auto' | undefined;

  /** Emitted when the tour closes (user dismiss or finish path). */
  @Output() closed = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<number>();

  private engine: TourEngine | null = null;
  private starting = false;
  private lastOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['isOpen'] ||
      changes['steps'] ||
      changes['theme'] ||
      changes['customTheme'] ||
      changes['initialStep'] ||
      changes['debug']
    ) {
      void this.syncOpenState();
    }
  }

  ngOnDestroy(): void {
    this.destroyEngine();
  }

  /** Advance to the next step. */
  async next(): Promise<void> {
    await this.engine?.next();
  }

  /** Go to the previous step. */
  async prev(): Promise<void> {
    await this.engine?.prev();
  }

  /** Jump to a step index. */
  async goTo(index: number): Promise<void> {
    await this.engine?.goTo(index);
  }

  /** Skip the tour. */
  skipTour(): void {
    this.engine?.skip();
  }

  /** Close the tour programmatically. */
  close(): void {
    this.isOpen = false;
    this.closeTour();
  }

  private async syncOpenState(): Promise<void> {
    if (this.isOpen && !this.lastOpen) {
      this.lastOpen = true;
      await this.openTour();
    } else if (!this.isOpen && this.lastOpen) {
      this.lastOpen = false;
      this.closeTour();
    }
  }

  private async openTour(): Promise<void> {
    if (this.engine || this.starting) return;
    this.starting = true;
    try {
      this.engine = new TourEngine({
        steps: this.steps,
        theme: this.theme,
        customTheme: this.customTheme,
        initialStep: this.initialStep,
        overlay: this.overlay,
        keyboard: this.keyboard,
        scrollSmooth: this.scrollSmooth,
        spotlightPadding: this.spotlightPadding,
        animations: this.animations,
        zIndex: this.zIndex,
        defaultButtonLabels: this.defaultButtonLabels,
        persist: this.persist,
        debug: this.debug,
        onClose: () => {
          this.closed.emit();
          this.isOpen = false;
          this.lastOpen = false;
          this.destroyEngine();
        },
        onComplete: () => {
          this.complete.emit();
        },
        onSkip: () => {
          this.skip.emit();
        },
        onStepChange: (step) => {
          this.stepChange.emit(step);
        },
      });
      await this.engine.start();
    } finally {
      this.starting = false;
    }
  }

  private closeTour(): void {
    if (!this.engine) return;
    this.engine.close();
  }

  private destroyEngine(): void {
    if (!this.engine) return;
    this.engine.destroy();
    this.engine = null;
  }
}
