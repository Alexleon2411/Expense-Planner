import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from 'react-i18next'
import '../i18n/profileResources'

type GuideCategory = 'gettingStarted' | 'expenses' | 'fixedExpenses' | 'analysis' | 'account'

const guideArticles = [
  ['start', 'gettingStarted', 'rocket_launch', 'startTitle', ['start1', 'start2', 'start3'], 'startSummary', 'startTip'],
  ['expenses', 'expenses', 'receipt_long', 'expensesTitle', ['expenses1', 'expenses2', 'expenses3', 'expenses4'], 'expensesSummary', 'expensesTip'],
  ['fixed', 'fixedExpenses', 'event_repeat', 'fixedTitle', ['fixed1', 'fixed2', 'fixed3', 'fixed4', 'fixed5'], 'fixedSummary', 'fixedTip'],
  ['dashboard', 'analysis', 'dashboard', 'dashboardTitle', ['dashboard1', 'dashboard2', 'dashboard3', 'dashboard4'], 'dashboardSummary'],
  ['stats', 'analysis', 'insights', 'statsTitle', ['stats1', 'stats2', 'stats3', 'stats4'], 'statsSummary'],
  ['reports', 'analysis', 'bar_chart', 'reportsTitle', ['reports1', 'reports2', 'reports3', 'reports4'], 'reportsSummary'],
  ['account', 'account', 'manage_accounts', 'accountTitle', ['account1', 'account2', 'account3', 'account4'], 'accountSummary'],
  ['language', 'account', 'language', 'languageTitle', ['language1', 'language2'], 'languageSummary', 'languageTip'],
] as const

const faq = [['differenceQ', 'differenceA'], ['partialQ', 'partialA'], ['missingQ', 'missingA'], ['editQ', 'editA'], ['categoriesQ', 'categoriesA']] as const

function Support() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | 'all'>('all')
  const [activeArticle, setActiveArticle] = useState<string | null>('start')
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [subject, setSubject] = useState('app')
  const [message, setMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const categories = useMemo(() => ['all', ...Array.from(new Set(guideArticles.map((article) => article[1])))] as const, [])
  const normalizedSearch = search.trim().toLowerCase()
  const filteredArticles = useMemo(() => guideArticles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article[1] === selectedCategory
    const content = [article[3], article[5], ...article[4]].map((key) => t(`support.articles.${key}`)).join(' ').toLowerCase()
    return matchesCategory && (!normalizedSearch || content.includes(normalizedSearch))
  }), [normalizedSearch, selectedCategory, t])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSubmitted(false)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError(t('support.completeFields'))
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
              <span className="text-label-caps font-label-caps uppercase tracking-widest">{t('support.center')}</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg">{t('support.title')}</h1>
            <p className="mt-sm max-w-2xl text-body-md opacity-80">{t('support.intro')}</p>
            <label className="mt-lg flex items-center gap-sm rounded-xl bg-white p-sm text-on-surface shadow-lg">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-on-surface-variant"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('support.searchPlaceholder')}
                aria-label={t('support.searchLabel')}
              />
              {search && <button type="button" onClick={() => setSearch('')} aria-label={t('support.clearSearch')} className="rounded-lg p-xs hover:bg-surface-container-high"><span className="material-symbols-outlined text-sm">close</span></button>}
            </label>
          </div>
          <span className="material-symbols-outlined absolute -bottom-8 right-4 text-[180px] text-white opacity-5">account_balance_wallet</span>
        </div>

        <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="bento-card lg:sticky lg:top-6">
              <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">{t('support.explore')}</p>
              <div className="mt-md flex gap-xs overflow-x-auto pb-xs lg:flex-col lg:overflow-visible">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap rounded-lg px-sm py-sm text-left text-body-sm transition-colors ${selectedCategory === category ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                  >
                    {category === 'all' ? t('support.categoryAll') : t(`support.categories.${category}`)}
                  </button>
                ))}
              </div>
              <div className="mt-lg hidden border-t border-outline-variant pt-lg lg:block">
                <p className="text-body-sm font-bold">{t('support.startQuestion')}</p>
                <p className="mt-xs text-body-xs text-on-surface-variant">{t('support.startAnswer')}</p>
              </div>
            </div>
          </aside>

          <div className="space-y-lg lg:col-span-9">
            <section className="bento-card">
              <div className="flex flex-col justify-between gap-sm sm:flex-row sm:items-end">
                <div>
                  <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">{t('support.completeGuide')}</p>
                  <h2 className="mt-xs text-headline-md font-headline-md">{t('support.essentials')}</h2>
                </div>
                <span className="text-body-sm text-on-surface-variant">{t('support.guideCount', { count: filteredArticles.length })}</span>
              </div>
              {filteredArticles.length === 0 ? (
                <div className="mt-lg rounded-xl bg-surface-container-low p-lg text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                  <p className="mt-sm font-bold">{t('support.noGuide')}</p>
                  <p className="mt-xs text-body-sm text-on-surface-variant">{t('support.tryAnother')}</p>
                </div>
              ) : (
                <div className="mt-lg space-y-sm">
                  {filteredArticles.map((article) => {
                    const [id, category, icon, title, steps, summary, tip] = article
                    const isOpen = activeArticle === id
                    return (
                      <article key={id} className={`overflow-hidden rounded-xl border transition-colors ${isOpen ? 'border-primary/40 bg-primary/5' : 'border-outline-variant'}`}>
                        <button type="button" onClick={() => setActiveArticle(isOpen ? null : id)} className="flex w-full items-center gap-sm p-md text-left">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary"><span className="material-symbols-outlined">{icon}</span></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-label-caps font-label-caps uppercase text-on-surface-variant">{t(`support.categories.${category}`)}</span>
                            <span className="mt-xs block text-body-md font-bold text-on-surface">{t(`support.articles.${title}`)}</span>
                            <span className="mt-xs block text-body-sm text-on-surface-variant">{t(`support.articles.${summary}`)}</span>
                          </span>
                          <span className={`material-symbols-outlined shrink-0 text-on-surface-variant transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-outline-variant px-md pb-md pt-sm sm:pl-[72px]">
                            <ol className="space-y-sm text-body-sm text-on-surface-variant">
                              {steps.map((step, index) => <li key={step} className="flex gap-sm"><span className="font-data-mono font-bold text-primary">{String(index + 1).padStart(2, '0')}</span><span>{t(`support.articles.${step}`)}</span></li>)}
                            </ol>
                            {tip && <p className="mt-md rounded-lg bg-secondary-container/20 p-sm text-body-sm text-on-secondary-container"><strong>{t('support.tip')}</strong> {t(`support.articles.${tip}`)}</p>}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="bento-card">
              <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-primary">quiz</span><h2 className="text-headline-md font-headline-md">{t('support.faqTitle')}</h2></div>
              <div className="mt-lg divide-y divide-outline-variant">
                {faq.map(([question, answer]) => <details key={question} className="group py-md first:pt-0 last:pb-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-md text-body-md font-bold"><span>{t(`support.faq.${question}`)}</span><span className="material-symbols-outlined shrink-0 text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span></summary><p className="mt-sm max-w-3xl text-body-sm leading-6 text-on-surface-variant">{t(`support.faq.${answer}`)}</p></details>)}
              </div>
            </section>

            <section className="bento-card" id="contact-support">
              <div className="mb-lg"><p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">{t('support.needHelp')}</p><h2 className="mt-xs text-headline-md font-headline-md">{t('support.request')}</h2><p className="mt-xs text-body-sm text-on-surface-variant">{t('support.requestDescription')}</p></div>
              {submitted && <div className="mb-md flex items-start gap-sm rounded-lg bg-secondary-container/20 p-sm text-body-sm text-on-secondary-container"><span className="material-symbols-outlined">check_circle</span><p>{t('support.saved')}</p></div>}
              {formError && <div className="mb-md rounded-lg bg-error/10 p-sm text-body-sm text-error">{formError}</div>}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-md md:grid-cols-2">
                <label className="flex flex-col gap-xs text-body-sm font-bold">{t('support.name')}<input className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={name} onChange={(event) => setName(event.target.value)} placeholder={t('support.namePlaceholder')} /></label>
                 <label className="flex flex-col gap-xs text-body-sm font-bold">{t('support.email')}<input className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('support.emailPlaceholder')} /></label>
                <label className="flex flex-col gap-xs text-body-sm font-bold md:col-span-2">{t('support.subject')}<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={subject} onChange={(event) => setSubject(event.target.value)}>{Object.entries({ app: 'app', expense: 'expense', fixed: 'fixed', report: 'report', suggestion: 'suggestion' }).map(([value, key]) => <option key={value} value={value}>{t(`support.subjects.${key}`)}</option>)}</select></label>
                <label className="flex flex-col gap-xs text-body-sm font-bold md:col-span-2">{t('support.message')}<textarea className="resize-none rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('support.messagePlaceholder')} /></label>
                <div className="md:col-span-2"><button className="flex w-full items-center justify-center gap-xs rounded-lg bg-primary px-lg py-sm font-bold text-on-primary transition-opacity hover:opacity-90 sm:w-auto" type="submit"><span className="material-symbols-outlined text-[18px]">save</span>{t('support.saveRequest')}</button></div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Support
