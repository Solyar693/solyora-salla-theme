import { useEffect, useRef, useState, type PointerEvent, type FocusEvent, type MouseEvent } from 'react';

/** Playback is local UI state only; never writes to Salla. */
export function useSlidePlayback(count: number, advance: () => void, interact: (direction: number) => void) {
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [revision, setRevision] = useState(0);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const pointer = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update(); visibility();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (count < 2 || reduced || hidden || paused || hovered || focused || dragging) return;
    const timer = window.setInterval(() => advanceRef.current(), 4000);
    return () => window.clearInterval(timer);
  }, [count, reduced, hidden, paused, hovered, focused, dragging, revision]);
  const restart = () => setRevision(value => value + 1);
  const end = (event: PointerEvent<HTMLElement>) => {
    const start = pointer.current;
    if (!start) return;
    pointer.current = null; setDragging(false);
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (start.moved && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      interact((dx > 0 ? 1 : -1) * (rtl ? 1 : -1));
      suppressClick.current = true;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    restart();
  };
  return {
    paused, setPaused, reduced, restart,
    handlers: {
      onPointerEnter: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === 'mouse') setHovered(true); },
      onPointerLeave: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === 'mouse') setHovered(false); },
      onDragStart: (event: React.DragEvent<HTMLElement>) => event.preventDefault(),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: (event: FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setFocused(false); restart(); }
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (count < 2 || event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
        suppressClick.current = false;
        pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
        setDragging(true);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const start = pointer.current;
        if (!start) return;
        const dx = Math.abs(event.clientX - start.x), dy = Math.abs(event.clientY - start.y);
        if (dx > 10 && dx > dy * 1.2) { start.moved = true; event.currentTarget.setPointerCapture(event.pointerId); }
      },
      onPointerUp: end,
      onPointerCancel: () => { pointer.current = null; setDragging(false); restart(); },
      onClickCapture: (event: MouseEvent<HTMLElement>) => {
        if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
      },
    },
  };
}
