import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

type GuideCategory = 'Primeros pasos' | 'Gastos' | 'Gastos fijos' | 'Análisis' | 'Cuenta'

interface GuideArticle {
  id: string
  category: GuideCategory
  icon: string
  title: string
  summary: string
  steps: string[]
  tip?: string
}

const guideArticles: GuideArticle[] = [
  {
    id: 'start',
    category: 'Primeros pasos',
    icon: 'rocket_launch',
    title: 'Configura tu espacio',
    summary: 'Empieza con tu perfil y tu presupuesto para que los totales representen tu realidad.',
    steps: [
      'Abre Perfil para comprobar tu nombre, correo, ubicación e idioma.',
      'En Dashboard, revisa la sección de salario y presupuesto. El presupuesto se sincroniza con tu ingreso cuando corresponde.',
      'Crea tus categorías desde Dashboard > Categorías para clasificar cada gasto con claridad.',
    ],
    tip: 'Una categoría consistente hace que los gráficos y reportes sean más útiles.',
  },
  {
    id: 'expenses',
    category: 'Gastos',
    icon: 'receipt_long',
    title: 'Registra y revisa gastos',
    summary: 'Usa Expenses Feed como tu punto de entrada diario para mantener el control.',
    steps: [
      'Entra a Expenses Feed y pulsa Add Transaction.',
      'Completa nombre, monto, categoría, fecha y comentario. También puedes usar el lector de recibos si está disponible.',
      'Filtra por categoría, estado o rango de fechas para encontrar movimientos concretos.',
      'Pulsa una fila para abrir el detalle. Desde el estado puedes marcar el gasto como pagado, pendiente o parcial.',
    ],
    tip: 'Registra el gasto el mismo día y añade una nota breve cuando necesites recordar el contexto.',
  },
  {
    id: 'fixed',
    category: 'Gastos fijos',
    icon: 'event_repeat',
    title: 'Organiza tus gastos fijos',
    summary: 'Separa los compromisos recurrentes de los gastos puntuales y anticipa cuánto necesitas cada mes.',
    steps: [
      'Abre Fixed Expenses y pulsa New > New Template + Expense para crear un grupo y su primer gasto.',
      'Usa New > Add Fixed Expense cuando ya exista un grupo.',
      'Indica el monto, categoría y día de vencimiento para que el calendario sea accionable.',
      'En la vista Cards o Table puedes marcar un gasto como pagado, editarlo o eliminarlo.',
      'Activa Calendar en escritorio para revisar vencimientos y tendencias del mes seleccionado.',
    ],
    tip: 'Usa grupos como Vivienda, Suscripciones o Servicios para leer rápidamente el costo mensual por área.',
  },
  {
    id: 'dashboard',
    category: 'Análisis',
    icon: 'dashboard',
    title: 'Lee tu Dashboard',
    summary: 'Obtén una lectura rápida de tu situación antes de entrar en el detalle.',
    steps: [
      'Revisa total de gastos, categoría principal y ahorro mensual en las tarjetas superiores.',
      'En Últimos Gastos, pulsa una tarjeta para ver el estado de pago y los comentarios.',
      'Cambia entre Resumen, Plantillas, Categorías y Estadísticas desde las pestañas.',
      'Usa Top Expenses by Spending para identificar qué comercios o conceptos concentran más dinero.',
    ],
  },
  {
    id: 'stats',
    category: 'Análisis',
    icon: 'insights',
    title: 'Explora estadísticas',
    summary: 'Compara tus gastos por día, semana, mes o año para detectar patrones.',
    steps: [
      'Abre Dashboard > Estadísticas y selecciona Diario, Semanal, Mensual o Anual.',
      'Elige el mes, año y, en modo diario, el día que quieres inspeccionar.',
      'Consulta la distribución por categoría y la tendencia de gastos.',
      'En mensual revisa el calendario; en diario puedes desplazarte por las 24 horas para localizar cuándo gastas más.',
    ],
  },
  {
    id: 'reports',
    category: 'Análisis',
    icon: 'bar_chart',
    title: 'Genera reportes',
    summary: 'Usa Reports cuando necesites una revisión más detallada de un periodo.',
    steps: [
      'Abre Reports desde la navegación lateral.',
      'Selecciona el mes y año que quieres analizar.',
      'Revisa el resumen, la distribución por categorías y el detalle de transacciones.',
      'Usa la acción de exportación disponible en el reporte si necesitas conservar o compartir la información.',
    ],
  },
  {
    id: 'account',
    category: 'Cuenta',
    icon: 'manage_accounts',
    title: 'Administra tu cuenta',
    summary: 'Mantén actualizados tus datos y protege el acceso a la aplicación.',
    steps: [
      'En Perfil puedes editar tu información personal y cambiar la contraseña.',
      'En Settings configura moneda, zona horaria y formato de fecha.',
      'Usa Export Data en Perfil para descargar tu información cuando necesites una copia.',
      'Cierra sesión desde el menú de perfil cuando uses un dispositivo compartido.',
    ],
  },
]

const faq = [
  {
    question: '¿Cuál es la diferencia entre un gasto y un gasto fijo?',
    answer: 'Un gasto es un movimiento puntual que registras en Expenses Feed. Un gasto fijo representa un compromiso recurrente y se administra en Fixed Expenses, donde puedes agruparlo, asignar vencimiento y seguir sus pagos mensuales.',
  },
  {
    question: '¿Qué significa un pago parcial?',
    answer: 'Significa que solo has registrado una parte del monto original. El sistema conserva el total y muestra cuánto queda pendiente para que no confundas el pago realizado con la obligación completa.',
  },
  {
    question: '¿Por qué no aparece un gasto en una estadística?',
    answer: 'Comprueba el mes y año seleccionados, el filtro activo en Expenses Feed y el estado del gasto. Los gastos fijos pagados se incorporan al periodo actual cuando tienen un registro de pago.',
  },
  {
    question: '¿Puedo editar o eliminar un gasto fijo?',
    answer: 'Sí. En Fixed Expenses abre la vista Table o Cards y usa Edit para cambiar sus datos o Delete/Remove para eliminarlo. Revisa el grupo y el periodo antes de borrar un registro.',
  },
  {
    question: '¿Cómo mantengo categorías útiles?',
    answer: 'Crea categorías con nombres concretos y evita duplicados como “Comida” y “Alimentos” si representan lo mismo. La categoría se utiliza en filtros, gráficos, reportes y en la lectura del presupuesto.',
  },
]

function Support() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | 'Todas'>('Todas')
  const [activeArticle, setActiveArticle] = useState<string | null>('start')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('Duda sobre la aplicación')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(guideArticles.map((article) => article.category)))] as const, [])
  const normalizedSearch = search.trim().toLowerCase()
  const filteredArticles = useMemo(() => guideArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'Todas' || article.category === selectedCategory
    const content = `${article.title} ${article.summary} ${article.steps.join(' ')}`.toLowerCase()
    return matchesCategory && (!normalizedSearch || content.includes(normalizedSearch))
  }), [normalizedSearch, selectedCategory])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSubmitted(false)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Completa tu nombre, correo y mensaje para registrar la solicitud.')
      return
    }

    const request = { name: name.trim(), email: email.trim(), subject, message: message.trim(), createdAt: new Date().toISOString() }
    localStorage.setItem('last_support_request', JSON.stringify(request))
    setMessage('')
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen pb-xl">
      <section className="p-sm sm:p-lg space-y-lg">
        <div className="relative overflow-hidden rounded-2xl bg-primary-container px-lg py-xl text-on-primary">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-sm flex items-center gap-sm text-secondary-fixed">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="text-label-caps font-label-caps uppercase tracking-widest">Centro de ayuda</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg">Aprende a controlar tus gastos</h1>
            <p className="mt-sm max-w-2xl text-body-md opacity-80">Una guía práctica para registrar movimientos, organizar gastos fijos y convertir tus datos en decisiones.</p>
            <label className="mt-lg flex items-center gap-sm rounded-xl bg-white p-sm text-on-surface shadow-lg">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca una guía, por ejemplo: pago parcial"
                aria-label="Buscar en la guía"
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda" className="rounded-lg p-xs hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">close</span></button>}
            </label>
          </div>
          <span className="material-symbols-outlined absolute -bottom-8 right-4 text-[180px] text-white opacity-5">account_balance_wallet</span>
        </div>

        <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="bento-card lg:sticky lg:top-6">
              <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Explora por tema</p>
              <div className="mt-md flex gap-xs overflow-x-auto pb-xs lg:flex-col lg:overflow-visible">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-lg px-sm py-sm text-left text-body-sm transition-colors ${selectedCategory === category ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="mt-lg hidden border-t border-outline-variant pt-lg lg:block">
                <p className="text-body-sm font-bold">¿No sabes por dónde empezar?</p>
                <p className="mt-xs text-body-xs text-on-surface-variant">Sigue las guías en orden: configura tu cuenta, registra gastos y después revisa tus estadísticas.</p>
              </div>
            </div>
          </aside>

          <div className="space-y-lg lg:col-span-9">
            <section className="bento-card">
              <div className="flex flex-col justify-between gap-sm sm:flex-row sm:items-end">
                <div>
                  <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Guía completa</p>
                  <h2 className="mt-xs text-headline-md font-headline-md">Todo lo esencial, en un solo lugar</h2>
                </div>
                <span className="text-body-sm text-on-surface-variant">{filteredArticles.length} {filteredArticles.length === 1 ? 'guía' : 'guías'}</span>
              </div>
              {filteredArticles.length === 0 ? (
                <div className="mt-lg rounded-xl bg-surface-container-low p-lg text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                  <p className="mt-sm font-bold">No encontramos esa guía</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant">Prueba con otra palabra o selecciona “Todas”.</p>
                </div>
              ) : (
                <div className="mt-lg space-y-sm">
                  {filteredArticles.map((article) => {
                    const isOpen = activeArticle === article.id
                    return (
                      <article key={article.id} className={`overflow-hidden rounded-xl border transition-colors ${isOpen ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}>
                        <button type="button" onClick={() => setActiveArticle(isOpen ? null : article.id)} className="flex w-full items-center gap-sm p-md text-left">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary"><span className="material-symbols-outlined">{article.icon}</span></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-label-caps font-label-caps uppercase text-on-surface-variant">{article.category}</span>
                            <span className="mt-xs block text-body-md font-bold text-on-surface">{article.title}</span>
                            <span className="mt-xs block text-body-sm text-on-surface-variant">{article.summary}</span>
                          </span>
                          <span className={`material-symbols-outlined shrink-0 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-outline-variant px-md pb-md pt-sm sm:pl-[72px]">
                            <ol className="space-y-sm text-body-sm text-on-surface-variant">
                              {article.steps.map((step, index) => <li key={step} className="flex gap-sm"><span className="font-data-mono font-bold text-primary">{String(index + 1).padStart(2, '0')}</span><span>{step}</span></li>)}
                            </ol>
                            {article.tip && <p className="mt-md rounded-lg bg-secondary-container/20 p-sm text-body-sm text-on-secondary-container"><strong>Consejo:</strong> {article.tip}</p>}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="bento-card">
              <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-primary">quiz</span><h2 className="text-headline-md font-headline-md">Preguntas frecuentes</h2></div>
              <div className="mt-lg divide-y divide-outline-variant">
                {faq.map((item) => <details key={item.question} className="group py-md first:pt-0 last:pb-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-md text-body-md font-bold"><span>{item.question}</span><span className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span></summary><p className="mt-sm max-w-3xl text-body-sm leading-6 text-on-surface-variant">{item.answer}</p></details>)}
              </div>
            </section>

            <section className="bento-card" id="contact-support">
              <div className="mb-lg"><p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">¿Necesitas más ayuda?</p><h2 className="mt-xs text-headline-md font-headline-md">Registra una solicitud</h2><p className="mt-xs text-body-sm text-on-surface-variant">Describe el problema con el mayor contexto posible. La solicitud se conserva en este dispositivo para que no pierdas la información.</p></div>
              {submitted && <div className="mb-md flex items-start gap-sm rounded-lg bg-secondary-container/20 p-sm text-body-sm text-on-secondary-container"><span className="material-symbols-outlined">check_circle</span><p>Solicitud guardada correctamente en este dispositivo.</p></div>}
              {formError && <div className="mb-md rounded-lg bg-error/10 p-sm text-body-sm text-error">{formError}</div>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-md md:grid-cols-2">
                <label className="flex flex-col gap-xs text-body-sm font-bold">Nombre<input className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" /></label>
                <label className="flex flex-col gap-xs text-body-sm font-bold">Correo<input className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu@correo.com" /></label>
                <label className="flex flex-col gap-xs text-body-sm font-bold md:col-span-2">Tema<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={subject} onChange={(event) => setSubject(event.target.value)}><option>Duda sobre la aplicación</option><option>Problema con un gasto</option><option>Problema con un gasto fijo</option><option>Problema con un reporte</option><option>Sugerencia</option></select></label>
                <label className="flex flex-col gap-xs text-body-sm font-bold md:col-span-2">Mensaje<textarea className="resize-none rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="¿Qué intentabas hacer y qué ocurrió?" /></label>
                <div className="md:col-span-2"><button className="flex w-full items-center justify-center gap-xs rounded-lg bg-primary px-lg py-sm font-bold text-on-primary transition-opacity hover:opacity-90 sm:w-auto" type="submit"><span className="material-symbols-outlined text-[18px]">save</span>Guardar solicitud</button></div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Support
