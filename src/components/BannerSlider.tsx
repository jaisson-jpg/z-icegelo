'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Phone } from 'lucide-react';
import Link from 'next/link';
import { formatPhone } from '@/lib/utils';

type Banner = {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
};

type BannerSliderProps = {
  banners: Banner[];
  phone?: string;
};

export function BannerSlider({ banners, phone = "5547996471803" }: BannerSliderProps) {
  // Cria o banner padrão com o conteúdo original
  const defaultBanner = {
    id: "default-banner",
    title: "Gelo de qualidade com entrega 24 horas",
    description: "Atacado para mercados, padarias e comércios. Varejo para você e sua família.",
    imageUrl: "/logo.png",
    linkUrl: null,
  };

  // Combina o banner padrão com os banners do banco de dados
  const allBanners = [defaultBanner, ...banners];
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % allBanners.length);
  }, [allBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + allBanners.length) % allBanners.length);
  }, [allBanners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (allBanners.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [allBanners.length, isPaused, nextSlide]);

  const currentBanner = allBanners[currentSlide];
  const isDefaultBanner = currentBanner.id === "default-banner";

  const SlideContent = () => (
    <div className="relative w-full overflow-hidden">
      {isDefaultBanner ? (
        <>
          <div className="absolute inset-0 ice-gradient opacity-95" />
          <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-5 scale-150" />
        </>
      ) : (
        <>
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title || 'Banner'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-white text-center md:text-left">
          {isDefaultBanner ? (
            <>
              <span className="inline-block bg-white/20 text-[var(--zice-light)] text-sm font-semibold px-4 py-1 rounded-full mb-4">
                Fábrica Nova — Guaramirim, Santa Catarina
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Gelo de qualidade com entrega{" "}
                <span className="text-[var(--zice-light)]">24 horas</span>
              </h1>
              <p className="text-lg text-white/90 mb-2">
                Atacado para mercados, padarias e comércios. Varejo para você e sua família.
              </p>
              <p className="text-xl font-semibold italic text-[var(--zice-light)] mb-8">
                Faltou gelo? Fique Zem.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/loja" className="btn-primary text-lg px-8">
                  <ShoppingBag size={20} />
                  Comprar agora
                </Link>
                <a href={`tel:+${phone}`} className="btn-outline bg-white/10 border-white text-white hover:bg-white/20">
                  <Phone size={20} />
                  {formatPhone(phone)}
                </a>
              </div>
            </>
          ) : (
            <>
              {currentBanner.title && (
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                  {currentBanner.title}
                </h1>
              )}
              {currentBanner.description && (
                <p className="text-lg text-white/90 mb-8">
                  {currentBanner.description}
                </p>
              )}
              {currentBanner.linkUrl ? (
                <Link href={currentBanner.linkUrl} className="btn-primary text-lg px-8">
                  Saiba mais
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link href="/loja" className="btn-primary text-lg px-8">
                    <ShoppingBag size={20} />
                    Comprar agora
                  </Link>
                  <a href={`tel:+${phone}`} className="btn-outline bg-white/10 border-white text-white hover:bg-white/20">
                    <Phone size={20} />
                    {formatPhone(phone)}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex-1 flex justify-center hidden md:block">
          <Image
            src={isDefaultBanner ? "/logo.png" : currentBanner.imageUrl}
            alt="Z-ice Gelo Logo"
            width={400}
            height={400}
            className="drop-shadow-2xl rounded-2xl max-w-[320px] md:max-w-[400px] w-full h-auto opacity-90"
            priority
          />
        </div>
      </div>
      
      {allBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 text-[var(--zice-dark)]" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 text-[var(--zice-dark)]" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <SlideContent />
      
      {allBanners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-4">
          {allBanners.map((_, index) => (
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
      )}
    </section>
  );
}
