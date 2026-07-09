import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'

type PartialPaymentModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (amount: number, comment: string) => void
  currentAmount?: number
  currentComment?: string
}

export default function PartialPaymentModal({
  isOpen,
  onClose,
  onSave,
  currentAmount = 0,
  currentComment = ''
}: PartialPaymentModalProps) {
  const [amount, setAmount] = useState(currentAmount)
  const [comment, setComment] = useState(currentComment)

  useEffect(() => {
    if (isOpen) {
      setAmount(currentAmount)
      setComment(currentComment)
    }
  }, [isOpen, currentAmount, currentComment])

  const handleSave = () => {
    if (amount <= 0) return
    onSave(amount, comment)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-bold text-slate-800 mb-4">
                  Pago Parcial
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                      placeholder="Monto del pago parcial"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Comentario
                    </label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none resize-none"
                      rows={3}
                      placeholder="Agregar un comentario..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={onClose}
                      className="text-sm font-semibold bg-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={amount <= 0}
                      className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
