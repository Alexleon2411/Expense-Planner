import { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'
import { userApi } from '../api'
import { useBudget } from '../hooks/useBudget'
import {formatCurrecy} from '../helpers'

export default function SalarySection() {
  const [salary, setSalary] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const { addBudget, state } = useBudget()

  useEffect(() => {
    userApi.getProfile().then((p) => {
      setSalary(p.salary ?? null)
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
    <div >
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
            {salary ? `${formatCurrecy(salary)}` : 'No definido'}
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

      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-sm font-bold text-gray-700 mb-3">Consejos de finanzas</p>

        {salary && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-bold text-blue-800 mb-2">Regla 50/30/20</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">50% Necesidades</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.5)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">30% Finanzas/Inversiones</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.3)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">20% Ahorro</span>
                <span className="font-bold text-gray-800">{formatCurrecy(salary * 0.2)}</span>
              </div>
            </div>
          </div>
        )}

        <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
          <li>Ahorra al menos el 20% de tu ingreso cada mes.</li>
          <li>Mantén un fondo de emergencia de 3 a 6 meses de gastos.</li>
          <li>No gastes más del 30% de tu ingreso en vivienda.</li>
          <li>Revisa tus suscripciones y elimina las que no uses.</li>
          <li>Prioriza pagar deudas con los intereses más altos primero.</li>
        </ul>
      </div>
    </div>
  )
}
