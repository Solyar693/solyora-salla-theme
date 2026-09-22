// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { Cart } from '@salla.sa/twilight-theme-engine/routes/cart';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';

/**
 * Cart route configuration.
 * Loads page data via loader and renders the Cart component.
 */
export const Route = createFileRoute('/{-$locale}/cart')({
  loader: ({ params }): Promise<CartPageProps> => Cart.loader({ locale: params.locale }),
  head: withHead(Cart),
  pendingComponent: () => <CartSkeleton />,
  component: CartComponent,
});

/**
 * Cart page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function CartComponent() {
  const data: CartPageProps = Route.useLoaderData();
  return <Cart.Component {...data} />;
}
