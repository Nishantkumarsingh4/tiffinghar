'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Sparkles, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';
import PartnerCard from '@/components/PartnerCard';
import { PublicPartnerCard } from '@/types';

export default function PartnersDirectoryPage() {
  const [partners, setPartners] = useState<PublicPartnerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);
  const [areas, setAreas] = useState<Array<{ area: string; city: string }>>([]);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCity !== 'All') params.set('city', selectedCity);
      if (selectedArea !== 'All') params.set('area', selectedArea);
      if (vegOnly) params.set('vegOnly', 'true');
      if (minRating) params.set('minRating', minRating.toString());
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/partners/public?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setPartners(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        if (data.filterOptions) {
          setCities(data.filterOptions.cities || []);
          setAreas(data.filterOptions.areas || []);
        }
      }
    } catch (err) {
      console.error('Failed to load partners:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCity, selectedArea, vegOnly, minRating, page]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCity('All');
    setSelectedArea('All');
    setVegOnly(false);
    setMinRating(undefined);
    setPage(1);
  };

  const filteredAreas =
    selectedCity === 'All'
      ? areas
      : areas.filter((a) => a.city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <div className="py-12 bg-[#FAF7F2] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-[#E4753F]">
            Neighborhood Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1F2823] tracking-tight">
            Find Your Ideal Tiffin Partner
          </h1>
          <p className="text-sm sm:text-base text-[#5E6961]">
            Explore verified home chefs delivering hot, authentic homestyle thalis and weekly packages.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-neutral-200/80 mb-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by kitchen name, cuisine, dish..."
                className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm"
              />
            </div>

            {/* City Selector */}
            <div className="md:col-span-2">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedArea('All');
                  setPage(1);
                }}
                className="w-full px-3.5 py-3 bg-[#FAF7F2] rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Selector */}
            <div className="md:col-span-2">
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-3 bg-[#FAF7F2] rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
              >
                <option value="All">All Neighborhoods</option>
                {filteredAreas.map((a) => (
                  <option key={a.area} value={a.area}>
                    {a.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Selector */}
            <div className="md:col-span-2">
              <select
                value={minRating || ''}
                onChange={(e) => {
                  setMinRating(e.target.value ? parseFloat(e.target.value) : undefined);
                  setPage(1);
                }}
                className="w-full px-3.5 py-3 bg-[#FAF7F2] rounded-2xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#24422E] text-sm font-medium"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-1">
              <button
                onClick={handleResetFilters}
                title="Reset filters"
                className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-100 text-xs">
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[11px]">
              Filters:
            </span>
            <button
              onClick={() => {
                setVegOnly(!vegOnly);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all ${
                vegOnly
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-emerald-600'
              }`}
            >
              🥗 Pure Veg Only
            </button>

            <span className="ml-auto text-neutral-500 font-medium">
              Showing <strong className="text-neutral-900">{partners.length}</strong> of {totalCount} kitchens
            </span>
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/70 p-4 border border-neutral-200 animate-pulse space-y-3"
              >
                <div className="w-full aspect-[4/3] bg-neutral-200 rounded-2xl" />
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-neutral-200 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2823]">
              No kitchens found matching your criteria
            </h3>
            <p className="text-sm text-[#5E6961] mt-2 mb-6">
              Try adjusting your search terms, changing the neighborhood, or resetting your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-[#24422E] text-white text-sm font-bold"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-12">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  page === i + 1
                    ? 'bg-[#24422E] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
