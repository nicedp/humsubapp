import React from 'react';
import { HELPER_CATEGORY_LABELS, HELPER_CATEGORY_ICONS } from '../constants/labels';
import type { Helper } from '../api/helpers';

interface Props {
  helper:      Helper;
  /** If provided, shows Edit + Delete buttons (admin mode) */
  onEdit?:     (helper: Helper) => void;
  onDelete?:   (helper: Helper) => void;
}

const HelperCard: React.FC<Props> = ({ helper, onEdit, onDelete }) => {
  const categoryLabel = HELPER_CATEGORY_LABELS[helper.category] ?? helper.category;
  const categoryIcon  = HELPER_CATEGORY_ICONS[helper.category]  ?? '🔧';

  const backendBase =
    (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

  const photoSrc = helper.photoUrl
    ? helper.photoUrl.startsWith('http')
      ? helper.photoUrl
      : `${backendBase}/api/v1/uploads/${helper.photoUrl}`
    : null;

  const initials = helper.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4 ${!helper.isActive ? 'opacity-60' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={helper.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{helper.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="mr-1">{categoryIcon}</span>
              {categoryLabel}
            </p>
          </div>
          {!helper.isActive && (
            <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="mt-2 space-y-0.5">
          <a
            href={`tel:${helper.phone}`}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline font-medium"
          >
            📞 {helper.phone}
          </a>
          {helper.alternatePhone && (
            <a
              href={`tel:${helper.alternatePhone}`}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:underline"
            >
              📱 {helper.alternatePhone}
            </a>
          )}
        </div>

        {/* Email */}
        {helper.email && (
          <p className="mt-1 text-xs text-gray-400 truncate">✉️ {helper.email}</p>
        )}

        {/* Description */}
        {helper.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 italic">"{helper.description}"</p>
        )}

        {/* Admin actions */}
        {(onEdit || onDelete) && (
          <div className="mt-3 flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(helper)}
                className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(helper)}
                className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelperCard;