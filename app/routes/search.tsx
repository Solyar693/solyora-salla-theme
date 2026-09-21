// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';

/**
 * Search route configuration with URL query parameter support.
 * Uses validateSearch for type-safe search params and loaderDeps to pass
 * them to the loader.
 */
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
  component: ProductListingComponent,
});

/**
 * Search page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function ProductListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ProductListing.Component {...data} />;
}
