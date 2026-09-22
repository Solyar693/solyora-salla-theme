import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomBar } from './MobileBottomBar';
import { MobilePageTitleBar } from './MobilePageTitleBar';
import { AnnouncementBar } from '../AnnouncementBar';

/**
 * Theme layout — passed to `<TwilightProvider layout={ThemeLayout}>` in
 * `app/routes/__root.tsx` to swap in the rebuilt {@link Header} and {@link Footer}.
 *
 * Mirrors the engine's `MasterLayout`: our header, our footer, and the same
 * global modals (offer / login / scopes). The header and footer are theme-owned;
 * everything else stays on the engine so it tracks upstream.
 */
const SallaLoginModal = lazy(() =>
  import('@salla.sa/twilight-components-react/login-modal').then((m) => ({
    default: m.SallaLoginModal,
  }))
);
const SallaScopes = lazy(() =>
  import('@salla.sa/twilight-components-react/scopes').then((m) => ({
    default: m.SallaScopes,
  }))
);
const SallaOfferModal = lazy(() =>
  import('@salla.sa/twilight-components-react/offer-modal').then((m) => ({
    default: m.SallaOfferModal,
  }))
);
const SallaLocalizationModal = lazy(() =>
  import('@salla.sa/twilight-components-react/localization-modal').then((m) => ({
    default: m.SallaLocalizationModal,
  }))
);

export interface ThemeLayoutProps {
  children: ReactNode;
}

const IMG_RATIOS = ['square', 'landscape', 'portrait'] as const;
type ImgRatio = (typeof IMG_RATIOS)[number];

/** Read the `product_card_img_ratio` dropdown setting (string, or `[{value}]`). */
function productImageRatio(raw: unknown): ImgRatio {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const value =
    typeof first === 'string' ? first : (first as { value?: string } | undefined)?.value;
  return (IMG_RATIOS as readonly string[]).includes(value ?? '') ? (value as ImgRatio) : 'square';
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { store, theme, currency } = useTwilight();
  const { locale } = useTranslation();
  const { isLoggedIn } = useUser();
  // Owned here so the header's nav drawer and the mobile bottom bar's Categories
  // tab drive the same slide-in panel.
  const [navOpen, setNavOpen] = useState(false);

  // Close the nav drawer on any route change — a bottom-bar tab (Home, Cart)
  // navigates without touching `navOpen`, so the sheet would otherwise stay
  // open over the new page.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  const imgRatio = productImageRatio(theme?.settings?.product_card_img_ratio);
  const showLocalization =
    !!store?.settings?.is_multilingual || !!store?.settings?.currencies_enabled;

  return (
    <>
      <div
        className={`app-inner flex flex-col min-h-full product-card-img--${imgRatio}`}
        suppressHydrationWarning
      >
        <AnnouncementBar />
        <Header navOpen={navOpen} onNavOpenChange={setNavOpen} />
        <MobilePageTitleBar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileBottomBar
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
          onCloseNav={() => setNavOpen(false)}
        />
      </div>

      <Suspense>
        <SallaOfferModal />
      </Suspense>

      {/* Language / currency switcher — the header nav's sticky footer buttons
          dispatch `localization::open`; mount the modal here since our Header
          replaces the engine one that normally hosts it. */}
      {showLocalization && (
        <Suspense>
          <SallaLocalizationModal
            language={locale}
            currency={currency?.code || 'SAR'}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {!isLoggedIn && (
        <Suspense>
          <SallaLoginModal
            isEmailAllowed={store?.settings?.auth?.email_allowed}
            isMobileAllowed={store?.settings?.auth?.mobile_allowed}
            isEmailRequired={store?.settings?.auth?.is_email_required}
            suppressHydrationWarning
          />
        </Suspense>
      )}

      {store?.scope && (
        <Suspense>
          <SallaScopes
            selection={store?.scope?.display_as === 'popup' ? 'mandatory' : 'optional'}
            suppressHydrationWarning
          />
        </Suspense>
      )}
    </>
  );
}
