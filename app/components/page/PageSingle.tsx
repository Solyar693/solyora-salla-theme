import { useMemo } from 'react';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import type { StaticPage } from '@salla.sa/twilight-theme-engine/routes/page';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { BlockHookSlot } from '../common/BlockHookSlot';

/** Engine `StaticPage` plus the `type` our forked loader threads through. */
export type PageWithType = StaticPage & { type?: string };

export interface PageSingleProps {
  page: PageWithType;
}

/**
 * Theme fork of the engine `PageSingle` (wired in from `app/routes/page-single.tsx`).
 *
 * Adds the classic-storefront `information_page.information_page` app hook: on a
 * `customised` page the whole body IS the app-injected block, so we render only
 * the hook — exactly like `page-single.twig`. Every other page type keeps the
 * engine's breadcrumb + article + comments layout.
 */
export function PageSingle({ page }: PageSingleProps) {
  const { commentsKey } = useComments();

  // Matches the engine: strip `&nbsp;` from the merchant-authored HTML.
  const cleanContent = useMemo(
    () => (page.content ? page.content.replace(/&nbsp;/g, ' ') : ''),
    [page.content]
  );

  if (page.type === 'customised') {
    return (
      <BlockHookSlot
        name="information_page.information_page"
        wrapper="s-information-page"
        className="!mt-0"
      />
    );
  }

  return (
    <div key={page.slug} className="container">
      <Breadcrumb page={page} />

      <div className="flex justify-center">
        <div className="content content--single-page w-full lg:w-10/12 bg-white rounded p-6 lg:p-8 mt-4 lg:mt-12">
          <h1 className="font-bold text-2xl mb-6">{page.title}</h1>
          {cleanContent && (
            <div className="content-entry" dangerouslySetInnerHTML={{ __html: cleanContent }} />
          )}
          {page.id != null && (
            <SallaComments key={commentsKey} itemId={Number(page.id)} type={'page' as never} />
          )}
        </div>
      </div>
    </div>
  );
}
