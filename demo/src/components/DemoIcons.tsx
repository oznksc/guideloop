import type { ReactNode, SVGProps } from "react";
import { withBasePath } from "../utils/asset";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({
  children,
  ...props
}: IconProps & { children?: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function GuideLoopLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <img
      src={withBasePath("/guideloop-logo.svg")}
      alt="GuideLoop Logo"
      className={className}
      style={{ display: "block" }}
    />
  );
}

export function LoopMark(props: IconProps) {
  return <GuideLoopLogo className={props.className || "h-6 w-auto"} />;
}

export function ArrowRight(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </IconFrame>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </IconFrame>
  );
}

export function Search(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </IconFrame>
  );
}

export function Bell(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8" />
      <path d="M10 21h4" />
    </IconFrame>
  );
}

export function Board(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 8h3M8 12h8M8 16h6" />
    </IconFrame>
  );
}

export function Timeline(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
      <path d="m8 7 8 4M16.5 13.5 10 17" />
    </IconFrame>
  );
}

export function Users(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </IconFrame>
  );
}

export function Flag(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 21V4" />
      <path d="M5 5h11l-1.8 3L16 11H5" />
    </IconFrame>
  );
}

export function Check(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconFrame>
  );
}

export function Copy(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </IconFrame>
  );
}

export function Reset(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </IconFrame>
  );
}

export function Command(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M9 6a3 3 0 1 1-3-3c1.7 0 3 1.3 3 3v12a3 3 0 1 1-3-3h12a3 3 0 1 1-3 3V6a3 3 0 1 1 3 3H6" />
    </IconFrame>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m12 3 1.9 5.7a2 2 0 0 0 1.4 1.4L21 12l-5.7 1.9a2 2 0 0 0-1.4 1.4L12 21l-1.9-5.7a2 2 0 0 0-1.4-1.4L3 12l5.7-1.9a2 2 0 0 0 1.4-1.4L12 3z" />
    </IconFrame>
  );
}

export function Layers(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m12 2 10 5-10 5L2 7l10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </IconFrame>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </IconFrame>
  );
}

export function Shield(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </IconFrame>
  );
}

/** Filled brand / utility mark (no stroke defaults). */
function BrandIcon({
  children,
  ...props
}: IconProps & { children?: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function Github(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M12 .7C5.6.7.5 5.9.5 12.3c0 5.1 3.3 9.5 7.9 11 .6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .4.2.7.8.6a11.6 11.6 0 0 0 7.9-11C23.5 5.9 18.4.7 12 .7Z" />
    </BrandIcon>
  );
}

/** Official React atom mark */
export function ReactIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="2.05" />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        <ellipse cx="12" cy="12" rx="10.5" ry="4.2" />
        <ellipse
          cx="12"
          cy="12"
          rx="10.5"
          ry="4.2"
          transform="rotate(60 12 12)"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="10.5"
          ry="4.2"
          transform="rotate(120 12 12)"
        />
      </g>
    </svg>
  );
}

/** Official Vue “V” mark */
export function VueIcon(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M24 1.5h-7.5L12 9.75 7.5 1.5H0l12 21L24 1.5z" />
    </BrandIcon>
  );
}

/** Official Svelte mark */
export function SvelteIcon(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.546-3.105 3.914 3.914 0 0 1 .129-.486l.127-.323.287.21a7.21 7.21 0 0 0 2.186 1.095l.208.063-.02.208a1.253 1.253 0 0 0 .227.822 1.337 1.337 0 0 0 1.435.533 1.23 1.23 0 0 0 .34-.162l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.164-.941 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.34.162l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.546-3.106 3.917 3.917 0 0 1 1.774-2.622l5.59-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .546 3.105 3.92 3.92 0 0 1-.13.486l-.126.323-.287-.21a7.204 7.204 0 0 0-2.187-1.095l-.208-.063.02-.207a1.255 1.255 0 0 0-.227-.823 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.34.162l-5.59 3.562a1.165 1.165 0 0 0-.524.778 1.243 1.243 0 0 0 .164.941 1.338 1.338 0 0 0 1.435.533 1.233 1.233 0 0 0 .34-.163l2.133-1.36a4.077 4.077 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .546 3.105 3.917 3.917 0 0 1-1.774 2.622l-5.59 3.563a4.072 4.072 0 0 1-1.135.499" />
    </BrandIcon>
  );
}

/** Official Angular shield mark */
export function AngularIcon(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.685.8-12.946L14.692 0ZM9.308 0 .676 3.739l.8 12.946L9.308 0Zm-.405 13.971h6.198L12 6.356 8.903 13.971Z" />
    </BrandIcon>
  );
}

/** Official JavaScript mark (Simple Icons — square with JS letter cutouts). */
export function VanillaIcon(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
    </BrandIcon>
  );
}

/** Web Components / custom elements mark */
export function WebComponentIcon(props: IconProps) {
  return (
    <IconFrame {...props} strokeWidth={1.75}>
      <path d="M8 5 3 12l5 7" />
      <path d="m16 5 5 7-5 7" />
      <path d="m14.2 4.5-4.4 15" />
    </IconFrame>
  );
}

export function CaretDown(props: IconProps) {
  return (
    <IconFrame {...props} strokeWidth={2}>
      <path d="m6 9 6 6 6-6" />
    </IconFrame>
  );
}

export function CaretUp(props: IconProps) {
  return (
    <IconFrame {...props} strokeWidth={2}>
      <path d="m18 15-6-6-6 6" />
    </IconFrame>
  );
}

/** Theme: Guide Blue — solid accent disc */
export function ThemeSlateIcon(props: IconProps) {
  return (
    <BrandIcon {...props}>
      <circle cx="12" cy="12" r="8" />
    </BrandIcon>
  );
}

/** Theme: Editorial Craft — open book */
export function ThemeEditorialIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5V5.5z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5z" />
    </IconFrame>
  );
}

/** Theme: Terminal CLI — chevron prompt */
export function ThemeTerminalIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </IconFrame>
  );
}

/** Theme: Nordic Frost — snowflake */
export function ThemeNordicIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M12 3v18M5.6 6.6l12.8 12.8M18.4 6.6 5.6 19.4" />
      <path d="m8 4.5 4 2.5 4-2.5M8 19.5l4-2.5 4 2.5" />
      <path d="m4 10 2.5 2L4 14M20 10l-2.5 2 2.5 2" />
    </IconFrame>
  );
}
