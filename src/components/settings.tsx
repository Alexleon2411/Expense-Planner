import { useEffect, useState } from 'react'
import { expensesApi, profilesApi, userApi } from '../api'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import type { ProfileType } from '../api/profiles'

type Preferences = {
    language: string
    currency: string
    timezone: string
    dateFormat: string
}

type NotificationPreferences = Record<'transactionAlerts' | 'budgetThresholds' | 'monthlyInsights', { email: boolean; push: boolean }>

const defaultPreferences: Preferences = {
    language: 'es',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
}

const defaultNotifications: NotificationPreferences = {
    transactionAlerts: { email: true, push: false },
    budgetThresholds: { email: true, push: true },
    monthlyInsights: { email: false, push: true },
}

const notificationRows = [
    { id: 'transactionAlerts', title: 'Alertas de transacciones', description: 'Movimientos superiores a 1.000' },
    { id: 'budgetThresholds', title: 'Límites del presupuesto', description: 'Cuando se alcanza el 80% del límite' },
    { id: 'monthlyInsights', title: 'Resumen mensual', description: 'Resumen detallado de tus finanzas' },
] as const

function readStored<T>(key: string, fallback: T): T {
    try {
        const stored = localStorage.getItem(key)
        return stored ? { ...fallback, ...JSON.parse(stored) } : fallback
    } catch {
        return fallback
    }
}

function downloadFile(content: string, filename: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

function escapeCsv(value: unknown) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`
}

export default function Settings() {
    const { user, updatePassword, logout } = useAuth()
    const { categories } = useCategories()
    const { fixedExpenses } = useFixedExpenses()
    const [profiles, setProfiles] = useState<profilesApi.Profile[]>([])
    const [profilesLoading, setProfilesLoading] = useState(true)
    const [profileName, setProfileName] = useState('')
    const [profileType, setProfileType] = useState<ProfileType>('individual')
    const [profileMessage, setProfileMessage] = useState('')
    const [preferences, setPreferences] = useState<Preferences>(() => readStored('app_preferences', defaultPreferences))
    const [notifications, setNotifications] = useState<NotificationPreferences>(() => readStored('notification_preferences', defaultNotifications))
    const [saved, setSaved] = useState(false)
    const [savingSettings, setSavingSettings] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [exportMessage, setExportMessage] = useState('')
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordSaving, setPasswordSaving] = useState(false)

    useEffect(() => {
        profilesApi.listProfiles()
            .then(setProfiles)
            .catch(() => setProfileMessage('No se pudieron cargar tus perfiles.'))
            .finally(() => setProfilesLoading(false))
    }, [])

    function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
        setPreferences((current) => ({ ...current, [key]: value }))
        setSaved(false)
    }

    function toggleNotification(id: keyof NotificationPreferences, channel: 'email' | 'push') {
        setNotifications((current) => ({
            ...current,
            [id]: { ...current[id], [channel]: !current[id][channel] },
        }))
        setSaved(false)
    }

    async function saveSettings() {
        setSavingSettings(true)
        try {
            localStorage.setItem('app_preferences', JSON.stringify(preferences))
            localStorage.setItem('notification_preferences', JSON.stringify(notifications))
            await Promise.all([
                user ? userApi.updateProfile({ language: preferences.language }) : Promise.resolve(),
                profiles.length > 0 ? profilesApi.updateProfile(user?.id ?? '', { currency: preferences.currency }) : Promise.resolve(),
            ])
            setSaved(true)
        } catch {
            setProfileMessage('Las preferencias locales se guardaron, pero no se pudieron sincronizar con el servidor.')
        } finally {
            setSavingSettings(false)
        }
    }

    async function handlePasswordChange(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPasswordError('')
        setPasswordMessage('')
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Completa todos los campos de contraseña.')
            return
        }
        if (newPassword.length < 8) {
            setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.')
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('La confirmación no coincide con la nueva contraseña.')
            return
        }

        setPasswordSaving(true)
        try {
            await updatePassword(currentPassword, newPassword)
            setPasswordMessage('Contraseña actualizada correctamente.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch {
            setPasswordError('No se pudo actualizar la contraseña. Comprueba la contraseña actual.')
        } finally {
            setPasswordSaving(false)
        }
    }

    async function exportData(format: 'json' | 'csv') {
        setExporting(true)
        setExportMessage('')
        try {
            const response = await expensesApi.listExpenses({ page: 1, limit: 1000 })
            const exportData = { exportedAt: new Date().toISOString(), user, preferences, expenses: response.expenses, fixedExpenses, categories }
            if (format === 'json') {
                downloadFile(JSON.stringify(exportData, null, 2), 'expense-planner-data.json', 'application/json')
            } else {
                const headers = ['Tipo', 'Nombre', 'Categoría', 'Monto', 'Fecha', 'Estado', 'Comentario']
                const rows = response.expenses.map((expense) => ['Gasto', expense.name, expense.category, expense.amount, expense.date, expense.status, expense.comment])
                const fixedRows = fixedExpenses.map((expense) => ['Gasto fijo', expense.name, expense.category, expense.amount, '', expense.status, ''])
                downloadFile([headers, ...rows, ...fixedRows].map((row) => row.map(escapeCsv).join(',')).join('\n'), 'expense-planner-data.csv', 'text/csv;charset=utf-8')
            }
            setExportMessage('Exportación descargada correctamente.')
        } catch {
            setExportMessage('No se pudo preparar la exportación. Inténtalo de nuevo.')
        } finally {
            setExporting(false)
        }
    }

    async function handleCreateProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!profileName.trim()) {
            setProfileMessage('Escribe un nombre para el perfil.')
            return
        }
        try {
            const profile = await profilesApi.createProfile({ name: profileName.trim(), profileType, currency: preferences.currency })
            setProfiles((current) => [...current, profile])
            setProfileName('')
            setProfileMessage('Perfil creado correctamente.')
        } catch {
            setProfileMessage('No se pudo crear el perfil.')
        }
    }

    async function handleDeleteProfile() {
        if (!user || profiles.length === 0 || !window.confirm('¿Eliminar el perfil de tu cuenta?')) return
        try {
            await profilesApi.deleteProfile(user.id)
            const remainingProfiles = await profilesApi.listProfiles()
            setProfiles(remainingProfiles)
            setProfileMessage('Perfil eliminado correctamente.')
        } catch {
            setProfileMessage('No se pudo eliminar el perfil.')
        }
    }

    return (
        <main className="min-h-screen pb-xl">
            <div className="p-sm sm:p-lg space-y-lg">
                <div className="relative overflow-hidden rounded-2xl bg-primary-container px-lg py-xl text-on-primary">
                    <div className="relative z-10">
                        <div className="mb-sm flex items-center gap-sm text-secondary-fixed"><span className="material-symbols-outlined">tune</span><span className="text-label-caps font-label-caps uppercase tracking-widest">Preferencias</span></div>
                        <h1 className="text-headline-lg font-headline-lg">Settings</h1>
                        <p className="mt-xs max-w-2xl text-body-md opacity-80">Configura cómo funciona tu espacio y protege el acceso a tu información.</p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-8 right-4 text-[180px] text-white opacity-5">settings</span>
                </div>

                {saved && <div className="flex items-center gap-sm rounded-lg bg-secondary-container/20 p-sm text-body-sm text-on-secondary-container"><span className="material-symbols-outlined">check_circle</span>Preferencias guardadas en este dispositivo.</div>}

                <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
                    <section className="bento-card lg:col-span-7">
                        <div className="flex items-start justify-between gap-sm"><div><p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Perfiles</p><h2 className="mt-xs text-headline-md font-headline-md">Espacios de trabajo</h2></div><span className="material-symbols-outlined text-primary">workspaces</span></div>
                        {profilesLoading ? <p className="mt-md text-body-sm text-on-surface-variant">Cargando perfiles...</p> : <div className="mt-md space-y-sm">{profiles.length > 0 ? profiles.map((profile) => <div key={profile.id} className="flex items-center justify-between gap-sm rounded-xl border border-outline-variant bg-surface-container-low p-md"><div className="flex min-w-0 items-center gap-sm"><span className="material-symbols-outlined text-primary">{profile.profileType === 'business' ? 'business' : profile.profileType === 'family' ? 'family_restroom' : 'person'}</span><div className="min-w-0"><p className="font-bold truncate">{profile.name}</p><p className="text-body-xs text-on-surface-variant">{profile.profileType} · {profile.currency} {profile.isActive ? '· activo' : ''}</p></div></div><button type="button" onClick={handleDeleteProfile} className="rounded-lg p-xs text-on-surface-variant hover:bg-error/10 hover:text-error" title="Eliminar perfil" aria-label={`Eliminar ${profile.name}`}><span className="material-symbols-outlined text-sm">delete</span></button></div>) : <p className="rounded-lg bg-surface-container-low p-sm text-body-sm text-on-surface-variant">Aún no tienes perfiles configurados.</p>}</div>}
                        <form onSubmit={handleCreateProfile} className="mt-md grid grid-cols-1 gap-sm sm:grid-cols-[1fr_auto_auto]"><input className="rounded-lg border border-outline-variant bg-surface-container-low p-sm text-body-sm outline-none focus:border-primary" value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Nombre del nuevo perfil" /><select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm text-body-sm outline-none focus:border-primary" value={profileType} onChange={(event) => setProfileType(event.target.value as ProfileType)}><option value="individual">Individual</option><option value="family">Familiar</option><option value="business">Negocio</option></select><button type="submit" className="rounded-lg bg-primary px-md py-sm text-body-sm font-bold text-on-primary hover:opacity-90">Añadir</button></form>
                        {profileMessage && <p className="mt-sm text-body-sm text-on-surface-variant">{profileMessage}</p>}
                        <div className="mt-md flex items-center gap-sm rounded-xl bg-surface-container-low p-md">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><span className="material-symbols-outlined">person</span></div>
                            <div className="min-w-0"><h2 className="text-headline-md font-headline-md truncate">{user?.name || 'Usuario'}</h2><p className="text-body-sm text-on-surface-variant truncate">{user?.email || 'Sin correo disponible'}</p></div>
                        </div>
                        <p className="mt-md text-body-sm text-on-surface-variant">La información personal y los datos de contacto se editan desde la vista Perfil.</p>
                    </section>
                    <section className="bento-card lg:col-span-5">
                        <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Seguridad</p>
                        <div className="mt-md flex items-center justify-between gap-sm rounded-xl border border-outline-variant p-md"><div className="flex items-center gap-sm"><span className="material-symbols-outlined text-primary">lock</span><span className="text-body-md font-medium">Contraseña</span></div><button type="button" onClick={() => { setShowPasswordForm((open) => !open); setPasswordError(''); setPasswordMessage('') }} className="text-body-sm font-bold text-primary hover:underline">{showPasswordForm ? 'Cerrar' : 'Cambiar'}</button></div>
                        {showPasswordForm && <form onSubmit={handlePasswordChange} className="mt-md space-y-sm"><input className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-body-sm outline-none focus:border-primary" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Contraseña actual" autoComplete="current-password" /><input className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-body-sm outline-none focus:border-primary" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nueva contraseña (mínimo 8)" autoComplete="new-password" /><input className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-body-sm outline-none focus:border-primary" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirmar nueva contraseña" autoComplete="new-password" />{passwordError && <p className="text-body-sm text-error">{passwordError}</p>}{passwordMessage && <p className="text-body-sm text-secondary">{passwordMessage}</p>}<button className="w-full rounded-lg bg-primary px-md py-sm font-bold text-on-primary disabled:opacity-50" type="submit" disabled={passwordSaving}>{passwordSaving ? 'Actualizando...' : 'Actualizar contraseña'}</button></form>}
                        <button type="button" onClick={logout} className="mt-md flex w-full items-center justify-center gap-xs rounded-lg border border-outline-variant px-md py-sm text-body-sm font-bold text-on-surface-variant hover:bg-surface-container-low"><span className="material-symbols-outlined text-sm">logout</span>Cerrar sesión</button>
                    </section>

                    <section className="bento-card lg:col-span-6">
                        <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Preferencias generales</p>
                        <h2 className="mt-xs text-headline-md font-headline-md">Idioma y formato</h2>
                        <div className="mt-lg grid grid-cols-1 gap-md sm:grid-cols-2">
                            <label className="flex flex-col gap-xs text-body-sm font-bold">Idioma<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={preferences.language} onChange={(event) => updatePreference('language', event.target.value)}><option value="es">Español</option><option value="en">English</option><option value="de">Deutsch</option><option value="fr">Français</option></select></label>
                            <label className="flex flex-col gap-xs text-body-sm font-bold">Moneda<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={preferences.currency} onChange={(event) => updatePreference('currency', event.target.value)}><option value="EUR">Euro (€)</option><option value="USD">Dólar estadounidense ($)</option><option value="GBP">Libra (£)</option><option value="JPY">Yen (¥)</option></select></label>
                            <label className="flex flex-col gap-xs text-body-sm font-bold">Zona horaria<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={preferences.timezone} onChange={(event) => updatePreference('timezone', event.target.value)}><option value="Europe/Madrid">Madrid (GMT+01:00)</option><option value="America/New_York">Nueva York (GMT-05:00)</option><option value="Europe/London">Londres (GMT+00:00)</option></select></label>
                            <label className="flex flex-col gap-xs text-body-sm font-bold">Formato de fecha<select className="rounded-lg border border-outline-variant bg-surface-container-low p-sm font-normal outline-none focus:border-primary" value={preferences.dateFormat} onChange={(event) => updatePreference('dateFormat', event.target.value)}><option value="DD/MM/YYYY">DD / MM / YYYY</option><option value="MM/DD/YYYY">MM / DD / YYYY</option><option value="YYYY-MM-DD">YYYY - MM - DD</option></select></label>
                        </div>
                    </section>

                    <section className="bento-card lg:col-span-6">
                        <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Notificaciones</p>
                        <h2 className="mt-xs text-headline-md font-headline-md">Elige qué quieres recibir</h2>
                        <div className="mt-lg space-y-sm">
                            {notificationRows.map((row) => <div key={row.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md"><div className="mb-sm"><p className="font-medium">{row.title}</p><p className="text-body-xs text-on-surface-variant">{row.description}</p></div><div className="grid grid-cols-2 gap-sm border-t border-outline-variant pt-sm"><label className="flex items-center justify-between gap-sm text-body-sm">Correo<input className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" checked={notifications[row.id].email} onChange={() => toggleNotification(row.id, 'email')} /></label><label className="flex items-center justify-between gap-sm text-body-sm">Push<input className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" checked={notifications[row.id].push} onChange={() => toggleNotification(row.id, 'push')} /></label></div></div>)}
                        </div>
                    </section>

                    <section className="bento-card lg:col-span-6">
                        <p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Tus datos</p>
                        <h2 className="mt-xs text-headline-md font-headline-md">Exportar información</h2>
                        <p className="mt-sm text-body-sm text-on-surface-variant">Descarga tus gastos, gastos fijos, categorías y preferencias actuales.</p>
                        <div className="mt-lg grid grid-cols-1 gap-sm sm:grid-cols-2"><button type="button" onClick={() => exportData('json')} disabled={exporting} className="flex items-center justify-center gap-xs rounded-lg border border-outline-variant px-md py-sm font-bold hover:bg-surface-container-low disabled:opacity-50"><span className="material-symbols-outlined text-sm">data_object</span>JSON</button><button type="button" onClick={() => exportData('csv')} disabled={exporting} className="flex items-center justify-center gap-xs rounded-lg border border-outline-variant px-md py-sm font-bold hover:bg-surface-container-low disabled:opacity-50"><span className="material-symbols-outlined text-sm">table_view</span>CSV</button></div>
                        {exporting && <p className="mt-sm text-body-xs text-on-surface-variant">Preparando exportación...</p>}{exportMessage && <p className={`mt-sm text-body-sm ${exportMessage.startsWith('No') ? 'text-error' : 'text-secondary'}`}>{exportMessage}</p>}
                    </section>

                    <section className="bento-card border-l-4 border-on-tertiary-container lg:col-span-6"><p className="text-label-caps font-label-caps uppercase tracking-widest text-on-surface-variant">Gestión de cuenta</p><h2 className="mt-xs text-headline-md font-headline-md">Desactivación</h2><p className="mt-sm text-body-sm text-on-surface-variant">La desactivación definitiva requiere un flujo de confirmación en el servidor y todavía no está disponible.</p><button type="button" disabled className="mt-lg w-full rounded-lg bg-on-tertiary-container/10 px-md py-sm font-bold text-on-tertiary-container opacity-60 sm:w-auto">No disponible</button></section>
                </div>
                <button type="button" onClick={saveSettings} disabled={savingSettings} className="fixed bottom-lg right-lg z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform hover:scale-105 disabled:opacity-50" aria-label="Guardar preferencias" title="Guardar preferencias"><span className="material-symbols-outlined">{savingSettings ? 'progress_activity' : 'save'}</span></button>
            </div>
        </main>
    )
}
