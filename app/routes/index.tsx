// SOLYORA custom home route — intentionally overrides engine home
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
  return (<>
    <Home.Component {...data} components={hero >= 0 ? data.components.slice(0, hero + 1) : []} />
    <SolyoraCategories sources={sources} />
    <Home.Component {...data} components={data.components.slice(hero + 1)} />
    <SolyoraEditorial />
  </>);
}
