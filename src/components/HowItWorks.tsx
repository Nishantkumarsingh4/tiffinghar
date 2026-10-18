import React from 'react';
import { Search, CalendarCheck, UtensilsCrossed } from 'lucide-react';
import SpatialTiltCard from './SpatialTiltCard';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Discover Local Kitchens',
      description:
        'Browse verified home chefs in your neighborhood. Filter by dietary choices, cuisines, and genuine customer ratings.',
      icon: Search,
    },
    {
      step: '02',
      title: 'Select Meal Plan',
      description:
        'Pick from daily trial thalis, weekly corporate packages, or monthly home meal subscriptions customized to your taste.',
      icon: CalendarCheck,
    },
    {
      step: '03',
      title: 'Hot Meals at Your Doorstep',
      description:
        'Enjoy hygienic, steaming home-cooked food delivered punctually in insulated stainless steel tiffin containers.',
      icon: UtensilsCrossed,
    },
  ];

  return (
    <section className="py-20 bg-white/60 border-y border-neutral-200/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight mt-2">
            How Tiffin Delivery Works
          </h2>
          <p className="text-[#5E6961] mt-3 text-base">
            Say goodbye to unhealthy restaurant takeout and boring cafeteria meals. Pure home cooking is just 3 clicks away.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <SpatialTiltCard key={item.step} maxTilt={6} scale={1.02} glare={true} className="h-full">
                <div className="relative rounded-3xl bg-[#FAF7F2] p-8 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#24422E] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-[#24422E]/15">
                        <Icon className="w-7 h-7 text-[#E4753F]" />
                      </div>
                      <span className="text-4xl font-black text-neutral-300 font-mono">
                        {item.step}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#1F2823] mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5E6961] leading-relaxed">
                      {item.description}
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
