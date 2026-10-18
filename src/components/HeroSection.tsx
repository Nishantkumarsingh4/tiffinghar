'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, ChefHat, Truck } from 'lucide-react';
import { useAuthModal } from './AuthModalProvider';

interface HeroSectionProps {
  siteInfo: {
    brandName: string;
    tagline: string;
    heroHeadline: string;
    heroHighlightWord: string;
    heroSubtext: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
}

export default function HeroSection({ siteInfo }: HeroSectionProps) {
  const { openLoginModal } = useAuthModal();
  const heroRef = useRef<HTMLDivElement>(null);

  // 3D Spatial mouse coordinates (normalized from -1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-8 pb-16 md:py-16 lg:py-20 bg-[#FAF7F2] select-none perspective-1200"
    >
      {/* 3D Spatial Ceramic Floating Sphere 1 (Top Left, Green) */}
      <div
        className="absolute top-12 -left-10 sm:-left-6 w-36 h-36 sm:w-48 sm:h-48 rounded-full spatial-sphere-green pointer-events-none z-0 hidden sm:block will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * -32}px, ${mousePos.y * -28}px, 0) scale(${1 + mousePos.x * 0.03})`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 3D Spatial Ceramic Floating Sphere 2 (Bottom Right, Green - Different Placement) */}
      <div
        className="absolute bottom-6 sm:bottom-10 -right-8 sm:-right-4 w-32 h-32 sm:w-44 sm:h-44 rounded-full spatial-sphere-green pointer-events-none z-0 opacity-85 hidden sm:block will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * 35}px, ${mousePos.y * 30}px, 0) scale(${1 - mousePos.x * 0.03})`,
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Biomorphic Background Fluid Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-amber-100/40 via-emerald-100/30 to-orange-100/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-200/20 biomorphic-blob-1 blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Headings, CTAs & Brand Messaging             */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5F2E9] border border-emerald-900/10 text-[#24422E] text-xs font-bold tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Fresh • Homemade • Healthy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F2823] tracking-tight leading-[1.12]">
              Good Food{' '}
              <span className="text-[#E4753F] block sm:inline">
                {siteInfo.heroHighlightWord || 'Everyday'}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#5E6961] leading-relaxed max-w-xl">
              {siteInfo.heroSubtext ||
                `${siteInfo.brandName} brings you homemade meals, straight from trusted kitchens to your door.`}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/partners"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#24422E] hover:bg-[#1E3626] text-white font-bold text-sm shadow-xl shadow-[#24422E]/25 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>{siteInfo.ctaPrimaryText || 'Find Tiffin Partner'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => openLoginModal('PARTNER')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#24422E] font-bold text-sm border border-neutral-300/80 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <span>{siteInfo.ctaSecondaryText || 'Become a Partner'}</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="pt-4 flex items-center gap-6 border-t border-neutral-200/80 text-xs text-neutral-600 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900 text-sm">4.9★</span>
                <span>Customer Satisfaction</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-900 text-sm">100%</span>
                <span>FSSAI Verified Kitchens</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: REAL 3D / SPATIAL TIFFIN HERO COMPOSITION   */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[540px]">
            {/* 3D Spatial Container with perspective tilt reacting to mousemove */}
            <div
              className="relative w-full max-w-xl aspect-[1.15/1] flex items-center justify-center preserve-3d will-change-transform"
              style={{
                transform: `rotateY(${(mousePos.x * 7).toFixed(2)}deg) rotateX(${(-mousePos.y * 7).toFixed(2)}deg)`,
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Layer 1: Warm Organic Peach / Yellow Halo Disk (Deepest Plane) */}
              <div
                className="absolute w-72 h-72 sm:w-92 sm:h-92 rounded-full bg-gradient-to-tr from-[#F8D8B6] to-[#FCECD8] opacity-85 pointer-events-none will-change-transform"
                style={{
                  transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * -12}px, -30px)`,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />

              {/* Layer 2: Real 3D Stainless Steel Compartment Tiffin Box on Biomorphic Pedestal */}
              <div
                className="relative z-10 w-full h-full flex items-center justify-center will-change-transform"
                style={{
                  transform: `translate3d(${mousePos.x * 14}px, ${mousePos.y * 14}px, 25px)`,
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <img
                  src="/tiffin-3d-hero.png"
                  alt="3D Stainless Steel Homemade Tiffin Box with Meals"
                  className="w-full h-auto object-contain max-h-[490px] drop-shadow-[0_28px_40px_rgba(36,66,46,0.2)] pointer-events-none scale-105"
                />
              </div>

              {/* Layer 3: Handwritten Accent "Ghar jaisa Khana ♡" with Curved Arrow */}
              <div
                className="absolute top-2 sm:top-6 right-20 sm:right-28 z-20 pointer-events-none will-change-transform"
                style={{
                  transform: `translate3d(${mousePos.x * 18}px, ${mousePos.y * 18}px, 60px)`,
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="font-handwriting text-2xl sm:text-3xl font-bold text-[#1F2823] tracking-wide rotate-2">
                    Ghar jaisa Khana ♡
                  </span>
                  {/* Playful curved arrow pointing directly down to tiffin box */}
                  <svg
                    className="w-8 h-8 text-[#1F2823] -rotate-12 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4c4 4 6 8 4 14" />
                    <path d="M13 18l3 0l0-3" />
                  </svg>
                </div>
              </div>

              {/* Layer 4: VisionOS-Style Spatial Glassmorphism Feature Card (Overlapping Right Side) */}
              <div
                className="absolute -right-2 sm:-right-6 top-1/4 sm:top-1/4 z-30 will-change-transform"
                style={{
                  transform: `translate3d(${mousePos.x * 22}px, ${mousePos.y * 22}px, 80px)`,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div className="spatial-glass-panel rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 w-56 sm:w-64 space-y-4 shadow-2xl hover:scale-105 transition-all duration-300">
                  {/* Feature 1: Freshly Cooked */}
                  <div className="flex items-center gap-3.5 group cursor-default">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shadow-2xs group-hover:scale-110 transition-transform">
                      <Leaf className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#1F2823]">
                        Freshly Cooked
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium">Everyday</p>
                    </div>
                  </div>

                  {/* Feature 2: Trusted Kitchens */}
                  <div className="flex items-center gap-3.5 group cursor-default">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100/90 border border-amber-200/60 flex items-center justify-center text-[#E4753F] shadow-2xs group-hover:scale-110 transition-transform">
                      <ChefHat className="w-5 h-5 text-[#E4753F]" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#1F2823]">
                        Trusted Kitchens
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium">Home chefs & families</p>
                    </div>
                  </div>

                  {/* Feature 3: On-Time Delivery */}
                  <div className="flex items-center gap-3.5 group cursor-default">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shadow-2xs group-hover:scale-110 transition-transform">
                      <Truck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#1F2823]">
                        On-Time Delivery
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium">Hot & fresh</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
