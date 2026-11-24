import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHelpers, type Helper } from '../../api/helpers';
import HelperCard from '../../components/HelperCard';
import {
  HELPER_CATEGORIES,
  HELPER_CATEGORY_LABELS,
  HELPER_CATEGORY_ICONS,
} from '../../constants/labels';

const ResidentHelpers: React.FC = () => {
  const [search,          setSearch]          = useState('');
  const [categoryFilter,  setCategoryFilter]  = useState('');
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['helpers-resident', { search, categoryFilter, skip }],
    queryFn:  () => getHelpers({
      search:   search || undefined,
      category: categoryFilter || undefined,
      isActive: true,       // residents always see only active helpers
      skip,
      limit: LIMIT,
    }),
  });

  const helpers     = data?.data  ?? [];
  const total       = data?.total ?? 0;
  const totalPages  = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(skip / LIMIT) + 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔧 Society Helpers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contact details for plumbers, electricians, cleaning staff and other helpers.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border rounded-xl p-4">
        <input
          type="text"
          placeholder="Search name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
          className="border rounded-lg px-3 py-1.5 text-sm w-52 focus:ring-2 focus:ring-indigo-300 outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setSkip(0); }}
          className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
        >
          <option value="">All Categories</option>
          {HELPER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {HELPER_CATEGORY_ICONS[cat]} {HELPER_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-gray-400">{total} helper{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setCategoryFilter(''); setSkip(0); }}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !categoryFilter
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
          }`}
        >
          All
        </button>
        {HELPER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setSkip(0); }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {HELPER_CATEGORY_ICONS[cat]} {HELPER_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading helpers…</div>
      ) : helpers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-5xl mb-3">🔧</p>
          <p className="font-semibold text-gray-700">No helpers found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search || categoryFilter
              ? 'Try a different search or category.'
              : 'The admin has not added any helpers yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {helpers.map((h: Helper) => (
            <HelperCard key={h.id} helper={h} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setSkip(skip - LIMIT)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setSkip(skip + LIMIT)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ResidentHelpers;