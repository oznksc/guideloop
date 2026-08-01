export function applyPadding(
  rect: DOMRect,
  padding: number
): DOMRect {
  if (padding === 0) return rect;

  return new DOMRect(
    rect.left - padding,
    rect.top - padding,
    rect.width + padding * 2,
    rect.height + padding * 2
  );
}
