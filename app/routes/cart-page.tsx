// Theme override for the cart route (`/{-$locale}/cart`), wired in via
// `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin leaves this
// file alone; the engine's own `cart.tsx` stays generated and unused.
//
// Reuses the engine loader / head / skeleton but renders the theme's `CartPage`
// (column headings + flat item rows).
import { createFileRoute } from '@tanstack/react-router';
import { Cart } from '@salla.sa/twilight-theme-engine/routes/cart';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { CartPage } from '../components/cart/CartPage';

export const Route = createFileRoute('/{-$locale}/cart')({
  loader: ({ params }): Promise<CartPageProps> => Cart.loader({ locale: params.locale }),
  head: withHead(Cart),
  pendingComponent: () => <CartSkeleton />,
  component: CartComponent,
});

function CartComponent() {
  const data: CartPageProps = Route.useLoaderData();
  return <CartPage {...data} />;
}
