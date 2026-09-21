import { Suspense, useEffect, useState } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { ImageModal } from '@salla.sa/twilight-theme-engine/components/modal';
import type { Product, ProductImage } from '@salla.sa/twilight-theme-engine/types';
import { ArrowRightIcon } from '../icons';
import { useHydrated } from '../common/useHydrated';
import { useMobileViewport } from '../common/useMobileViewport';
import { ProductMetadata } from './ProductMetadata';

export interface ProductGalleryProps {
  product: Product;
}

type ImagePreview = { src: string; alt: string };
type GalleryMedia = { url: string; type: 'image' | 'video' | '3d-image' };

/**
 * Theme fork of the engine `ProductGallery`.
 *
 * Differs from upstream in two ways:
 *  - the thumbnails slider runs `slidesPerView: 'auto'` (`thumbsConfig`). The
 *    theme sizes thumbs to a fixed 80px in `slider.scss`; with the engine
 *    default (`slidesPerView: 4`) Swiper lays the track out for quarter-width
 *    slides, so a product with few images left a long, mostly empty track.
 *    `'auto'` makes Swiper measure the real CSS width instead.
 *  - `<SallaMetadata>` (specs table) renders here, below the slider, instead of
 *    in the buy-box column — so the column drops its `md:sticky` when a product
 *    has metadata.
 */
export function ProductGallery({ product }: ProductGalleryProps) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const sliderId = `details-slider-${product.id}`;
  const objectFit = theme.settings.slider_background_size ?? 'cover';
  const hydrated = useHydrated();
  const isMobile = useMobileViewport();
  // `onAfterInit` fires once Swiper actually finishes laying the slider out —
  // later than `hydrated` (which only means React has mounted; the slider web
  // component upgrades and initializes on its own, separate timeline).
  const [sliderReady, setSliderReady] = useState(false);

  // Clicking an image opens an in-app lightbox instead of navigating to the CDN URL.
  const [preview, setPreview] = useState<ImagePreview | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(sliderId);
      if (!el?.parentElement) return;
      const { parentElement, nextSibling } = el;
      parentElement.removeChild(el);
      parentElement.insertBefore(el, nextSibling);
    });
    return () => cancelAnimationFrame(raf);
  }, [sliderId]);

  // The product-details API only returns `image` (singular).
  // Fall back so the main image always renders even without the full gallery array.
  const images: ProductImage[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image?.url
        ? [product.image]
        : [];

  const hasManyImages = images.length > 1;
  const nativeGallery = images.flatMap<GalleryMedia>((image) => {
    if (image.three_d_image_url) return [{ url: image.three_d_image_url, type: '3d-image' }];
    if (image.video_url) return [{ url: image.video_url, type: 'video' }];
    return image.url ? [{ url: image.url, type: 'image' }] : [];
  });
  const openNativeGallery = () => {
    if (!window.salla?.mobile?.isEnabled?.()) return false;
    window.salla.event.dispatch('mobile::gallery.open', { images: nativeGallery });
    return true;
  };

  return (
    // Sticky only when there's nothing under the slider; with `<SallaMetadata>`
    // below it the column is tall, so let it scroll with the page instead.
    // `top-24` clears the sticky header once stuck — `md:` scoped to match
    // `md:sticky`. Unscoped, `relative` (below) made `top` apply on mobile
    // too, visually shifting the whole gallery down 96px while the content
    // after it (ProductDetails' title / tags) still flowed right where the
    // gallery would have sat unshifted — the two rendered on top of each other.
    <div
      className={`sidebar relative md:top-24 w-full md:!w-2/4 rtl:ml-8 ltr:mr-8 pb-8 md:pb-16 overflow-hidden shrink-0${
        product.has_metadata ? '' : ' md:sticky'
      }`}
    >
      {/* Mobile: a floating bar over the top of the image — back on one side,
          wishlist + share on the other. Hidden until hydrated, then slides
          down into place instead of popping in wherever the page happens to
          be mid-load. Styling: `04-components/product.scss`. */}
      <div className={`product-gallery__bar md:hidden${hydrated ? ' is-visible' : ''}`}>
        <button
          type="button"
          className="product-gallery__bar-btn"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.assign('/');
          }}
          aria-label={t('blocks.header.back', 'Back')}
        >
          <ArrowRightIcon aria-hidden="true" />
        </button>
        {/* Waits for the slider itself (`sliderReady`, not just `hydrated`) so
            it doesn't slide in while the images underneath are still loading. */}
        <div className={`product-gallery__bar-actions${sliderReady ? ' is-visible' : ''}`}>
          <button
            type="button"
            className="product-gallery__bar-btn btn--wishlist"
            data-id={product.id}
            onClick={() => window.salla?.wishlist?.toggle?.(product.id)}
            aria-label={t('pages.products.add_to_wishlist', 'Add to wishlist')}
          >
            <i className="sicon-heart" aria-hidden="true" />
          </button>
          <SallaSocialShare
            className="product-gallery__bar-btn"
            aria-label={t('blocks.header.share', 'Share')}
          />
        </div>
      </div>

      <SallaSlider
        id={sliderId}
        className="details-slider rounded-md image-slider"
        type="thumbs"
        pagination
        loop={false}
        autoHeight
        listenToThumbnailsOption
        showThumbsControls={false}
        sliderConfig={{ watchOverflow: true, autoHeight: true }}
        thumbsConfig={{ slidesPerView: 'auto', spaceBetween: 8 }}
        onAfterInit={() => setSliderReady(true)}
      >
        {product.promotion_title && (
          <div className="promotion-title">{product.promotion_title}</div>
        )}

        {product.calories && (
          <div className="absolute z-[2] top-4 rtl:left-4 ltr:right-4 bg-white shadow-sm flex flex-col justify-center items-center rounded-full w-20 h-20 md:w-24 md:h-24">
            <span className="text-red-500 text-xl leading-none font-bold">{product.calories}</span>
            <span className="text-xs text-gray-500">
              {t('pages.products.calories', 'Calories')}
            </span>
          </div>
        )}

        <div slot="items">
          {images.map((image, index) => (
            <ImageSlide
              key={image.id ?? image.three_d_image_url ?? image.video_url ?? image.url}
              image={image}
              product={product}
              index={index}
              objectFit={objectFit}
              onPreview={setPreview}
              onNativeOpen={openNativeGallery}
            />
          ))}
        </div>

        {hasManyImages && (
          // `hidden md:block` on the slot itself (not just the `.s-slider-thumbs`
          // wrapper Stencil renders after hydration, `04-components/slider.scss`)
          // — before hydration this content is still plain unstyled light-DOM
          // children of `salla-slider`, so it was briefly visible on mobile
          // until Stencil moved/wrapped it and the vendor-class rule could apply.
          <div slot="thumbs" className="hidden md:block">
            {images.map((image, index) => (
              <ThumbSlide
                key={image.id ?? image.three_d_image_url ?? image.video_url ?? image.url}
                image={image}
                index={index}
              />
            ))}
          </div>
        )}
      </SallaSlider>

      {/* Product metadata / specs — on `md`+ it renders here, below the slider.
          On mobile it moves to the end of the description in `ProductDetails`.
          Both copies render until hydration completes (matches the pre-hydration
          CSS-hidden state exactly, so no SSR/first-paint mismatch) — once
          `hydrated`, only the copy the current viewport actually shows stays
          mounted, so a `has_metadata` product doesn't run two full
          `<SallaMetadata>` instances (each its own async spec fetch, its own
          MutationObserver, its own click listener) for the rest of the page's
          life on every load. */}
      {product.has_metadata && (!hydrated || !isMobile) && (
        <ProductMetadata className="mt-8 hidden md:block" />
      )}

      <Suspense fallback={null}>
        <ImageModal
          isOpen={!!preview}
          onClose={() => setPreview(null)}
          src={preview?.src ?? ''}
          alt={preview?.alt}
        />
      </Suspense>
    </div>
  );
}

function ImageSlide({
  image,
  product,
  index,
  objectFit,
  onPreview,
  onNativeOpen,
}: {
  image: ProductImage;
  product: Product;
  index: number;
  objectFit: 'cover' | 'contain';
  onPreview: (preview: ImagePreview) => void;
  onNativeOpen: () => boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const isVideo = Boolean(image.video_url);

  if (image.three_d_image_url) {
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: model-viewer is an interactive web component.
      <model-viewer
        style={{ minHeight: '500px' }}
        className="swiper-slide model-entry w-full h-full"
        loading="lazy"
        camera-controls
        touch-action="pan-y"
        auto-rotate
        poster={image.url || undefined}
        src={image.three_d_image_url}
        shadow-intensity="1"
        alt={image.alt}
        onClick={onNativeOpen}
      ></model-viewer>
    );
  }

  return (
    <a
      data-fslightbox={`product_${product.id}`}
      data-img-id={image.id}
      data-slid-index={index}
      {...(image.video_url ? { 'data-video-src': image.video_url } : {})}
      data-caption={image.alt}
      data-infinite="false"
      data-type={image.video_url ? 'youtube' : 'image'}
      href={image.video_url || image.url}
      // FsLightbox isn't loaded in this React theme, so the bare href would leave the SPA.
      // Open images in an in-app lightbox; let videos open in a new tab.
      {...(isVideo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(event) => {
        if (onNativeOpen()) {
          event.preventDefault();
          return;
        }
        if (isVideo || !image.url) return;
        event.preventDefault();
        onPreview({ src: image.url, alt: image.alt || product.name });
      }}
      aria-label={product.name}
      className={`swiper-slide magnify-wrapper homeslider__slide ${image.video_url ? 'video-entry' : ''}`}
    >
      <div className={`w-full ${loaded ? '' : 'aspect-square bg-gray-100 animate-pulse'}`}>
        <Image
          id={String(image.id)}
          src={image.url}
          alt={image.alt || product.name}
          className={`h-full w-full object-${objectFit}`}
          aspectRatio="1/1"
          priority={index === 0}
          noWrapper
          onLoad={() => setLoaded(true)}
        />
      </div>
    </a>
  );
}

function ThumbSlide({ image, index }: { image: ProductImage; index: number }) {
  return (
    <div
      className={`slide--one-fourth ${image.video_url ? 'video-entry' : ''} ${image.three_d_image_url ? 'model-entry' : ''}`}
      data-caption={image.alt}
    >
      <Image
        src={image.url}
        alt={image.alt || ''}
        className="object-cover w-full h-full bg-gray-100 rounded-md overflow-hidden"
        title={image.alt}
        priority={index < 5}
        noWrapper
      />
    </div>
  );
}
