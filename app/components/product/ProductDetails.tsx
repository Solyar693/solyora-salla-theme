import { Fragment, useState } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { HookName } from '@salla.sa/twilight-theme-engine/types/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { CurrencySymbol, Link, Image } from '@salla.sa/twilight-theme-engine/common';
import { formatSallaPlural } from '@salla.sa/twilight-theme-engine/utils';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { useHydrated } from '../common/useHydrated';
import { useMobileViewport } from '../common/useMobileViewport';
import { ProductMetadata } from './ProductMetadata';
import { usePriceBump } from './usePriceBump';

interface ProductDetailsProps {
  product: Product;
  showTags?: boolean;
}

/**
 * Theme fork of the engine `ProductDetails`.
 *
 * Identical to upstream except the data-column blocks (title, SKU row,
 * availability, sold / remaining quantity) render flat: no `bg-white`, no
 * `rounded-md`, no card padding. The `.product-form` `gap` / element `mb`
 * classes control the vertical rhythm. Previously done from
 * `04-components/product.scss`; kept in sync with the engine on upgrades.
 */
export function ProductDetails({ product, showTags = true }: ProductDetailsProps) {
  const { t } = useTranslation();
  const hydrated = useHydrated();
  const isMobile = useMobileViewport();

  // Context for all product hooks - contains product data
  const productHookContext = { product };

  return (
    <>
      <HookSlot name={HookName.PRODUCT_DESCRIPTION_START} context={productHookContext} />

      {product.brand?.name && (
        <div className="product-brand mb-5 w-12">
          <Link className="brand-logo" to={product.brand.url || '#'} title={product.brand.name}>
            <Image
              className="max-h-full object-contain"
              src={product.brand.logo}
              title={product.brand.name}
              alt={product.brand.name}
              aspectRatio="1/1"
            />
          </Link>
        </div>
      )}

      <div className="mb-2.5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl leading-10 font-bold text-gray-800">{product.name}</h1>
          {product.subtitle && (
            <h2 className="product-entry__sub-title text-sm text-gray-500 leading-6 font-normal">
              {product.subtitle}
            </h2>
          )}
        </div>

        {/* share + wishlist, pulled up beside the title on the end side.
            On mobile these move to the gallery overlay bar (`ProductGallery`),
            so this copy is hidden — see `product.scss`. */}
        <div className="product-details__title-actions flex shrink-0">
          <SallaSocialShare className="inline-flex" aria-label="social share" />

          <SallaButton
            className="btn--wishlist animated hidden sm:inline-flex"
            data-id={product.id}
            onClick={() => window.salla?.wishlist.toggle(product.id)}
            shape="icon"
            fill="outline"
            color="light"
            ariaLabel="add to wishlist"
          >
            <i className="sicon-heart"></i>
          </SallaButton>
        </div>
      </div>

      {product.rating && (
        <SallaRatingStars value={product.rating.stars} reviews={product.rating.count} />
      )}

      {product.is_taxable && (
        <small className="color-grey">{t('pages.products.tax_included', 'VAT Inclusive')}</small>
      )}

      <ProductPrice product={product} />

      <ProductDescription product={product} />

      {/* Metadata / specs — mobile only. On `md`+ it renders under the gallery
          slider instead (`ProductGallery`) — same hydration-gated mounting
          there, so together the two never run two `<SallaMetadata>` instances
          at once past first paint; see the comment on that copy. */}
      {product.has_metadata && (!hydrated || isMobile) && (
        <ProductMetadata className="mb-3 md:hidden" />
      )}

      {!!product.tags?.length && showTags && (
        <div className="mb-3">
          {product.tags.map((tag, index, tags) => (
            <Fragment key={tag.name}>
              <Link
                to={tag.url}
                className="rtl:ml-2 ltr:mr-2 inline-flex text-gray-500 hover:text-primary underline text-sm mb-1"
              >
                {tag.name}
              </Link>
              {index < tags.length - 1 && ','}
            </Fragment>
          ))}
        </div>
      )}

      <ProductQuantityInfo product={product} />

      {product.sku && (
        <div className="mb-4 flex justify-between sm:grid sm:grid-cols-3">
          <div className="flex items-center">
            <i className="sicon-barcode mx-1"></i>
            {t('pages.products.sku', 'SKU')}
          </div>
          <div className="text-unicode">{product.sku}</div>
        </div>
      )}

      {product.show_availability && (
        <section className="mb-5 last:mb-0">
          <div className="center-between">
            <span className="flex items-center text-base">
              <span className="sicon-location rtl:ml-1 ltr:mr-1"></span>
              <span className="inline-block">
                {t('pages.products.availability', 'Availability')}
              </span>
            </span>
            <div className="mt-1 sm:mt-0 sm:col-span-2 text-end">
              <div className="flex rtl:space-x-reverse space-x-3">
                <a
                  href="#!"
                  onClick={() =>
                    window.salla?.event?.dispatch('scopes::open', {
                      mode: 'availability',
                      product_id: String(product.id),
                    })
                  }
                  className="group text-primary flex items-center justify-center"
                >
                  <span>{t('pages.products.select_branch', 'Select Branch')}</span>
                  <span className="sicon-keyboard_arrow_left mr-2 transition-transform group-hover:-translate-x-1"></span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <HookSlot name={HookName.PRODUCT_DESCRIPTION} context={productHookContext} />

      <SallaInstallment
        price={String(
          typeof product.base_currency_price === 'object'
            ? product.base_currency_price.amount
            : product.base_currency_price
        )}
      />

      <HookSlot name={HookName.PRODUCT_DESCRIPTION_END} context={productHookContext} />
    </>
  );
}

function ProductPrice({ product }: { product: Product }) {
  const { t } = useTranslation();
  // Replays the little pulse whenever the figures change (quantity / options).
  const bump = usePriceBump(
    product.sale_price,
    product.price,
    product.regular_price,
    product.starting_price
  );
  const bumpClass = bump ? ' price-bump' : '';

  return (
    <div className="flex whitespace-nowrap gap-4 items-center mb-2.5">
      <div
        key={`sale-${bump}`}
        className={`${product.is_on_sale ? '' : 'hidden'}${bumpClass} space-x-2 rtl:space-x-reverse whitespace-nowrap`}
      >
        <p className="price-bump__now text-red-800 font-bold text-xl inline-block">
          {product.sale_price} <CurrencySymbol currency={product.currency} />
        </p>
        <span className="text-gray-500 line-through">
          {product.regular_price} <CurrencySymbol currency={product.currency} />
        </span>
      </div>
      <div
        key={`plain-${bump}`}
        className={`gap-4${bumpClass} ${product.is_on_sale ? 'hidden' : 'flex'}`}
      >
        {product.starting_price && (
          <span>{t('pages.products.starting_price', 'Starting from')}</span>
        )}
        <p className="price-bump__now font-bold text-xl inline-block">
          {product.starting_price ?? product.price} <CurrencySymbol currency={product.currency} />
        </p>
      </div>
    </div>
  );
}

function ProductDescription({ product }: { product: Product }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product.description) return null;

  const description = product.description.replace(/&nbsp;/g, '\n');

  if (product.has_read_more) {
    return (
      <div className="product__description leading-7 mb-3">
        <article
          className="article article--main relative leading-8 overflow-hidden transition-[max-height] duration-300 py-4"
          id="more-content"
          style={{ maxHeight: isExpanded ? 'none' : '5.25rem' }}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        <button
          type="button"
          id="btn-show-more"
          className={`link--primary inline-block mt-2 cursor-pointer bg-transparent border-0 p-0 ${isExpanded ? 'is-expanded' : ''}`}
          onClick={() => setIsExpanded(true)}
        >
          {t('pages.products.read_more', 'Read more')}
        </button>
      </div>
    );
  }

  return (
    <div className="product__description leading-7 mb-3">
      <article className="article--main pb-1" dangerouslySetInnerHTML={{ __html: description }} />
    </div>
  );
}

function ProductQuantityInfo({ product }: { product: Product }) {
  const { t } = useTranslation();
  if (product.sold_quantity == null && !product.can_show_remained_quantity) {
    return null;
  }

  return (
    <div className="mb-5 inline-flex text-sm">
      {(product.sold_quantity ?? 0) > 0 && (
        <div className="px-4 only:px-0 !text-red-800">
          <i className="sicon-fire rtl:ml-1.5 ltr:mr-1.5"></i> {t('pages.products.sold', 'Sold')}{' '}
          {/* Salla ships `sold_times` in Laravel plural format; resolve it for the count. */}
          <span>{formatSallaPlural(t('pages.products.sold_times'), product.sold_quantity!)}</span>
        </div>
      )}
      {product.can_show_remained_quantity && (
        <div className="inline-flex items-center gap-2 px-4 only:px-1 font-medium text-green-700">
          {/* live "in stock" dot with pulsing waves */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40"
              style={{ animationDelay: '0.75s' }}
            />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600" />
          </span>
          {t('blocks.product.in_stock', 'In stock')} ({product.quantity})
        </div>
      )}
    </div>
  );
}
