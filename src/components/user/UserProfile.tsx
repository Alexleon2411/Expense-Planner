


import { useState } from 'react';
import EditUserProfile from './EditUserProfile';
import EditPassword from './EditPassword';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import '../../i18n/profileResources'

export default function UserProfile() {
    const verifiedIconStyle = { fontVariationSettings: "'FILL' 1" };
    const [showProfile, setShowProfile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {user} = useAuth()    
    const { t, i18n } = useTranslation()
    const formatActivityDate = (date: Date) => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(date)

    const handeEditeProfile = () => {
        setShowProfile(!showProfile);
    }
    const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') ?? '?'


  return (
<div>
    <main className=" p-lg min-h-screen">
        <div className="max-w-6xl mx-auto">
            {/* <!-- Page Title --> */}
            <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
                <div className="relative z-10">
                    <h2 className="text-headline-lg font-headline-lg mb-xs">{t('profile.title')}</h2>
                    <p className="text-body-md opacity-80 max-w-2xl mx-auto">{t('profile.subtitle')}</p>
                </div>

            </div>
            {/* <div className="mb-xl">
                <h2 className="text-headline-lg font-headline-lg text-on-surface">Perfil de Usuario</h2>
                <p className="text-body-md text-on-surface-variant">Gestiona tu información personal y configuración de cuenta.</p>
            </div> */}
            {/* <!-- Bento Grid Layout --> */}
            <div className="grid grid-cols-12 gap-gutter">
                {/* <!-- Profile Header Card (8 cols) --> */}
                <div className="col-span-12 lg:col-span-12 bento-card flex flex-col md:flex-row items-center gap-xl">
                    <div >
                        <div className="w-14 h-14 rounded-md bg-black text-white flex items-center justify-center text-xl font-bold">
                            {initials}
                        </div>
                        
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-headline-md font-headline-md text-on-surface text- mb-1 font-bold">{user?.name}</h3>
                        {/* <p className="text-body-md text-on-surface-variant mb-4">Chief Financial Officer @ NexaCorp</p> */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-sm">
                            <span className="inline-flex items-center px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-caps font-label-caps">
                                <span className="material-symbols-outlined text-sm mr-1" style={verifiedIconStyle}>
                                    verified
                                </span>
                                {t('profile.verified')}
                            </span>
                            {/* <span className="inline-flex items-center px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-caps font-label-caps">
                                <span className="material-symbols-outlined text-sm mr-1">business_center</span>
                                Enterprise
                            </span> */}
                        </div>
                    </div>
                    <div className="flex flex-col gap-sm">
                        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-caps text-label-caps scale-98 transition-transform hover:opacity-90" onClick={handeEditeProfile}>{t('profile.edit')}</button>
                        <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-caps text-label-caps scale-98 transition-transform hover:bg-surface-container" onClick={() => setShowPassword(true)}>{t('profile.changePassword')}</button>
                    </div>
                </div>
                {/* <!-- Subscription Status (4 cols) --> */}
                {/* <div className="col-span-12 lg:col-span-4 bento-card flex flex-col justify-between">
                    <div>
                        <h4 className="text-label-caps font-label-caps text-outline mb-md">SUSCRIPCIÓN ACTUAL</h4>
                        <div className="flex items-baseline gap-xs mb-sm">
                            <span className="text-display-lg font-display-lg text-primary">Pro</span>
                            <span className="text-body-sm text-on-surface-variant">/ Mensual</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">Siguiente renovación: 15 Oct, 2023</p>
                    </div>
                    <div className="mt-lg">
                        <div className="w-full bg-surface-container rounded-full h-2 mb-2">
                            <div className="bg-secondary h-2 rounded-full w-3/4"></div>
                        </div>
                        <div className="flex justify-between text-label-caps font-label-caps text-outline">
                            <span>USO DE DATOS</span>
                            <span>75%</span>
                        </div>
                    </div>
                    <button className="mt-xl text-primary font-bold text-label-caps flex items-center gap-xs hover:gap-sm transition-all">
                        Gestionar Plan <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div> */}
                {/* <!-- Personal Information (6 cols) --> */}
                <div className="col-span-12 lg:col-span-6 bento-card">
                    <h4 className="text-label-caps font-label-caps text-outline mb-xl">{t('profile.personalInformation')}</h4>
                    <div className="space-y-lg">
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">mail</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">{t('profile.email')}</p>
                                <p className="text-body-md font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">phone</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">{t('profile.phone')}</p>
                                <p className="text-body-md font-medium">{user?.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">location_on</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">{t('profile.location')}</p>
                                <p className="text-body-md font-medium">{user?.city?.toUpperCase()}, {user?.country?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">language</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">{t('profile.language')}</p>
                                <p className="text-body-md font-medium">{user?.language}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- Export Data Section (6 cols) --> */}
                <div className="col-span-12 lg:col-span-6 bento-card">
                    <h4 className="text-label-caps font-label-caps text-outline mb-xl">{t('profile.exportData')}</h4>
                    <p className="text-body-md text-on-surface-variant mb-xl">{t('profile.exportDescription')}</p>
                    <div className="grid grid-cols-2 gap-md">
                        <button className="flex flex-col items-center justify-center p-lg border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container transition-all group">
                            <span className="material-symbols-outlined text-headline-lg mb-sm group-hover:text-primary">description</span>
                            <span className="font-label-caps text-label-caps">{t('profile.json')}</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-lg border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container transition-all group">
                            <span className="material-symbols-outlined text-headline-lg mb-sm group-hover:text-primary">table_chart</span>
                            <span className="font-label-caps text-label-caps">{t('profile.csv')}</span>
                        </button>
                    </div>
                    <p className="mt-xl text-body-sm text-outline italic">{t('profile.lastExport', { date: formatActivityDate(new Date(2023, 8, 1)) })}</p>
                </div>
                {/* <!-- Activity History (12 cols) --> */}
                <div className="col-span-12 bento-card">
                    <div className="flex justify-between items-center mb-xl">
                        <h4 className="text-label-caps font-label-caps text-outline">{t('profile.activityHistory')}</h4>
                        <button className="text-label-caps font-label-caps text-primary hover:underline">{t('profile.viewAll')}</button>
                    </div>
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-outline-variant">
                                    <th className="pb-md font-label-caps text-label-caps text-outline">{t('profile.action')}</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline">{t('profile.device')}</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline">{t('profile.location')}</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline text-right">{t('profile.dateTime')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-secondary-container/10 flex items-center justify-center text-secondary">
                                            <span className="material-symbols-outlined text-sm">login</span>
                                        </div>
                                        <span className="font-medium">{t('profile.login')}</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">{t('profile.activityBrowser')}</td>
                                    <td className="py-md text-on-surface-variant">{t('profile.activityMadrid')}</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">{formatActivityDate(new Date())}</td>
                                </tr>
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-on-tertiary-container/10 flex items-center justify-center text-on-tertiary-container">
                                            <span className="material-symbols-outlined text-sm">file_download</span>
                                        </div>
                                        <span className="font-medium">{t('profile.dataExport')}</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">{t('profile.activityBrowser')}</td>
                                    <td className="py-md text-on-surface-variant">{t('profile.activityMadrid')}</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">{formatActivityDate(new Date(2023, 8, 1, 14, 15))}</td>
                                </tr>
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-sm">settings</span>
                                        </div>
                                        <span className="font-medium">{t('profile.passwordChange')}</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">{t('profile.activityDevice')}</td>
                                    <td className="py-md text-on-surface-variant">{t('profile.activityBarcelona')}</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">{formatActivityDate(new Date(2023, 7, 28, 11, 20))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="sm:hidden space-y-sm">
                        {[
                            ['login', t('profile.login'), t('profile.activityBrowser'), t('profile.activityMadrid'), formatActivityDate(new Date())],
                            ['file_download', t('profile.dataExport'), t('profile.activityBrowser'), t('profile.activityMadrid'), formatActivityDate(new Date(2023, 8, 1, 14, 15))],
                            ['settings', t('profile.passwordChange'), t('profile.activityDevice'), t('profile.activityBarcelona'), formatActivityDate(new Date(2023, 7, 28, 11, 20))],
                        ].map(([icon, action, device, location, date]) => (
                            <article key={`${action}-${date}`} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
                                <div className="flex items-center gap-sm">
                                    <div className="w-8 h-8 shrink-0 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined text-sm">{icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{action}</p>
                                        <p className="text-body-xs text-on-surface-variant truncate">{device}</p>
                                    </div>
                                </div>
                                <div className="mt-sm border-t border-outline-variant pt-sm text-body-xs text-on-surface-variant">
                                    <p>{location}</p>
                                    <p className="mt-xs font-data-mono">{date}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
            {showProfile && user && (
                <EditUserProfile user={user} handeEditeProfile={handeEditeProfile}/>
            )}
            {showPassword && (
                <EditPassword onClose={() => setShowPassword(false)} />
            )}
        </div>
    </main>
    </div>
  )
}
