import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ICONS = [
  { name: 'restaurant' },
  { name: 'lunch_dining' },
  { name: 'local_cafe' }, { name: 'coffee' }, { name: 'shopping_cart' }, { name: 'store' }, { name: 'local_grocery_store' },
  { name: 'home' }, { name: 'house' }, { name: 'apartment' }, { name: 'electric_bolt' }, { name: 'water_drop' }, { name: 'wifi' },
  { name: 'phone_android' }, { name: 'devices' }, { name: 'directions_car' }, { name: 'local_gas_station' }, { name: 'build' },
  { name: 'local_hospital' }, { name: 'local_pharmacy' }, { name: 'favorite' }, { name: 'spa' }, { name: 'fitness_center' },
  { name: 'sports_esports' }, { name: 'school' }, { name: 'menu_book' }, { name: 'child_care' }, { name: 'family_restroom' },
  { name: 'pets' }, { name: 'checkroom' }, { name: 'content_cut' }, { name: 'flight' }, { name: 'hotel' }, { name: 'movie' },
  { name: 'music_note' }, { name: 'videocam' }, { name: 'sports_bar' }, { name: 'local_bar' }, { name: 'cake' }, { name: 'card_giftcard' },
  { name: 'savings' }, { name: 'account_balance' }, { name: 'payments' }, { name: 'receipt_long' }, { name: 'credit_card' }, { name: 'paid' },
  { name: 'trending_up' }, { name: 'security' }, { name: 'volunteer_activism' }, { name: 'redeem' }, { name: 'local_shipping' },
  { name: 'delivery_dining' }, { name: 'dry_cleaning' }, { name: 'emoji_people' }, { name: 'groups' }, { name: 'mail' }, { name: 'print' },
  { name: 'camera' }, { name: 'brush' }, { name: 'construction' }, { name: 'agriculture' }, { name: 'flag' }, { name: 'star' },
  { name: 'lock' }, { name: 'notifications' }, { name: 'cloud' }, { name: 'palette' }, { name: 'toys' }, { name: 'psychology' },
  { name: 'auto_stories' }, { name: 'work' }, { name: 'business_center' },
]

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState('')
  const { t } = useTranslation()

  const filtered = ICONS.filter(
    (icon) =>
      String(t(`icons.${icon.name}` as never)).toLowerCase().includes(search.toLowerCase()) ||
      icon.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
       <label className="text-sm font-medium text-gray-700">{t('categories.icon')}</label>
      <input
        className="w-full bg-white p-2 border rounded text-sm"
         placeholder={t('categories.iconPlaceholder')}
         aria-label={t('categories.iconPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 border rounded bg-white">
        {filtered.map((icon) => (
          <button
            key={icon.name}
            type="button"
             title={String(t(`icons.${icon.name}` as never))}
            onClick={() => onChange(icon.name)}
            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
              value === icon.name
                ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon.name}</span>
          </button>
        ))}
        {filtered.length === 0 && (
           <p className="col-span-6 text-center text-sm text-gray-400 py-4">{t('categories.noIconResults')}</p>
        )}
      </div>
      {value && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="material-symbols-outlined text-[18px]">{value}</span>
           {t('categories.selectedIcon')}: <span className="font-medium text-gray-700">{value}</span>
        </div>
      )}
    </div>
  )
}
