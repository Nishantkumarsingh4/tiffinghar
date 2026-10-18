import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '@/types';

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white/70 border-t border-neutral-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Community Love
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight mt-2">
            Loved by Diners & Home Chefs
          </h2>
          <p className="text-[#5E6961] mt-3 text-base">
            Read what office professionals, students, and passionate home culinary artists have to say about our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-[#FAF7F2] p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-[#1F2823] italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/60">
                <img
                  src={
                    t.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={t.authorName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#1F2823]">
                    {t.authorName}
                  </h4>
                  <p className="text-[11px] text-[#5E6961]">
                    {t.roleOrCity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
