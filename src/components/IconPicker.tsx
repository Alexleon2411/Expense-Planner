import { useState } from 'react'

const ICONS = [
  { name: 'restaurant', label: 'Restaurante' },
  { name: 'lunch_dining', label: 'Comida' },
  { name: 'local_cafe', label: 'Café' },
  { name: 'coffee', label: 'Cafetería' },
  { name: 'shopping_cart', label: 'Compras' },
  { name: 'store', label: 'Tienda' },
  { name: 'local_grocery_store', label: 'Supermercado' },
  { name: 'home', label: 'Hogar' },
  { name: 'house', label: 'Casa' },
  { name: 'apartment', label: 'Apartamento' },
  { name: 'electric_bolt', label: 'Electricidad' },
  { name: 'water_drop', label: 'Agua' },
  { name: 'wifi', label: 'Internet' },
  { name: 'phone_android', label: 'Teléfono' },
  { name: 'devices', label: 'Dispositivos' },
  { name: 'directions_car', label: 'Auto' },
  { name: 'local_gas_station', label: 'Gasolina' },
  { name: 'build', label: 'Mantenimiento' },
  { name: 'local_hospital', label: 'Hospital' },
  { name: 'local_pharmacy', label: 'Farmacia' },
  { name: 'favorite', label: 'Salud' },
  { name: 'spa', label: 'Bienestar' },
  { name: 'fitness_center', label: 'Gimnasio' },
  { name: 'sports_esports', label: 'Deportes' },
  { name: 'school', label: 'Educación' },
  { name: 'menu_book', label: 'Libros' },
  { name: 'child_care', label: 'Hijos' },
  { name: 'family_restroom', label: 'Familia' },
  { name: 'pets', label: 'Mascotas' },
  { name: 'checkroom', label: 'Ropa' },
  { name: 'content_cut', label: 'Peluquería' },
  { name: 'flight', label: 'Viajes' },
  { name: 'hotel', label: 'Hotel' },
  { name: 'movie', label: 'Cine' },
  { name: 'music_note', label: 'Música' },
  { name: 'videocam', label: 'Streaming' },
  { name: 'sports_bar', label: 'Ocio' },
  { name: 'local_bar', label: 'Bar' },
  { name: 'cake', label: 'Celebraciones' },
  { name: 'card_giftcard', label: 'Regalos' },
  { name: 'savings', label: 'Ahorro' },
  { name: 'account_balance', label: 'Banco' },
  { name: 'payments', label: 'Pagos' },
  { name: 'receipt_long', label: 'Recibos' },
  { name: 'credit_card', label: 'Tarjeta' },
  { name: 'paid', label: 'Dinero' },
  { name: 'trending_up', label: 'Inversiones' },
  { name: 'security', label: 'Seguros' },
  { name: 'volunteer_activism', label: 'Donaciones' },
  { name: 'redeem', label: 'Puntos' },
  { name: 'local_shipping', label: 'Envíos' },
  { name: 'delivery_dining', label: 'Delivery' },
  { name: 'dry_cleaning', label: 'Lavandería' },
  { name: 'emoji_people', label: 'Social' },
  { name: 'groups', label: 'Grupos' },
  { name: 'mail', label: 'Correo' },
  { name: 'print', label: 'Impresión' },
  { name: 'camera', label: 'Fotografía' },
  { name: 'brush', label: 'Arte' },
  { name: 'construction', label: 'Construcción' },
  { name: 'agriculture', label: 'Jardín' },
  { name: 'flag', label: 'Banderas' },
  { name: 'star', label: 'Favoritos' },
  { name: 'lock', label: 'Seguridad' },
  { name: 'notifications', label: 'Notificaciones' },
  { name: 'cloud', label: 'Nube' },
  { name: 'palette', label: 'Paleta' },
  { name: 'toys', label: 'Juguetes' },
  { name: 'psychology', label: 'Psicología' },
  { name: 'auto_stories', label: 'Estudios' },
  { name: 'work', label: 'Trabajo' },
  { name: 'business_center', label: 'Negocios' },
]

interface Props {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState('')

  const filtered = ICONS.filter(
    (icon) =>
      icon.label.toLowerCase().includes(search.toLowerCase()) ||
      icon.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Icono</label>
      <input
        className="w-full bg-white p-2 border rounded text-sm"
        placeholder="Buscar icono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 border rounded bg-white">
        {filtered.map((icon) => (
          <button
            key={icon.name}
            type="button"
            title={icon.label}
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
          <p className="col-span-6 text-center text-sm text-gray-400 py-4">Sin resultados</p>
        )}
      </div>
      {value && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="material-symbols-outlined text-[18px]">{value}</span>
          Seleccionado: <span className="font-medium text-gray-700">{value}</span>
        </div>
      )}
    </div>
  )
}
