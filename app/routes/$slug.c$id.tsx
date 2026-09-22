// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { ProductListing } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';

/**
 * ProductListing route configuration.
 * Loads page data via loader and renders the ProductListing component.
 */
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
  component: ProductListingComponent,
});

/**
 * ProductListing page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function ProductListingComponent() {
  const data: ProductListLoaderData = Route.useLoaderData();
  return <ProductListing.Component {...data} />;
}
