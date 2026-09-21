import { ImageCarousel } from '../common/ImageCarousel';
import { useQuery } from '@tanstack/react-query';
import { DefaultHomeComponents } from '@salla.sa/twilight-theme-engine/routes/home';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ProductsListSkeleton } from '@salla.sa/twilight-components-react';
import { ProductCard } from '../product/ProductCard';
import { storeLink } from '../common/storeLink';
import { SolyoraHero } from './SolyoraHero';

type Fields = Record<string, any>;
const list = (value: unknown): Fields[] => Array.isArray(value) ? value.filter(item => item && !item.__hidden) : [];
export function categorySource(value: unknown) { return typeof value === 'string' ? value.match(/\/c(\d+)(?:[/?#]|$)/)?.[1] : undefined; }
function BundleProducts({ data }: { data: Fields }) {
 const id = categorySource(data.product_source);
 const { data: result, isPending, isError, refetch } = useQuery({ ...product.queries.list({ source: 'categories', sourceValue: id ? [Number(id)] : [], perPage: Number(data.limit) || 8 }), enabled: !!id });
 return <section className="solyora-section solyora-products"><div className="solyora-section-head"><span className="solyora-eyebrow">{data.english_title || 'CURATED FOR YOU'}</span><h2>{data.headline || data.arabic_title || 'مختارات SOLYORA'}</h2>{(data.subtitle || data.description) && <p>{data.subtitle || data.description}</p>}</div>
 {!id ? <p className="solyora-empty">لا توجد مجموعة محددة للعرض.</p> : isError ? <div className="solyora-empty" role="alert">تعذر تحميل المنتجات. <button onClick={() => refetch()}>إعادة المحاولة</button></div> : isPending ? <ProductsListSkeleton /> : result?.items.length ? <div className="solyora-product-grid">{result.items.map(p => <ProductCard key={p.id} product={p} />)}</div> : <p className="solyora-empty" role="status">لا توجد منتجات في هذه المجموعة حاليًا.</p>}
 </section>;
}
export function SolyoraBundle({ data, priority }: { data: Fields; priority?: boolean }) {
 const { store } = useTwilight(); const { locale } = useTranslation();
 const href = (value: string) => storeLink(value, store?.url, locale);
 switch(data.component_name) {
 case 'luxury-whatsapp': { const Original = DefaultHomeComponents['bundle-component']; return data.phone && Original ? <Original data={data} priority={priority} /> : null; }
 case 'announcement-marquee': return null; // One announcement lives above the header.
 case 'solyora-hero': return <SolyoraHero data={data} />;
 case 'featured-products': case 'luxury-products-grid': return <BundleProducts data={data} />;
 case 'luxury-intro': return <section className="solyora-section solyora-intro"><span className="solyora-eyebrow">{data.subtitle_en}</span><h2>{data.title_line_1} <em>{data.title_line_2}</em></h2><p>{data.description}</p><small>{data.footer_en}</small></section>;
 case 'luxury-editorial-grid': return <section className="solyora-section solyora-edit"><div className="solyora-edit-head"><div><small>{data.top_right_en_title}</small><h2>{data.top_right_ar_title_black}<br/><em>{data.top_right_ar_title_gold}</em></h2><p>{data.top_right_desc}</p></div><span>{data.top_left_en_title}</span></div><ImageCarousel className="solyora-moments" label="THE SOLYORA EDIT">{list(data.items).filter(x => x.image).map((item,i) => { const card = <figure><img src={item.image} alt={item.title_ar || ''} loading="lazy"/><figcaption><small>{item.label_en}</small><h3>{item.title_ar}</h3><p>{item.desc_ar}</p></figcaption></figure>; return href(item.link) ? <Link to={href(item.link)} key={i}>{card}</Link> : <div key={i}>{card}</div>; })}</ImageCarousel></section>;
 case 'luxury-experience': return <section className="solyora-section solyora-experience"><div className="solyora-section-head"><span className="solyora-eyebrow">{data.title_en}</span><h2>{data.title_ar_1}<br/><em>{data.title_ar_2}</em></h2><p>{data.description}</p></div><div className="solyora-experience-grid">{list(data.features).filter(x => x.title).map((f,i) => <article key={i}><b>{f.number}</b><h3>{f.title}</h3><p>{f.desc}</p></article>)}</div></section>;
 case 'luxury-essence': return <section className="solyora-essence"><div className="solyora-essence-copy"><small>{data.title_en || 'THE SOLYORA ESSENCE'}</small><h2>{data.title_ar_1 || data.title || 'SOLYORA'} {data.title_ar_2 && <em>{data.title_ar_2}</em>}</h2>{data.description ? <p>{data.description}</p> : store?.description && <div className="solyora-store-description" dangerouslySetInnerHTML={{__html:store.description}} />}</div><div className="solyora-essence-list">{list(data.features).filter(x => x.title || x.description).map((f,i) => <article key={i}><b>{f.number}</b><div><h3>{f.title}</h3><p>{f.description}</p></div></article>)}<span className="solyora-essence-seal" aria-hidden="true">S</span></div></section>;
 case 'occasions-grid': { const items = list(data.items).filter(x => x.title && x.image); return items.length ? <section className="solyora-section"><div className="solyora-section-head"><h2>{data.title}</h2></div><ImageCarousel className="solyora-category-grid" label={data.title}>{items.map((x,i) => <figure key={i}><img src={x.image} alt={x.title} loading="lazy"/><figcaption>{href(x.link) ? <Link to={href(x.link)}>{x.title}</Link> : x.title}</figcaption></figure>)}</ImageCarousel></section> : null; }
 default: { const Original = DefaultHomeComponents['bundle-component']; return Original ? <Original data={data} priority={priority} /> : null; }
 }
}
