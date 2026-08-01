export interface AnimationSettings {
  duration?: number | string;
  easing?: string;
  delay?: number | string;
}

export interface AnimationConfig {
  tooltip?: AnimationSettings;
  overlay?: AnimationSettings;
  spotlight?: AnimationSettings;
}
