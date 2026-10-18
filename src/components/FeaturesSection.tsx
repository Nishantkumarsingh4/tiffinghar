import React from 'react';
import { Leaf, ShieldCheck, Clock, Award, Sparkles, HeartHandshake } from 'lucide-react';
import SpatialTiltCard from './SpatialTiltCard';

interface FeatureItem {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export default function FeaturesSection({ features }: { features: FeatureItem[] }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'leaf':
        return Leaf;
      case 'chef':
        return ShieldCheck;
      case 'truck':
        return Clock;
      default:
        return Sparkles;
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle Spatial Blobs in background */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            The Tiffin Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight mt-2">
            Why Thousands Choose Our Kitchens
          </h2>
          <p className="text-[#5E6961] mt-3 text-base">
            We hold home food to the highest standards: non-commercial cooking, low oil, natural spices, and uncompromising hygiene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = getIcon(f.icon);
            return (
              <SpatialTiltCard key={i} maxTilt={7} glare={true} className="h-full">
                <div className="spatial-glass-panel rounded-3xl p-8 flex flex-col justify-between h-full shadow-lg hover:shadow-2xl transition-all">
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 border border-emerald-200/60 text-[#24422E] flex items-center justify-center mb-6 shadow-2xs">
                      <Icon className="w-7 h-7 text-[#24422E]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E4753F]">
                      {f.subtitle}
                    </span>
                    <h3 className="text-xl font-black text-[#1F2823] mt-1 mb-3">
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#5E6961] leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              </SpatialTiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
