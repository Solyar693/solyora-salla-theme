import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Route } from '../../../app/routes/index';

const state = vi.hoisted(() => ({ components: [] as Record<string, unknown>[] }));
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (options: Record<string, unknown>) => ({
    ...options,
    useLoaderData: () => ({ components: state.components }),
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/routes/home', () => ({ Home: {} }));
vi.mock('@salla.sa/twilight-theme-engine/tanstack', () => ({ withHead: () => undefined }));
vi.mock('@salla.sa/twilight-theme-engine/skeleton', () => ({ HomeSkeleton: () => null }));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <span data-order={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/home', () => ({
  HomeComponentRenderer: ({ data, index }: { data: { key: string }; index: number }) => (
    <section data-order={data.key} data-index={index} />
  ),
}));
vi.mock('../../../app/components/home/SolyoraEditorial', () => ({
  SolyoraEditorial: () => <section data-order="editorial" />,
  SolyoraCategories: () => <section data-order="categories" />,
}));

describe('home route partner hooks and block order', () => {
  function order() {
    const Component = (Route as unknown as { component: () => React.ReactNode }).component;
    const { container } = render(<Component />);
    return Array.from(container.querySelectorAll('[data-order]'), node => node.getAttribute('data-order'));
  }

  it('surrounds all blocks with one set of hooks and keeps categories after the hero', () => {
    state.components = [
      { key: 'intro' }, { key: 'hero', component_name: 'solyora-hero' }, { key: 'products' },
    ];
    expect(order()).toEqual([
      'home:start', 'home:content', 'intro', 'hero', 'categories', 'products', 'editorial', 'home:end',
    ]);
  });

  it('keeps all blocks and puts categories first when no hero exists', () => {
    state.components = [{ key: 'products' }, { key: 'banner' }];
    expect(order()).toEqual([
      'home:start', 'home:content', 'categories', 'products', 'banner', 'editorial', 'home:end',
    ]);
  });

  it('keeps hooks and custom sections when the block list is empty', () => {
    state.components = [];
    expect(order()).toEqual(['home:start', 'home:content', 'categories', 'editorial', 'home:end']);
  });
});
