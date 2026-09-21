// Theme override for the static-page route (`/{-$locale}/$slug/page-{$id}`),
// wired in via `app/routes.ts`. NOT `// @auto-generated` — the tanstack plugin
// leaves this file alone. The engine's own `$slug.page-$id.tsx` stays generated
// and unused.
//
// Same data + head as the engine, but the loader also threads through the page
// `type` (the engine's `pageSingleLoader` drops it) so the forked `PageSingle`
// can render the `information_page.information_page` app hook for `customised`
// pages. See `app/components/page/PageSingle.tsx`.
import { createFileRoute } from '@tanstack/react-router';
import { page as pageApi } from '@salla.sa/twilight-theme-engine/api/page';
import { PageSingle as EnginePageSingle } from '@salla.sa/twilight-theme-engine/routes/page';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { PageSingle, type PageSingleProps } from '../components/page/PageSingle';

export const Route = createFileRoute('/{-$locale}/$slug/page-{$id}')({
  loader: async ({ params }): Promise<PageSingleProps> => {
    const data = await pageApi.findOrThrow(params.id);
    return {
      page: {
        // `RouteId.PAGE_SINGLE` — not exported from the engine, so inline it.
        slug: 'page-single',
        id: data.id,
        title: data.name,
        url: data.url,
        content: data.content,
        metadata: data.metadata,
        created_at: data.created_at,
        type: data.type,
      },
    };
  },
  head: withHead(EnginePageSingle),
  component: PageSingleComponent,
});

function PageSingleComponent() {
  const data = Route.useLoaderData();
  return <PageSingle {...data} />;
}
