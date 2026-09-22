import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';

interface BlockHookSlotProps {
  /** Exact hook name — `salla-hook` matches app targets by literal string. */
  name: string;
  /** `s-before-*` / `s-after-*` modifier for the `.s-blocks-wrapper` div. */
  wrapper: string;
  /** Extra utility classes for the wrapper (e.g. `!mt-0`). */
  className?: string;
}

/**
 * A page hook point wrapped in `<div class="s-blocks-wrapper s-before-…">`,
 * matching the classic storefront markup so merchant apps that inject blocks at
 * these points — and the CSS/JS they ship targeting those wrapper classes —
 * keep working here.
 *
 * The engine's own `product:*` (colon) hook slots stay as-is; this adds back the
 * dotted `product.single.*` / `product.index.*` names the engine dropped.
 */
export function BlockHookSlot({ name, wrapper, className }: BlockHookSlotProps) {
  return (
    <div className={`s-blocks-wrapper ${wrapper}${className ? ` ${className}` : ''}`}>
      <HookSlot name={name} />
    </div>
  );
}
