'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Banner = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused, nextSlide]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];

  const SlideContent = () => (
    <div className="relative w-full aspect-[16/5] sm:aspect-[21/9] overflow-hidden rounded-2xl">
      <Image
        src={currentBanner.imageUrl}
        alt={currentBanner.title || 'Banner'}
        fill
        className="object-cover"
        priority
      />
      {(currentBanner.title || currentBanner.description) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            {currentBanner.title && (
              <h2 className="text-2xl sm:text-4xl font-bold mb-2">{currentBanner.title}</h2>
            )}
            {currentBanner.description && (
              <p className="text-sm sm:text-lg opacity-90">{currentBanner.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section 
      className="max-w-6xl mx-auto px-4 py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {currentBanner.linkUrl ? (
        <Link href={currentBanner.linkUrl} className="block">
          <SlideContent />
        </Link>
      ) : (
        <SlideContent />
      )}
      
      {banners.length > 1 && (
        <>
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-[var(--zice-medium)] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--zice-dark)]" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 text-[var(--zice-dark)]" />
          </button>
        </>
      )}
    </section>
  );
}
