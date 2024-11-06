import { AnimationConfig } from "../../utils/animation";

export interface OverlayProps {
    onClick: () => void;
    className?: string;
    animation?: AnimationConfig['overlay'];
  }