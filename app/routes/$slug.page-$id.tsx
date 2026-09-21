// @auto-generated
import { createFileRoute } from '@tanstack/react-router';
import { PageSingle } from '@salla.sa/twilight-theme-engine/routes/page';
import type { PageSingleProps } from '@salla.sa/twilight-theme-engine/routes/page';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';

/**
 * PageSingle route configuration.
 * Loads page data via loader and renders the PageSingle component.
 */
export const Route = createFileRoute('/{-$locale}/$slug/page-{$id}')({
  loader: ({ params }): Promise<PageSingleProps> =>
    PageSingle.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(PageSingle),
  component: PageSingleComponent,
});

/**
 * PageSingle page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function PageSingleComponent() {
  const data: PageSingleProps = Route.useLoaderData();
  return <PageSingle.Component {...data} />;
}
