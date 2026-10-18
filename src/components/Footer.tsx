'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, Phone, Mail, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';
import { appConfig } from '@/lib/config';

export default function Footer() {
  const brandName = appConfig.brandName;

  return (
    <footer className="bg-[#1C2C21] text-white/80 pt-16 pb-10 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#E4753F] flex items-center justify-center text-white shadow-md">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {brandName}
              </span>
            </Link>
            <p className="text-sm text-neutral-300 leading-relaxed">
              India's premier homemade tiffin marketplace. Connecting local home chefs with busy professionals, students, and families looking for wholesome, pure homemade daily food.
            </p>
            <div className="pt-2">
              <span className="font-handwriting text-2xl text-[#E4753F]">
                Ghar jaisa khana, har roz ♡
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/partners" className="hover:text-white transition-colors">
                  Find Tiffin Partners
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About {brandName}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Partner Premium Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support & Helpdesk
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service & Hygiene
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Delivery Hubs */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Active Hubs
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4753F]" />
                Koramangala & HSR Layout
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4753F]" />
                Indiranagar & HAL 2nd Stage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4753F]" />
                Whitefield & ITPL Belt
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4753F]" />
                BTM Layout & Jayanagar
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4753F]" />
                Bellandur & Outer Ring Road
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Get in Touch
            </h4>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#E4753F] shrink-0 mt-0.5" />
                <a href={`tel:${appConfig.support.phone}`} className="hover:text-white transition-colors">
                  {appConfig.support.phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a
                  href={`https://wa.me/${appConfig.support.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Support
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#E4753F] shrink-0 mt-0.5" />
                <a href={`mailto:${appConfig.support.email}`} className="hover:text-white transition-colors">
                  {appConfig.support.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>Mon-Sun: 7:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© 2026 {brandName} Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="hover:text-emerald-300 transition-colors">
              Admin Portal &rarr;
            </Link>
            <p className="flex items-center gap-1.5">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for healthy everyday living
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
