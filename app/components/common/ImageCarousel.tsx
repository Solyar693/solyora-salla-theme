import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useSlidePlayback } from './useSlidePlayback';

/** Keeps the existing image-card layout and loops real cards without a visible reset. */
export function ImageCarousel({ children, columns = 3, label, className = '' }: { children: ReactNode; columns?: number; label: string; className?: string }) {
  const items = Children.toArray(children);
  const count = items.length;
  const viewport = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(count);
  const [visibleCount, setVisibleCount] = useState(Math.min(columns, count));
  const [step, setStep] = useState(0);
  const [animate, setAnimate] = useState(false);
  const moving = useRef(false);
  const move = useCallback((direction: number) => { if (moving.current || count < 2) return; moving.current = true; setAnimate(true); setIndex(value => value + direction); }, [count]);
  const playback = useSlidePlayback(count, () => move(1), move);
  const settle = useCallback(() => {
    moving.current = false;
    setAnimate(false);
    setIndex(value => count ? count + ((value - count) % count + count) % count : 0);
  }, [count]);
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const measure = () => {
      const card = el.querySelector<HTMLElement>('.solyora-image-carousel__item');
      if (card) { const gap = parseFloat(getComputedStyle(card.parentElement!).columnGap) || 0; const width = card.getBoundingClientRect().width; setStep(width + gap); setVisibleCount(Math.round((el.clientWidth + gap) / (width + gap))); settle(); }
    };
    const observer = new ResizeObserver(measure); observer.observe(el); measure();
    return () => observer.disconnect();
  }, [settle]);
  useEffect(() => { setIndex(count); moving.current = false; }, [count]);
  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(settle, playback.reduced ? 0 : 750);
    return () => clearTimeout(timer);
  }, [index, animate, playback.reduced, settle]);
  const active = count ? ((index - count) % count + count) % count : 0;
  if (!count) return null;
  if (count === 1) return <div className={className}>{items}</div>;
  return <div className={'solyora-image-carousel ' + className} role="region" aria-label={label} aria-roledescription="عرض شرائح" dir="rtl" {...playback.handlers} style={{ '--rail-columns': Math.min(columns, count) } as CSSProperties}>
    <div className="solyora-image-carousel__viewport" ref={viewport}>
      <div className="solyora-image-carousel__track" style={{ transform: 'translateX(' + (index * step) + 'px)', transition: animate && !playback.reduced ? 'transform 650ms cubic-bezier(.22,.61,.36,1)' : 'none' }} onTransitionEnd={event => { if (event.target === event.currentTarget) settle(); }}>
        {[0,1,2].flatMap(copy => items.map((item,i) => <div key={copy + '-' + i} className="solyora-image-carousel__item" aria-hidden={copy * count + i < index || copy * count + i >= index + visibleCount ? true : undefined} inert={copy * count + i < index || copy * count + i >= index + visibleCount}>{item}</div>))}
      </div>
    </div>
    <div className="solyora-image-carousel__controls">
      <button type="button" aria-label="الصورة السابقة" onClick={() => { move(-1); playback.restart(); }}>→</button>
      <div className="solyora-image-carousel__dots">{items.map((_,i) => <button type="button" key={i} aria-label={'الصورة ' + (i+1)} aria-current={i === active ? 'true' : undefined} onClick={() => { if (!moving.current) { moving.current = true; setAnimate(true); setIndex(count+i); } playback.restart(); }} />)}</div>
      <button type="button" aria-label="الصورة التالية" onClick={() => { move(1); playback.restart(); }}>←</button>
      {!playback.reduced && <button type="button" aria-label={playback.paused ? 'تشغيل الصور' : 'إيقاف الصور'} onClick={() => playback.setPaused(!playback.paused)}>{playback.paused ? '▷' : 'Ⅱ'}</button>}
    </div>
  </div>;
}
