/**
 * Custom routes file — extend or override built-in engine routes.
 *
 * The `twilightReact()` plugin auto-discovers this file at build time.
 * Routes defined here are merged with the engine's defaults:
 *   - New paths are added alongside the built-in routes.
 *   - Matching paths override the built-in route for that path.
 *
 * After adding a route here, create the corresponding file in `app/routes/`.
 * Do NOT prefix your custom route file with `// @auto-generated` or the
 * engine will overwrite it on the next build.
 *
 * @example Adding routes
 * ```ts
 * import { route, index } from '@tanstack/virtual-file-routes';
 *
 * export const routes = [
 *   route('/faq', 'faq.tsx'),
 *   route('/contact', 'contact.tsx'),
 *   route('/promotions/$id', 'promotions.$id.tsx'),
 * ];
 * ```
 *
 * @example Overriding a built-in route
 * ```ts
 * import { route } from '@tanstack/virtual-file-routes';
 *
 * export const routes = [
 *   route('/cart', 'custom-cart.tsx'), // replaces the engine's cart route
 * ];
 * ```
 */
import { route } from '@tanstack/virtual-file-routes';

export const routes = [
  // Replace the engine category page with the theme's (pill toolbar + collapsible
  // filters). Implementation: `app/routes/product-list.tsx`.
  route('/$slug/c{$id}', 'product-list.tsx'),
  // Render the offers list with the theme's catalog toolbar (count · grid/list ·
  // sort), no filters, 5-up grid on desktop. Implementation: `app/routes/offers-page.tsx`.
  route('/offers', 'offers-page.tsx'),
  // The remaining product listings (latest, most sales, search, tags, brands)
  // render through the same `ProductListPage`, so every listing shows the
  // theme's product card and catalog toolbar instead of the engine default.
  route('/latest-products', 'latest-products-page.tsx'),
  route('/most-sales-products', 'most-sales-products-page.tsx'),
  route('/search', 'search-page.tsx'),
  route('/tags/$id', 'tags-page.tsx'),
  route('/$slug/tag-{$id}', 'slug-tag-page.tsx'),
  route('/brands/$id', 'brands-page.tsx'),
  // Replace the engine cart page with the theme's (column headings + flat rows).
  // Implementation: `app/routes/cart-page.tsx`.
  route('/cart', 'cart-page.tsx'),
  // Replace the engine product page with the theme's (flat data column +
  // scroll-carousel related products). Implementation: `app/routes/product-single.tsx`.
  route('/$slug/p{$id}', 'product-single.tsx'),
  route('/$slug/page-{$id}', 'page-single.tsx'),
];
