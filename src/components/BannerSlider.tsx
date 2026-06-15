'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Phone } from 'lucide-react';
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (allBanners.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [allBanners.length, isPaused, nextSlide]);

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full min-h-[350px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden">
        <div 
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {allBanners.map((banner, index) => (
            <div key={banner.id} className="w-full flex-shrink-0 h-full relative">
              {banner.id === "default-banner" ? (
                <>
                  <div className="absolute inset-0 ice-gradient opacity-95" />
                  <div className="absolute inset-0 bg-[url('/logo.png')] bg-center bg-no-repeat bg-contain opacity-5 scale-150" />
                </>
              ) : (
                <>
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </>
              )}
              
              <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto w-full">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    <div className="flex-1 text-white text-center md:text-left w-full">
                      {banner.id === "default-banner" ? (
                        <>
                          <span className="inline-block bg-white/20 text-[var(--zice-light)] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 rounded-full mb-3 sm:mb-4">
                            Fábrica Nova — Guaramirim, Santa Catarina
                          </span>
                          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4">
                            Gelo de qualidade com entrega{" "}
                            <span className="text-[var(--zice-light)]">24 horas</span>
                          </h1>
                          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-2 sm:mb-3">
                            Atacado para mercados, padarias e comércios. Varejo para você e sua família.
                          </p>
                          <p className="text-base sm:text-lg md:text-xl font-semibold italic text-[var(--zice-light)] mb-6 sm:mb-8">
                            Faltou gelo? Fique Zem.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                            <Link href="/loja" className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3">
                              <ShoppingBag size={18} />
                              Comprar agora
                            </Link>
                            <a href={`tel:+${phone}`} className="btn-outline bg-white/10 border-white text-white hover:bg-white/20 text-sm sm:text-base py-3">
                              <Phone size={18} />
                              {formatPhone(phone)}
                            </a>
                          </div>
                        </>
                      ) : (
                        <>
                          {banner.title && (
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-3 sm:mb-4">
                              {banner.title}
                            </h1>
                          )}
                          {banner.description && (
                            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-8">
                              {banner.description}
                            </p>
                          )}
                          {banner.linkUrl ? (
                            <Link href={banner.linkUrl} className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3">
                              Saiba mais
                            </Link>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                              <Link href="/loja" className="btn-primary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3">
                                <ShoppingBag size={18} />
                                Comprar agora
                              </Link>
                              <a href={`tel:+${phone}`} className="btn-outline bg-white/10 border-white text-white hover:bg-white/20 text-sm sm:text-base py-3">
                                <Phone size={18} />
                                {formatPhone(phone)}
                              </a>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Somente exibe logo no banner padrão e em telas médias+ */}
                    {banner.id === "default-banner" && (
                      <div className="flex-1 flex justify-center hidden md:block">
                        <Image
                          src="/logo.png"
                          alt="Z-ice Gelo Logo"
                          width={350}
                          height={350}
                          className="drop-shadow-2xl rounded-2xl max-w-[250px] md:max-w-[320px] lg:max-w-[400px] w-full h-auto opacity-90"
                          priority={index === 0}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {allBanners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 pb-4">
          {allBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-[var(--zice-medium)] w-6 sm:w-8'
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
