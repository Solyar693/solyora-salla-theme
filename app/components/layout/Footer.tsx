import { useState } from 'react';
import { SallaAppsIcons } from '@salla.sa/twilight-components-react/apps-icons';
import { SallaSocial } from '@salla.sa/twilight-components-react/social';
import { SallaMenu } from '@salla.sa/twilight-components-react/menu';
import { SallaTrustBadges } from '@salla.sa/twilight-components-react/trust-badges';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link, Image } from '@salla.sa/twilight-theme-engine/common';
import { ImageModal } from '@salla.sa/twilight-theme-engine/modal';

/** Salla's value-added-tax icon (70×70, CDN-resized). */
const TAX_ICON_URL =
  'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=70,height=70,onerror=redirect,format=auto/images/tax.png?v=2.0.5';

/**
 * The store's value-added-tax registration: the tax number, plus the certificate as
 * the tax icon that opens the certificate image full size in a modal. The engine footer renders this next
 * to the trust badges; nothing shows when the store has no tax number.
 */
function FooterTax() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const number = store?.settings?.tax?.number;
  const certificate = store?.settings?.tax?.certificate;
  if (!number) return null;

  return (
    <div
      data-testid="store-footer-tax"
      className="store-footer__tax flex items-end gap-2 rtl:space-x-reverse"
    >
      {certificate && (
        <>
          <button
            type="button"
            data-testid="store-footer-tax-certificate"
            className="store-footer__tax-cert shrink-0"
            aria-label={t('common.elements.tax_certificate', 'Tax Certificate')}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <img
              src={TAX_ICON_URL}
              alt={t('common.elements.tax_certificate', 'Tax Certificate')}
              width={40}
              height={50}
              loading="lazy"
              decoding="async"
              className="w-10 rounded-sm transition-opacity hover:opacity-80"
            />
          </button>
          <ImageModal
            isOpen={open}
            onClose={() => setOpen(false)}
            src={certificate}
            alt={t('common.elements.tax_certificate', 'Tax Certificate')}
            title={t('common.elements.tax_certificate', 'Tax Certificate')}
          />
        </>
      )}
      <div>
        <p className="store-footer__tax-label mb-1 text-sm opacity-70">
          {t('common.elements.tax_number', 'Tax Number')}
        </p>
        <b className="text-sm">{number}</b>
      </div>
    </div>
  );
}

/** Saudi Business Center (SBC) logo, CDN-versioned like the tax icon. */
const SBC_ICON_URL = 'https://cdn.salla.network/images/sbc.png?v=2.0.5';

/**
 * The store's Saudi Business Center certificate: a "Trusted by Business Platform" badge that
 * opens the certificate's page on the SBC site so visitors can verify the merchant. Nothing
 * shows when the store has no certificate.
 */
function FooterSbc() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const id = store?.settings?.certificate?.id;
  if (!id) return null;

  return (
    <a
      href={`https://eauthenticate.saudibusiness.gov.sa/certificate-details/${encodeURIComponent(id)}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="store-footer-sbc"
      className="store-footer__sbc flex items-center gap-2.5"
    >
      <img
        src={SBC_ICON_URL}
        alt={`SBC ${id}`}
        width={56}
        height={40}
        loading="lazy"
        decoding="async"
        className="h-10 w-14 rounded-sm transition-opacity hover:opacity-80"
      />
      <div>
        <p className="text-xs opacity-70">{t('blocks.footer.sbc_trusted_by', 'Trusted by')}</p>
        <b className="text-sm">{t('blocks.footer.sbc_platform', 'Business Platform')}</b>
      </div>
    </a>
  );
}

/** Trust badges, the tax registration and the SBC badge, side by side (wrapping on narrow columns). */
function FooterTrust() {
  const { theme } = useTwilight();
  return (
    <div
      data-testid="store-footer-trust"
      className="store-footer__trust flex flex-wrap items-end gap-x-6 gap-y-3"
    >
      <FooterTax />
      <FooterSbc />
      <SallaTrustBadges {...(theme.settings?.footer_is_dark ? { dark: true } : {})} />
    </div>
  );
}

/**
 * Theme storefront footer — swapped in via `<TwilightProvider layout={ThemeLayout}>`.
 *
 * Two layouts, chosen by the `footer_layout` theme setting:
 *  - **columns** (default): logo / description / social / trust badges, the
 *    footer menu ("important links"), and app-store buttons, side by side.
 *  - **centered**: the same pieces stacked as one centered column, with the
 *    footer menu laid out as an inline, pipe-separated row.
 *
 * The engine footer's "Contact us" (`SallaContacts`) column is dropped in both.
 * Styling lives in `styles/04-components/footer.scss`. The `footer:start` /
 * `footer:end` / `copyright` hook slots are kept for installed apps.
 */
export function Footer() {
  const { store, theme } = useTwilight();
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const isCentered = theme?.settings?.footer_layout === 'centered';

  return (
    <footer
      className={`store-footer store-footer--${isCentered ? 'centered' : 'columns'}`}
      suppressHydrationWarning
    >
      <HookSlot name="footer:start" />

      <div aria-label="footer" className="store-footer__inner">
        {isCentered ? (
          <div className="container store-footer__centered">
            <Link to="/" className="store-footer__logo inline-flex items-center m-0">
              <Image src={store.logo} alt={store.name || 'Store'} width={150} height={44} />
            </Link>

            {store.description && (
              <div
                className="store-footer__desc"
                // Merchant-authored HTML, mirrors the Twig theme's `store.description|raw`.
                dangerouslySetInnerHTML={{ __html: store.description }}
              />
            )}

            <SallaSocial />

            <SallaMenu
              source="footer"
              useReactLink
              className="store-footer__menu store-footer__menu--inline"
              suppressHydrationWarning
            />

            <FooterTrust />

            <div className="store-footer__apps">
              <SallaAppsIcons
                apps={store.apps}
                appsTitle={t('blocks.footer.download_apps', 'Get our apps')}
              />
            </div>
          </div>
        ) : (
          <div className="container grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
            <div className="store-footer__brand rtl:lg:pl-16 ltr:lg:pr-16 sm:col-span-2">
              <Link to="/" className="store-footer__logo inline-flex items-center m-0 mb-5">
                <Image src={store.logo} alt={store.name || 'Store'} width={150} height={44} />
              </Link>

              {store.description && (
                <div
                  className="store-footer__desc max-w-sm leading-6 my-5"
                  // Merchant-authored HTML, mirrors the Twig theme's `store.description|raw`.
                  dangerouslySetInnerHTML={{ __html: store.description }}
                />
              )}

              <SallaSocial className="block mb-6" />

              <FooterTrust />
            </div>

            <div className="store-footer__links">
              <h3>{t('blocks.footer.important_links', 'Important links')}</h3>
              <SallaMenu
                source="footer"
                useReactLink
                className="store-footer__menu store-footer__menu--stacked"
                suppressHydrationWarning
              />
            </div>

            <div className="store-footer__apps">
              <SallaAppsIcons
                apps={store.apps}
                appsTitle={t('blocks.footer.download_apps', 'Get our apps')}
              />
            </div>
          </div>
        )}
      </div>

      <div className="store-footer__bottom container md:flex items-center justify-between gap-4 py-4 lg:py-7 text-center">
        <span className="text-sm copyright-text">
          <HookSlot
            name="copyright"
            context={{ storeName: store.name }}
            fallback={
              <>
                {t('blocks.footer.copyright', 'All rights reserved')}{' '}
                <Link to="/" className="hover:text-primary">
                  {store.name}
                </Link>{' '}
                © {year}
              </>
            }
          />
        </span>

        <SallaPayments />
      </div>

      <HookSlot name="footer:end" />
    </footer>
  );
}
