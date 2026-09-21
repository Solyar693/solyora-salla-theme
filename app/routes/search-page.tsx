// Theme override for the search route (`/{-$locale}/search`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone; the engine's own `search.tsx` stays generated and unused.
//
// Reuses the engine loader / head but renders the theme's `ProductListPage`,
// so every product listing shows the same product card and catalog toolbar as
// the category and offers pages.
import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductListPage } from '../components/product/ProductListPage';
import { ProductListSkeleton } from '../components/product/ProductListSkeleton';

export const Route = createFileRoute('/{-$locale}/search')({
  validateSearch: (search: Record<string, unknown>) => ({ q: (search.q as string) || '' }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { source: 'search' },
      search: { q: deps.q },
      locale: params.locale,
    }),
  head: withHead(ProductListing),
  // Without this, a sort/page change re-runs the loader and TanStack Router
  // blanks the whole page until it resolves — taking the toolbar with it.
  pendingComponent: () => <ProductListSkeleton />,
  component: ListComponent,
});

function ListComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ProductListPage {...data} />;
}
