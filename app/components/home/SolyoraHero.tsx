import { useEffect, useMemo, useRef, useState } from 'react';
import { useSlidePlayback } from '../common/useSlidePlayback';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { storeLink } from '../common/storeLink';

/** Animate only the backdrop; pause its current frame throughout the outgoing fade. */
function HeroBackground({ src, active, reduced, priority }: { src?: string; active: boolean; reduced: boolean; priority: boolean }) {
 const image = useRef<HTMLImageElement>(null);
 const animation = useRef<Animation | null>(null);
 useEffect(() => {
  if (reduced) { animation.current?.cancel(); animation.current = null; return; }
  if (!active) { animation.current?.pause(); return; }
  animation.current?.cancel();
  animation.current = image.current?.animate(
   [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
   { duration: 4000, easing: 'cubic-bezier(.25,.1,.25,1)', fill: 'both' }
  ) ?? null;
  return () => animation.current?.pause();
 }, [active, reduced, src]);
 useEffect(() => () => animation.current?.cancel(), []);
 return <img ref={image} className="solyora-hero__background" src={src} alt="" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />;
}

export interface HeroSlide { bg_image?: string; secondary_image?: string; title_line_1?: string; title_line_2?: string; description?: string; btn1_text?: string; btn1_link?: string; btn2_text?: string; btn2_link?: string; __hidden?: boolean }
export function SolyoraHero({ data }: { data: { slides?: HeroSlide[]; autoplay_speed?: number } }) {
 const slides = useMemo(() => (data.slides || []).filter(s => !s.__hidden && s.bg_image), [data.slides]);
 const [active, setActive] = useState(0);
 const { store } = useTwilight(); const { locale } = useTranslation();
 const move = (direction: number) => setActive(n => (n + direction + slides.length) % slides.length);
 const playback = useSlidePlayback(slides.length, () => move(1), move);
 const { paused, setPaused } = playback;
 if (!slides.length) return <div className="solyora-empty" role="status">لا توجد صور لعرضها حاليًا.</div>;
 const current = active % slides.length;
 return <section className="solyora-hero" aria-roledescription="عرض شرائح" aria-label="مختارات SOLYORA" dir="rtl" {...playback.handlers}>
 {slides.map((slide, i) => <article key={i} className={'solyora-hero__slide' + (i === current ? ' is-active' : '')} aria-hidden={i !== current} inert={i !== current}>
 <HeroBackground src={slide.bg_image} active={i === current} reduced={playback.reduced} priority={i === 0} />
 <div className="solyora-hero__shade" />
 <div className="solyora-hero__inner">
 <div className="solyora-hero__copy" dir="rtl"><span className="solyora-eyebrow">TIMELESS BEAUTY</span><h1>{slide.title_line_1}<em>{slide.title_line_2}</em></h1>{slide.description && <p>{slide.description}</p>}
 <div className="solyora-hero__ctas">{([1,2] as const).map(n => { const link = storeLink(slide[n === 1 ? 'btn1_link' : 'btn2_link'], store?.url, locale); const text = slide[n === 1 ? 'btn1_text' : 'btn2_text']; return link && text ? <Link className={'solyora-cta' + (n === 2 ? ' solyora-cta--outline' : '')} to={link} key={n}>{text}<span aria-hidden="true">↗</span></Link> : null; })}</div></div>
 {slide.secondary_image && <figure className="solyora-hero__portrait"><img src={slide.secondary_image} alt={slide.title_line_1 || ''} loading={i === 0 ? 'eager' : 'lazy'} /><figcaption>SOLYORA — TIMELESS BEAUTY</figcaption></figure>}
 </div></article>)}
 {slides.length > 1 && <div className="solyora-hero__controls" dir="ltr"><button aria-label="الشريحة السابقة" onClick={() => { move(-1); playback.restart(); }}>←</button><div className="solyora-hero__dots">{slides.map((_,i) => <button key={i} aria-label={'الشريحة ' + (i+1)} aria-current={i === current ? 'true' : undefined} onClick={() => { setActive(i); playback.restart(); }} />)}</div><button aria-label="الشريحة التالية" onClick={() => { move(1); playback.restart(); }}>→</button><button className="solyora-hero__pause" aria-label={paused ? 'تشغيل الحركة' : 'إيقاف الحركة'} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</button><span>{String(current+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span></div>}
 </section>;
}
