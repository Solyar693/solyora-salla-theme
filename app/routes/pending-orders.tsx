// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { pendingOrdersRedirectLoader } from '@salla.sa/twilight-theme-engine/routes/seo-redirects';

export const Route = createFileRoute('/{-$locale}/pending-orders')({
  loader: ({ params }) =>
    pendingOrdersRedirectLoader({
      params: { locale: params.locale },
    }),
});
