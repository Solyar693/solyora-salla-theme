import { memo } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export interface SliderBanner {
  link?: string;
  image?: string;
  mobile_image?: string;
  video?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  btnname?: string;
  show_button?: boolean;
  direction?: string[];
  title_color?: string;
  subtitle_color?: string;
  btnname_color?: string;
  without_overlay?: boolean;
}

export interface EnhancedSliderProps {
  data: {
    slider_banner?: SliderBanner[];
    slides?: SliderBanner[];
    slider_view_height?: number;
    slider_animation_time?: number;
    slider_aniamtion_time?: number;
    slider_animation_enabled?: boolean;
    position?: number;
    in_container?: boolean;
    [key: string]: unknown;
  };
}

export const EnhancedSlider = memo(function EnhancedSlider({ data }: EnhancedSliderProps) {
  const slides = data.slider_banner || data.slides || [];
  const position = data.position ?? 1;
  const hasMultipleSlides = slides.length > 1;
  const inContainer = Boolean(data.in_container);

  if (!slides.length) return null;

  return (
    <SallaSlider
      id={`main-slider-${position}`}
      autoPlay
      sliderConfig={{ lazy: false, watchOverflow: true }}
      showControls={hasMultipleSlides}
      pagination={hasMultipleSlides}
      type="fullwidth"
      className={inContainer ? 'in-container' : undefined}
    >
      <div slot="items">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="swiper-slide w-full bg-dark relative"
            style={{ aspectRatio: '12/5' }}
          >
            <div
              style={{ backgroundImage: `url(${slide.image})` }}
              className={`${slide.without_overlay ? '' : 'overlay-bg'} bg-cover bg-center absolute inset-0`}
            />

            <div className="solyora-hero-side" aria-hidden="true">
              <img src={slide.mobile_image || slide.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
            </div>

            <div className="flex-center container pb-16 sm:pb-0 home-slider__content relative h-full">
              <div className="w-4/6 text-center md:w-7/12 lg:w-5/12 text-white">
                {slide.title && (
                  <h2
                    data-swiper-parallax="-500"
                    className="lg:text-title-size font-bold leading-tight mb-4"
                  >
                    {slide.title}
                  </h2>
                )}
                {(slide.subtitle || slide.description) && (
                  <p data-swiper-parallax="-300" className="line-clamp-2 description">
                    {slide.subtitle || slide.description}
                  </p>
                )}
                {slide.show_button && slide.btnname && (
                  <Link
                    to={slide.link || '#'}
                    data-swiper-parallax="-100"
                    className="home-slider__cta"
                  >
                    {slide.btnname}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SallaSlider>
  );
});
