import { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'
import { userApi } from '../api'
import { useBudget } from '../hooks/useBudget'

export default function SalarySection() {
  const [salary, setSalary] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { addBudget, state } = useBudget()

  useEffect(() => {
    userApi.getProfile().then((p) => {
      setSalary(p.salary)
      setInput(p.salary ? String(p.salary) : '')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return
    setSaving(true)
    try {
      await userApi.updateProfile({ salary: val })
      setSalary(val)
      setEditing(false)
      setMessage('Salario actualizado')
      // Auto-create budget from salary
      if (state.budget === 0 || state.budget === val) {
        await addBudget(val)
      }
      setTimeout(() => setMessage(''), 3000)
    } catch {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Ingreso Mensual Fijo</h3>
      {editing ? (
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Salario / Ingreso mensual</label>
            <NumericFormat
              className="w-full bg-slate-100 p-2 border rounded mt-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej. 15000"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => { setEditing(false); setInput(salary ? String(salary) : '') }}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-3xl font-black text-blue-600">
            {salary ? `$${salary.toLocaleString('es-MX')}` : 'No definido'}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg font-semibold"
          >
            {salary ? 'Editar' : 'Definir'}
          </button>
        </div>
      )}
      {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      {salary && (
        <p className="text-xs text-gray-500 mt-2">
          El presupuesto se establece automáticamente según tu ingreso.
        </p>
      )}
    </div>
  )
}
