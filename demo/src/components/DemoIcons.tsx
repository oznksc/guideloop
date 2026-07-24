import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconFrame({
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LoopMark(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M8.2 7.1A5.8 5.8 0 0 1 18 11.3c0 3.2-2.6 5.7-5.8 5.7H8.5" />
      <path d="m6.7 14.6-2.3 2.3 2.3 2.3" />
      <path d="M15.8 16.9A5.8 5.8 0 0 1 6 12.7C6 9.5 8.6 7 11.8 7h3.7" />
      <path d="m17.3 9.4 2.3-2.3-2.3-2.3" />
    </IconFrame>
  );
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

export function Github(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .7C5.6.7.5 5.9.5 12.3c0 5.1 3.3 9.5 7.9 11 .6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .4.2.7.8.6a11.6 11.6 0 0 0 7.9-11C23.5 5.9 18.4.7 12 .7Z" />
    </svg>
  );
}
