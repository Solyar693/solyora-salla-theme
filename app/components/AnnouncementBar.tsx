import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

export function AnnouncementBar() {
  const { theme } = useTwilight();
  const settings = theme?.settings as Record<string, unknown> | undefined;
  const text = String(settings?.solyora_announcement_text || 'توصيل مجاني لكل طلب فوق 399 ريال • TIMELESS BEAUTY • مختارات فاخرة • SOLYORA');
  const parts = text.split('•').map((part) => part.trim()).filter(Boolean);
  return (
    <div className="solyora-announcement" role="region" aria-label="إعلانات SOLYORA">
      <div className="solyora-announcement__track" aria-hidden="true">
        {[0, 1].flatMap((copy) => parts.map((part, index) => (
          <span key={`${copy}-${index}`} className="solyora-announcement__item">{part}<i>•</i></span>
        )))}
      </div>
    </div>
  );
}
