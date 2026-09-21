import { useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SallaConditionalOffer } from '@salla.sa/twilight-components-react/conditional-offer';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaProductOptions } from '@salla.sa/twilight-components-react/product-options';
import { HookSlot, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Breadcrumb, NoContent } from '@salla.sa/twilight-theme-engine/common';
import { CartSummary, SeoCartWidget } from '@salla.sa/twilight-theme-engine/cart';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { loyalty } from '@salla.sa/twilight-theme-engine/api/loyalty';
import { cart } from '@salla.sa/twilight-theme-engine/api/cart';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { CartItem } from './CartItem';

/**
 * Theme fork of the engine `CartPage`.
 *
 * Same data flow as upstream, plus a column-heading row above the items
 * (Products (N) · Quantity · Total) so the flat {@link CartItem} rows read as a
 * table. Kept in sync with the engine on upgrades.
 */
function CartPageContent({ page }: CartPageProps) {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // Seed `salla.config.page` on first load. The engine only sets it from a
  // `router.subscribe('onLoad')` handler (SPA navigations), so a direct load of
  // /cart leaves `page.slug` unset, `salla.url.is_page('cart')` is false and
  // `<salla-product-options>` skips the cart-only behaviour: the item's selected
  // option (e.g. the country / digital-card pills) is never pre-checked.
  usePageConfig(page);
  const { data: loyaltyPoints } = useQuery(loyalty.queries.points());

  const [cartId, setCartId] = useState<number | null>(null);

  useEffect(() => {
    window.salla?.cart.api.getCurrentCartId().then(setCartId);
  }, []);

  const { data: cartData } = useQuery({
    ...cart.queries.detail(cartId!),
    enabled: !!cartId,
  });

  // Refetch after a row mutates its quantity / gets deleted — the SDK doesn't
  // push cart changes back into React, so item totals and the summary would
  // otherwise stay stale until a page reload.
  const refetchCart = useCallback(() => {
    if (cartId != null) {
      queryClient.invalidateQueries({ queryKey: cart.queries.detail(cartId).queryKey });
    }
  }, [cartId, queryClient]);

  // Belt-and-suspenders: also refetch on any SDK cart event that does fire.
  // Subscribe by the raw `cart::updated` event, not `salla.cart.event.onUpdated`:
  // that helper wraps the callback with no matching `off`, so every mount would
  // leak a listener (see MobileBottomBar.tsx / theme-tania's useCartData.ts).
  useEffect(() => {
    window.salla?.event?.on?.('cart::updated', refetchCart);
    return () => {
      window.salla?.event?.off?.('cart::updated', refetchCart);
    };
  }, [refetchCart]);

  const isLoading = cartId === null || !cartData;

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (cartData.items.length === 0) {
    return (
      <div className="container">
        <Breadcrumb page={page} />
        <NoContent
          icon="sicon-shopping-bag"
          message={t('pages.cart.empty_cart', 'Your cart is empty')}
          actionLabel={t('common.elements.back_home', 'Back to Home')}
          actionUrl="/"
        />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Analytics — no visible UI, fires GTM checkout events */}
      <SeoCartWidget cart={cartData} />

      <Breadcrumb page={page} />
      <h1 className="sr-only">{t('common.titles.cart', 'Cart')}</h1>
      <SallaConditionalOffer />

      <HookSlot name="cart:start" />

      <div className="pt-5 flex flex-col items-start lg:flex-row pb-6 lg:pb-20">
        <div className="main-content w-full lg:w-[calc(100%-384px)]">
          <HookSlot name="cart:items.start" context={{ cartItems: cartData.items }} />

          <div className="cart-titles hidden md:flex rtl:space-x-reverse md:space-x-12 items-center border-b border-gray-200 pb-4 text-sm font-bold text-gray-900 mb-5">
            <span className="flex-1">
              {t('blocks.cart.products', 'Products')} ({cartData.items.length})
            </span>
            <span className="flex gap-6 md:gap-8">
              <span className="w-[120px] text-center">
                {t('pages.products.quantity', 'Quantity')}
              </span>
              <span>{t('blocks.cart.item_total', 'Total')}</span>
              <span className="w-5" aria-hidden="true"></span>
            </span>
          </div>

          {cartData.items.map((item, index) => (
            <CartItem key={item.id} item={item} isFirst={index === 0} onMutated={refetchCart} />
          ))}

          {cartData.options?.length > 0 && (
            <div className="cart-options">
              {cartData.options.map((option) => (
                <form
                  key={option.id}
                  className="first:pt-5 relative"
                  onChange={(e) => window.salla?.form.onChange('cart.updateItem', e)}
                  id={`item-${option.id}`}
                >
                  <input type="hidden" name="id" value={option.id} />
                  <input type="hidden" name="quantity" value={option.quantity} />
                  {option.options && option.options.length > 0 && (
                    <SallaProductOptions
                      options={JSON.stringify(option.options)}
                      productId={option.id}
                    />
                  )}
                </form>
              ))}
            </div>
          )}

          <SallaOffer />
          <HookSlot name="cart:items.end" />
        </div>

        <CartSummary
          cart={cartData}
          applyCouponEnabled={store.settings?.cart?.apply_coupon_enabled}
          taxAmount={cartData.tax_amount}
          key={cartData.id}
          loyalty={cartData.loyalty}
          gift={cartData.gift}
          loyaltyPoints={loyaltyPoints ?? undefined}
        />
      </div>

      <HookSlot name="cart:end" />
    </div>
  );
}

export function CartPage(props: CartPageProps) {
  return <CartPageContent {...props} />;
}
