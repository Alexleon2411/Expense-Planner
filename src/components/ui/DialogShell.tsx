import { Fragment, type ReactNode } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Button from './Button'

type DialogSize = 'lg' | 'xl'

const SIZE_CLASSES: Record<DialogSize, string> = {
  lg: 'sm:max-w-4xl',
  xl: 'sm:max-w-5xl',
}

interface DialogShellProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  size?: DialogSize
  closeLabel: string
  footer?: ReactNode
  children: ReactNode
}

export default function DialogShell({
  open,
  onClose,
  title,
  subtitle,
  size = 'lg',
  closeLabel,
  footer,
  children,
}: DialogShellProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[300]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:p-6">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel
                className={`flex max-h-[100dvh] w-full flex-col overflow-hidden border border-ui-border bg-ui-surface text-ui-fg sm:max-h-[90vh] sm:rounded-lg ${SIZE_CLASSES[size]}`}
              >
                <header className="flex items-start justify-between gap-4 border-b border-ui-border px-5 py-4 sm:px-6">
                  <div className="min-w-0">
                    <DialogTitle as="h2" className="text-ui-heading font-semibold text-ui-fg">
                      {title}
                    </DialogTitle>
                    {subtitle && <p className="mt-0.5 text-ui-caption text-ui-fg-muted">{subtitle}</p>}
                  </div>
                  <Button variant="ghost" icon="close" aria-label={closeLabel} title={closeLabel} onClick={onClose} />
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

                {footer && (
                  <footer className="flex flex-col-reverse gap-2 border-t border-ui-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    {footer}
                  </footer>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
