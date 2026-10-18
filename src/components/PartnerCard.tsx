'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, MapPin, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { PublicPartnerCard } from '@/types';
import { useAuthModal } from './AuthModalProvider';
import SpatialTiltCard from './SpatialTiltCard';

interface PartnerCardProps {
  partner: PublicPartnerCard;
}

export default function PartnerCard({ partner }: PartnerCardProps) {
  const router = useRouter();
  const { currentUser, openLoginModal } = useAuthModal();

  const handleCardClick = () => {
    if (!currentUser) {
      // Unauthenticated visitor -> opens login popup
      openLoginModal('CUSTOMER');
    } else {
      // Authenticated user -> view details
      router.push(`/partner/${partner.id}`);
    }
  };

  return (
    <SpatialTiltCard maxTilt={6} scale={1.02} glare={true} className="h-full">
      <div
        onClick={handleCardClick}
        className="group relative cursor-pointer rounded-3xl bg-white/85 backdrop-blur-md p-3.5 border border-white/90 shadow-md shadow-[#24422E]/[0.05] hover:shadow-2xl hover:shadow-[#24422E]/[0.12] transition-all duration-300 flex flex-col justify-between h-full"
      >
        <div>
          {/* Cover Photo Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
            <img
              src={
                partner.coverUrl ||
                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'
              }
              alt={partner.kitchenName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Recommended Badge for Active Premium */}
            {partner.isPremium && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4753F] text-white text-xs font-bold shadow-md shadow-[#E4753F]/30 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended</span>
              </div>
            )}

            {/* Verified Badge */}
            {partner.isVerified && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#24422E]/90 text-white text-[11px] font-semibold backdrop-blur-xs shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Verified Kitchen</span>
              </div>
            )}

            {/* Plan Type Tag */}
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-medium backdrop-blur-sm">
              {partner.planType}
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-4 px-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-[#1F2823] group-hover:text-[#24422E] transition-colors line-clamp-1">
                {partner.kitchenName}
              </h3>
              <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-[#24422E] group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#5E6961] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#E4753F] shrink-0" />
              <span className="truncate">
                {partner.area}, {partner.city}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info: Rating & Price */}
        <div className="pt-3 px-1 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-bold">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{partner.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-neutral-400">({partner.totalReviews})</span>
          </div>

          <div className="text-right">
            <span className="text-neutral-400 text-[10px]">From</span>{' '}
            <span className="font-bold text-sm text-[#24422E]">
              ₹{partner.priceStartingFrom}
            </span>
            <span className="text-neutral-500 text-[10px]">/meal</span>
          </div>
        </div>
      </div>
    </SpatialTiltCard>
  );
}
