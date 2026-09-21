import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

type Settings = Record<string, unknown>;
const str = (s: Settings, key: string, fallback = '') => String(s[key] ?? fallback);

export function SolyoraEditorial() {
  const { theme } = useTwilight();
  const s = (theme?.settings || {}) as Settings;
  const categories = [1,2,3].map((n) => ({
    title: str(s, `solyora_category_${n}_title`, ['اكسسوارات','شنط','روائع المعصم'][n-1]),
    description: str(s, `solyora_category_${n}_description`, 'اختيارات منتقاة بعناية لتكمل حضورك.'),
    image: str(s, `solyora_category_${n}_image`),
    link: str(s, `solyora_category_${n}_link`, '/products'),
  })).filter((x) => x.title && x.image);
  const moments = [1,2,3].map((n) => ({
    label: str(s, `solyora_moment_${n}_label`, ['SCENT / 01','DETAILS / 02','GIFTING / 03'][n-1]),
    image: str(s, `solyora_moment_${n}_image`),
    link: str(s, `solyora_moment_${n}_link`, '/products'),
  })).filter((x) => x.image);

  return (
    <div className="solyora-editorial" dir="rtl">
      {categories.length > 0 && <section className="solyora-categories solyora-section">
        <div className="solyora-section-head">
          <span className="solyora-eyebrow"><i />TIMELESS BEAUTY<i /></span>
          <h2>{str(s,'solyora_categories_heading','تسوقي حسب القطعة')}</h2>
          <p>{str(s,'solyora_categories_description','اختاري عالمك المفضل واكتشفي قطعًا مختارة بعناية لتكمل حضورك.')}</p>
        </div>
        <div className="solyora-category-grid">
          {categories.map((c) => <Link to={c.link} className="solyora-category-card" key={c.title}>
            <div className="solyora-category-media" style={{backgroundImage:`url(${c.image})`}} />
            <div className="solyora-card-copy"><small>SOLYORA</small><h3>{c.title}</h3><p>{c.description}</p><span>اكتشفي</span></div>
          </Link>)}
        </div>
      </section>}

      <section className="solyora-curated solyora-section">
        <div className="solyora-curated-head"><div><small>THE SOLYORA EDIT</small><h2>مختارات <em>solyora</em></h2><p>المنتجات المعروضة في أقسام المنتجات أعلاه مرتبطة مباشرة بكتالوج سلة وأسعاره ومخزونه.</p></div><span>CURATED FOR YOU</span></div>
      </section>

      <section className="solyora-essence">
        <div className="solyora-essence-copy"><small>THE SOLYORA ESSENCE</small><h2>{str(s,'solyora_essence_title','أناقة هادئة، تبقى في الذاكرة.')}</h2><p>{str(s,'solyora_essence_description','في SOLYORA نختار التفاصيل بعناية، ونقدمها بأسلوب يجمع بين الفخامة والهدوء.')}</p></div>
        <div className="solyora-essence-list">
          {[1,2,3].map((n)=><article key={n}><b>0{n}</b><div><h3>{str(s,`solyora_value_${n}_title`,['اختيار بعناية','تفاصيل فاخرة','تجربة تشبهك'][n-1])}</h3><p>{str(s,`solyora_value_${n}_description`,['قطع منتقاة تحافظ على حضورها وأناقتها.','تقديم بصري وخامات بتفاصيل راقية.','تجربة تسوق مصممة لتكون واضحة وسلسة.'][n-1])}</p></div></article>)}
        </div>
      </section>

      <section className="solyora-experience solyora-section">
        <div className="solyora-section-head"><span className="solyora-eyebrow"><i />THE SOLYORA EXPERIENCE<i /></span><h2>تفاصيل صغيرة،<br/><em>تجربة أكبر.</em></h2><p>لأن الفخامة ليست في كثرة التفاصيل، بل في اختيار التفاصيل الصحيحة.</p></div>
        <div className="solyora-experience-grid">
          {[['01','تغليف أنيق','كل طلب يصل بتقديم يليق بتجربتك.'],['02','شحن موثوق','توصيل مرتب وواضح من لحظة الطلب حتى الاستلام.'],['03','دعم قريب','نحن هنا للإجابة عن أسئلتك ومساعدتك في الاختيار.'],['04','اختيارات مدروسة','منتجات منتقاة بعناية لتبقى قريبة من ذوقك.']].map(([n,t,d])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}
        </div>
      </section>

      {moments.length > 0 && <section className="solyora-edit solyora-section">
        <div className="solyora-edit-head"><div><small>THE SOLYORA EDIT</small><h2>تفاصيل تستحق<br/>التوقف عندها.</h2><p>{str(s,'solyora_moments_description','اختيارات مصورة بعناية بنفس لغة SOLYORA الهادئة والفاخرة.')}</p></div><span>CURATED MOMENTS</span></div>
        <div className="solyora-moments">{moments.map((m)=><Link to={m.link} key={m.label}><figure><img src={m.image} alt={m.label} loading="lazy"/><figcaption>{m.label}</figcaption></figure></Link>)}</div>
      </section>}

      <section className="solyora-signature"><div className="solyora-monogram">S</div><div className="solyora-wordmark">solyora</div><div className="solyora-signature-line"/><span><i/>SIGNATURE<i/></span></section>
    </div>
  );
}
