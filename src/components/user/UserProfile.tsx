


import { useState } from 'react';
import EditUserProfile from './EditUserProfile';
import EditPassword from './EditPassword';
import { useAuth } from '../../hooks/useAuth';

export default function UserProfile() {
    const verifiedIconStyle = { fontVariationSettings: "'FILL' 1" };
    const [showProfile, setShowProfile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {user} = useAuth()    

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
                    <h2 className="text-headline-lg font-headline-lg mb-xs">Perfil de Usuario</h2>
                    <p className="text-body-md opacity-80 max-w-2xl mx-auto">Gestiona tu información personal y configuración de cuenta.</p>
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
                                Verificado
                            </span>
                            {/* <span className="inline-flex items-center px-3 py-1 bg-surface-container text-on-surface-variant rounded-full text-label-caps font-label-caps">
                                <span className="material-symbols-outlined text-sm mr-1">business_center</span>
                                Enterprise
                            </span> */}
                        </div>
                    </div>
                    <div className="flex flex-col gap-sm">
                        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-caps text-label-caps scale-98 transition-transform hover:opacity-90" onClick={handeEditeProfile}>Editar Perfil</button>
                        <button className="border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-caps text-label-caps scale-98 transition-transform hover:bg-surface-container" onClick={() => setShowPassword(true)}>Cambiar Password</button>
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
                    <h4 className="text-label-caps font-label-caps text-outline mb-xl">INFORMACIÓN PERSONAL</h4>
                    <div className="space-y-lg">
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">mail</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">Email</p>
                                <p className="text-body-md font-medium">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">phone</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">Teléfono</p>
                                <p className="text-body-md font-medium">{user?.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">location_on</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">Ubicación</p>
                                <p className="text-body-md font-medium">{user?.city?.toUpperCase()}, {user?.country?.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-md">
                            <span className="material-symbols-outlined text-outline">language</span>
                            <div>
                                <p className="text-label-caps font-label-caps text-outline">Idioma</p>
                                <p className="text-body-md font-medium">{user?.language}</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!-- Export Data Section (6 cols) --> */}
                <div className="col-span-12 lg:col-span-6 bento-card">
                    <h4 className="text-label-caps font-label-caps text-outline mb-xl">EXPORTAR DATOS</h4>
                    <p className="text-body-md text-on-surface-variant mb-xl">Descarga una copia de toda tu actividad financiera y configuraciones en formatos estándar.</p>
                    <div className="grid grid-cols-2 gap-md">
                        <button className="flex flex-col items-center justify-center p-lg border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container transition-all group">
                            <span className="material-symbols-outlined text-headline-lg mb-sm group-hover:text-primary">description</span>
                            <span className="font-label-caps text-label-caps">JSON Format</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-lg border border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container transition-all group">
                            <span className="material-symbols-outlined text-headline-lg mb-sm group-hover:text-primary">table_chart</span>
                            <span className="font-label-caps text-label-caps">CSV Table</span>
                        </button>
                    </div>
                    <p className="mt-xl text-body-sm text-outline italic">Última exportación realizada el 01 de Septiembre, 2023.</p>
                </div>
                {/* <!-- Activity History (12 cols) --> */}
                <div className="col-span-12 bento-card">
                    <div className="flex justify-between items-center mb-xl">
                        <h4 className="text-label-caps font-label-caps text-outline">HISTORIAL DE ACTIVIDAD</h4>
                        <button className="text-label-caps font-label-caps text-primary hover:underline">Ver todo</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-outline-variant">
                                    <th className="pb-md font-label-caps text-label-caps text-outline">Acción</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline">Dispositivo</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline">Ubicación</th>
                                    <th className="pb-md font-label-caps text-label-caps text-outline text-right">Fecha y Hora</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-secondary-container/10 flex items-center justify-center text-secondary">
                                            <span className="material-symbols-outlined text-sm">login</span>
                                        </div>
                                        <span className="font-medium">Inicio de sesión</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">Chrome / macOS</td>
                                    <td className="py-md text-on-surface-variant">Madrid, ES (192.168.1.1)</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">Hoy, 09:42 AM</td>
                                </tr>
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-on-tertiary-container/10 flex items-center justify-center text-on-tertiary-container">
                                            <span className="material-symbols-outlined text-sm">file_download</span>
                                        </div>
                                        <span className="font-medium">Exportación de datos</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">Chrome / macOS</td>
                                    <td className="py-md text-on-surface-variant">Madrid, ES (192.168.1.1)</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">01 Sep, 14:15 PM</td>
                                </tr>
                                <tr className="group hover:bg-surface-container-low transition-colors">
                                    <td className="py-md flex items-center gap-sm">
                                        <div className="w-8 h-8 rounded bg-primary-container/10 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-sm">settings</span>
                                        </div>
                                        <span className="font-medium">Cambio de contraseña</span>
                                    </td>
                                    <td className="py-md text-on-surface-variant font-data-mono text-data-mono">FinTrack App / iPhone 14</td>
                                    <td className="py-md text-on-surface-variant">Barcelona, ES (84.12.34.56)</td>
                                    <td className="py-md text-right text-outline font-data-mono text-data-mono">28 Ago, 11:20 AM</td>
                                </tr>
                            </tbody>
                        </table>
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
