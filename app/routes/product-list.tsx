// Theme override for the category route (`/{-$locale}/$slug/c{$id}`), wired in
// via `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves
// this file alone; the engine's own `$slug.c$id.tsx` stays generated and unused.
//
// Reuses the engine loader / head but renders the theme's `ProductListPage`
// (pill toolbar: count · grid/list · sort, + collapsible filter column).
import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProductListPage } from '../components/product/ProductListPage';
import { ProductListSkeleton } from '../components/product/ProductListSkeleton';

export const Route = createFileRoute('/{-$locale}/$slug/c{$id}')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    const sort = (search.sort as string) || undefined;
    return { ...(page > 1 ? { page } : {}), ...(sort ? { sort } : {}) };
  },
  loaderDeps: ({ search }) => ({ page: search.page, sort: search.sort }),
  loader: ({ deps, params }): Promise<ProductListLoaderData> =>
    ProductListing.loader({
      params: { id: params.id },
      search: { page: deps.page, sort: deps.sort },
      locale: params.locale,
    }),
  head: withHead(ProductListing),
  // Without this, a sort/page/filter change re-runs the loader and TanStack
  // Router blanks the whole page until it resolves — taking the toolbar with
  // it. Keep the toolbar's shape visible instead.
  pendingComponent: () => <ProductListSkeleton />,
  component: ProductListingComponent,
});

function ProductListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ProductListPage {...data} />;
}
