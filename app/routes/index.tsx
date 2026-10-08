// SOLYORA custom home route — intentionally overrides engine home
import { Fragment } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { HomeComponentRenderer } from '@salla.sa/twilight-theme-engine/home';
import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@salla.sa/twilight-theme-engine/routes/home';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { HomeSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { SolyoraEditorial, SolyoraCategories } from '../components/home/SolyoraEditorial';

/**
 * Home (index) route configuration.
 * Loads page data via loader and renders the Home component.
 */
export const Route = createFileRoute('/{-$locale}/')({
  loader: ({ params }): Promise<HomeLoaderData> => Home.loader({ locale: params.locale }),
  head: withHead(Home),
  pendingComponent: () => <HomeSkeleton />,
  component: HomeComponent,
});

/**
 * Home page component.
 * Uses Route.useLoaderData() to access the data loaded by the route loader,
 * following React best practices for data fetching in route components.
 */
function HomeComponent() {
  const data: HomeLoaderData = Route.useLoaderData();
  const hero = data.components.findIndex(c => c.component_name === 'solyora-hero');
  const sources = data.components.map(c => c.product_source).filter((x): x is string => typeof x === 'string');
  // Render the engine blocks directly so app hooks surround the entire page once.
  return (
    <>
      <HookSlot name="home:start" />
      <HookSlot name="home:content" />
      {hero < 0 && <SolyoraCategories sources={sources} />}
      {data.components.map((component, index) => (
        <Fragment key={component.key ?? JSON.stringify(component)}>
          <HomeComponentRenderer data={component} index={index} />
          {index === hero && <SolyoraCategories sources={sources} />}
        </Fragment>
      ))}
      <SolyoraEditorial />
      <HookSlot name="home:end" />
    </>
  );
}
