import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { CloseIcon } from '../icons';
import { useDialogFocus } from './useDialogFocus';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional header row: a title and a close button. Omit for a bare sheet. */
  title?: string;
  /** Extra class on the sheet element. */
  className?: string;
  children: ReactNode;
}

/** Matches the transition duration in `04-components/bottom-sheet.scss`. */
const TRANSITION_MS = 300;

/** Run `cb` two frames from now — long enough for the closed state to paint first. */
function afterNextPaint(cb: () => void) {
  let raf2 = 0;
  const raf1 = requestAnimationFrame(() => {
    raf2 = requestAnimationFrame(cb);
  });
  return () => {
    cancelAnimationFrame(raf1);
    cancelAnimationFrame(raf2);
  };
}

/**
 * A panel that slides up from the bottom of the screen behind a backdrop — the
 * mobile pattern for filters, sort, and similar. Portalled to `<body>`.
 *
 * Enter animation is theme-owned: `mounted` keeps it in the tree through the
 * exit, and the open class is flipped only after a forced reflow so the closed
 * transform always has a starting frame (mirrors the header nav drawer).
 * Styling: `04-components/bottom-sheet.scss`.
 */
export function BottomSheet({ open, onClose, title, className, children }: BottomSheetProps) {
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.classList.add('menu-opened');
      return;
    }
    setEntered(false);
    document.body.classList.remove('menu-opened');
    const unmount = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(unmount);
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    void sheetRef.current?.offsetWidth;
    return afterNextPaint(() => setEntered(true));
  }, [mounted, open]);

  // Move focus into the sheet on open, trap Tab, restore it to the trigger on close.
  useDialogFocus(sheetRef, mounted && entered);

  // `onClose` is only read inside the listener, not a reactive value — wrap it
  // so a new closure from the parent doesn't tear down and re-add the listener.
  const onCloseEvent = useEffectEvent(onClose);
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseEvent();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted]);

  // Drop the scroll lock if we unmount while still open.
  useEffect(() => () => document.body.classList.remove('menu-opened'), []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`bottom-sheet-root${entered ? ' is-open' : ''}`}
      // useDialogFocus traps Tab and Escape closes the sheet, which is what the
      // rule asks <dialog> for: see .react-doctor/false-positives.md.
      // react-doctor-disable-next-line react-doctor/prefer-html-dialog
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bottom-sheet__backdrop" role="presentation" onClick={onClose} />

      <div
        ref={sheetRef}
        tabIndex={-1}
        className={`bottom-sheet${className ? ` ${className}` : ''}`}
      >
        <span className="bottom-sheet__handle" aria-hidden="true" />

        {title != null && (
          <div className="bottom-sheet__head">
            <h3 className="bottom-sheet__title">{title}</h3>
            <button
              type="button"
              className="bottom-sheet__close"
              aria-label={t('blocks.header.close', 'Close')}
              onClick={onClose}
            >
              <CloseIcon aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="bottom-sheet__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
