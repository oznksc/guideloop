import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { createOnboardingChecklist } from '@guideloop/vanilla';
import type {
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
  Theme,
  ThemeConfig,
} from '@guideloop/vanilla';

/**
 * Angular host for the vanilla onboarding checklist UI.
 */
@Component({
  selector: 'guideloop-onboarding-checklist',
  standalone: true,
  template: `<div #host class="guideloop-angular-onboarding-host"></div>`,
  styles: [
    `
      :host {
        display: block;
      }
      .guideloop-angular-onboarding-host {
        display: contents;
      }
    `,
  ],
})
export class OnboardingChecklistComponent implements OnInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) items: OnboardingItem[] = [];
  @Input() title = 'Getting Started';
  @Input() description: string | undefined;
  @Input() completedIds: string[] | undefined;
  @Input() defaultCompletedIds: string[] = [];
  @Input() theme: Theme = 'tailwind';
  @Input() customTheme: Partial<ThemeConfig> | undefined;
  @Input() persist: OnboardingChecklistOptions['persist'];
  @Input() labels: OnboardingChecklistOptions['labels'];
  @Input() collapsible = true;
  @Input() collapsed: boolean | undefined;
  @Input() defaultCollapsed = false;
  @Input() showProgressBar = true;
  @Input() emptyState = 'No onboarding steps yet.';
  @Input() ariaLabel = 'Getting started checklist';
  @Input() className: string | undefined;
  @Input() zIndex = 3000;

  @Output() completed = new EventEmitter<OnboardingProgress>();
  @Output() progress = new EventEmitter<OnboardingProgress>();

  private checklist: ReturnType<typeof createOnboardingChecklist> | null = null;

  ngOnInit(): void {
    this.mount();
  }

  ngOnDestroy(): void {
    this.checklist?.destroy();
    this.checklist = null;
  }

  completeItem(id: string): void {
    this.checklist?.completeItem(id);
  }

  uncompleteItem(id: string): void {
    this.checklist?.uncompleteItem(id);
  }

  getProgress(): OnboardingProgress | undefined {
    return this.checklist?.getProgress();
  }

  /** Rebuild with current inputs after external data changes. */
  refresh(): void {
    this.mount();
  }

  private mount(): void {
    const el = this.host?.nativeElement;
    if (!el) return;
    this.checklist?.destroy();
    this.checklist = createOnboardingChecklist({
      items: this.items,
      title: this.title,
      description: this.description,
      completedIds: this.completedIds,
      defaultCompletedIds: this.defaultCompletedIds,
      theme: this.theme,
      customTheme: this.customTheme,
      persist: this.persist,
      labels: this.labels,
      collapsible: this.collapsible,
      collapsed: this.collapsed,
      defaultCollapsed: this.defaultCollapsed,
      showProgressBar: this.showProgressBar,
      emptyState: this.emptyState,
      ariaLabel: this.ariaLabel,
      className: this.className,
      zIndex: this.zIndex,
      onComplete: (p) => this.completed.emit(p),
      onProgressChange: (p) => this.progress.emit(p),
    });
    this.checklist.mount(el);
  }
}
