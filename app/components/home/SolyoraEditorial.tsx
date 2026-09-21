import { ImageCarousel } from '../common/ImageCarousel';
import { useQueries } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { storeLink } from '../common/storeLink';
import { categorySource } from './SolyoraBundle';
export function SolyoraCategories({ sources }: { sources: string[] }) {
 const { store } = useTwilight(); const { locale } = useTranslation();
 const ids = [...new Set(sources.map(categorySource).filter((x): x is string => !!x))];
 const results = useQueries({ queries: ids.map(id => product.queries.list({ source:'categories', sourceValue:[Number(id)], perPage:8 })) });
 const categories = results.flatMap((result,index) => { const item = result.data?.items.find(p => p.category?.name && p.image?.url); return item?.category ? [{...item.category, id:ids[index], url:sources.find(s => categorySource(s) === ids[index]), image:item.category.image || item.image.url}] : []; });
 if (!categories.length) return null;
 return <section className="solyora-section solyora-categories"><div className="solyora-section-head"><span className="solyora-eyebrow">THE SOLYORA COLLECTION</span><h2>تسوقي حسب القطعة</h2></div><ImageCarousel className="solyora-category-grid" columns={2} label="تسوقي حسب القطعة">{categories.map(c => <Link className="solyora-category-card" key={c.id} to={storeLink(c.url,store?.url,locale)}><img className="solyora-category-media" src={c.image} alt={c.name} loading="lazy"/><div className="solyora-card-copy"><small>SOLYORA</small><h3>{c.name}</h3><span>اكتشفي المجموعة ↗</span></div></Link>)}</ImageCarousel></section>;
}
export function SolyoraEditorial() { return <section className="solyora-signature"><div className="solyora-monogram" aria-hidden="true">S</div><div className="solyora-wordmark">solyora</div><div className="solyora-signature-line"/><span>SIGNATURE — TIMELESS BEAUTY</span></section>; }
