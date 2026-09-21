// Theme override for the product route (`/{-$locale}/$slug/p{$id}`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone. The engine's own `$slug.p$id.tsx` stays generated and unused.
//
// Reuses the engine loader / head / skeleton but renders the theme's
// `ProductPage` (flat data-column markup + scroll-carousel related products).
import { createFileRoute } from '@tanstack/react-router';
import { Product } from '@salla.sa/twilight-theme-engine/routes/product';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { ProductDetailSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductPage } from '../components/product/ProductPage';

export const Route = createFileRoute('/{-$locale}/$slug/p{$id}')({
  loader: ({ params }): Promise<ProductPageProps> => {
    // The engine's breadcrumb swaps the product's category crumb for whatever
    // page you arrived from (a stored "referrer"). Clear it so the real
    // category trail — Home › Category › Product — always shows.
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('breadcrumb-referrer');
      }
    } catch {
      /* sessionStorage unavailable (private mode) */
    }
    return Product.loader({ params: { id: params.id }, locale: params.locale });
  },
  head: withHead(Product),
  pendingComponent: () => <ProductDetailSkeleton />,
  component: ProductComponent,
});

function ProductComponent() {
  const data: ProductPageProps = Route.useLoaderData();
  // `ProductPage` isn't otherwise remounted on a product -> product SPA
  // navigation (this route's component instance is reused across param-only
  // changes), so its internal `usePageConfig` — a mount-once effect by design
  // — would only ever set `salla.config.page` for the first product visited
  // per session. Every later product then fails `salla.url.is_page`, and the
  // SDK silently skips `<salla-reviews-summary>` (plus delivery-promise /
  // loyalty / cashback). Key by product id so the whole subtree, including
  // that effect, genuinely remounts per product.
  return <ProductPage key={data.product.id} {...data} />;
}
