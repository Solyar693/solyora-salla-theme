import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ProductPage } from '../../../app/components/product/ProductPage';

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <span data-hook={name} />,
  usePageConfig: () => {},
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: {} }, store: { settings: {} } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useProduct', () => ({
  useProduct: (product: unknown) => ({ product }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useComments', () => ({
  useComments: () => ({ commentsKey: 'comments' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => null,
  RenderWhenVisible: () => null,
}));
vi.mock('../../../app/components/product/ProductGallery', () => ({ ProductGallery: () => null }));
vi.mock('../../../app/components/product/AddToCartForm', () => ({ AddToCartForm: () => null }));
vi.mock('../../../app/components/home/ProductsSlider', () => ({ ProductsSlider: () => null }));
// ProductDetails owns these three slots, with the product context. This mock
// represents that existing child contract and catches duplicates in the parent.
vi.mock('../../../app/components/product/ProductDetails', () => ({
  ProductDetails: () => <>
    <span data-hook="product:single.description.start" />
    <span data-hook="product:single.description" />
    <span data-hook="product:single.description.end" />
  </>,
}));
vi.mock('@salla.sa/twilight-components-react/quick-order', () => ({ SallaQuickOrder: () => null }));
vi.mock('@salla.sa/twilight-components-react/offer', () => ({ SallaOffer: () => null }));
vi.mock('@salla.sa/twilight-components-react/comments', () => ({ SallaComments: () => null }));

describe('product page hook composition', () => {
  it('renders description hooks once alongside the page, form and related hooks', () => {
    const { container } = render(<ProductPage product={{ id: 42 } as never} page={{} as never} />);
    for (const name of [
      'product:start', 'product:details.start', 'product:details.end',
      'product:single.description.start', 'product:single.description',
      'product:single.description.end', 'product:single.form.start',
      'product:single.form.end', 'product:related.start', 'product:related.end', 'product:end',
    ]) {
      expect(container.querySelectorAll(`[data-hook="${name}"]`), name).toHaveLength(1);
    }
  });
});
