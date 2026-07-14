function Support() {
  return (
    <div>
        <main className=" min-h-screen pb-xl">
        {/* <!-- TopNavBar (Shared Component) --> */}
        <section className="p-lg">
            {/* <!-- Hero Header --> */}
            <div className="mb-xl text-center py-xl relative overflow-hidden rounded-xl bg-primary-container text-on-primary">
                <div className="relative z-10">
                    <h2 className="text-headline-lg font-headline-lg mb-xs">Soporte y Ayuda</h2>
                    <p className="text-body-md opacity-80 max-w-2xl mx-auto">Encuentra respuestas rápidas, guías detalladas y el apoyo que necesitas para gestionar tus finanzas con precisión.</p>
                </div>
                <div className="absolute inset-0 opacity-10">

                </div>
            </div>
            {/* <!-- Bento Grid Layout --> */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                {/* <!-- Category Cards --> */}
                <div className="md:col-span-4 bento-card flex flex-col gap-sm group cursor-pointer">
                    <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined" data-icon="rocket_launch">rocket_launch</span>
                        </div>
                        <span className="text-label-caps font-label-caps">Primeros Pasos</span>
                    </div>
                    <h3 className="text-headline-md font-headline-md">Getting Started</h3>
                    <p className="text-body-sm text-on-surface-variant flex-grow">Aprende lo básico: cómo configurar tu perfil, conectar tus cuentas y empezar a rastrear gastos.</p>
                    <ul className="space-y-xs mt-md">
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Guía rápida de configuración</li>
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Importación de datos bancarios</li>
                    </ul>
                </div>
                <div className="md:col-span-4 bento-card flex flex-col gap-sm group cursor-pointer">
                    <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-container">
                            <span className="material-symbols-outlined" data-icon="payments">payments</span>
                        </div>
                        <span className="text-label-caps font-label-caps">Facturación</span>
                    </div>
                    <h3 className="text-headline-md font-headline-md">Billing</h3>
                    <p className="text-body-sm text-on-surface-variant flex-grow">Gestiona tu suscripción, descarga facturas y conoce nuestros planes premium.</p>
                    <ul className="space-y-xs mt-md">
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Actualizar método de pago</li>
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Política de reembolsos</li>
                    </ul>
                </div>
                <div className="md:col-span-4 bento-card flex flex-col gap-sm group cursor-pointer">
                    <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-container">
                            <span className="material-symbols-outlined" data-icon="security">security</span>
                        </div>
                        <span className="text-label-caps font-label-caps">Seguridad</span>
                    </div>
                    <h3 className="text-headline-md font-headline-md">Security</h3>
                    <p className="text-body-sm text-on-surface-variant flex-grow">Tu privacidad es nuestra prioridad. Descubre cómo protegemos tus datos financieros.</p>
                    <ul className="space-y-xs mt-md">
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Autenticación de dos pasos</li>
                        <li className="flex items-center gap-xs text-body-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]" data-icon="description">description</span> Encriptación de datos</li>
                    </ul>
                </div>
                {/* <!-- Contact Form Section --> */}
                <div className="md:col-span-8 bento-card">
                    <div className="mb-lg">
                        <h3 className="text-label-caps font-label-caps mb-xs">Canales de Atención</h3>
                        <h2 className="text-headline-md font-headline-md">Contact Support</h2>
                    </div>
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        <div className="flex flex-col gap-xs">
                            <label className="text-label-caps font-label-caps text-on-surface-variant">Nombre Completo</label>
                            <input className="border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary outline-none text-body-sm" placeholder="Ej. Juan Pérez" type="text" />
                        </div>
                        <div className="flex flex-col gap-xs">
                            <label className="text-label-caps font-label-caps text-on-surface-variant">Correo Electrónico</label>
                            <input className="border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary outline-none text-body-sm" placeholder="juan@ejemplo.com" type="email" />
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-xs">
                            <label className="text-label-caps font-label-caps text-on-surface-variant">Asunto</label>
                            <select className="border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary outline-none text-body-sm appearance-none bg-transparent">
                                <option>Problemas Técnicos</option>
                                <option>Dudas de Facturación</option>
                                <option>Sugerencias de Producto</option>
                                <option>Otros</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex flex-col gap-xs">
                            <label className="text-label-caps font-label-caps text-on-surface-variant">Mensaje</label>
                            <textarea className="border border-outline-variant rounded-lg p-sm focus:ring-2 focus:ring-primary outline-none text-body-sm resize-none" placeholder="Describe detalladamente tu consulta..." rows={4}></textarea>
                        </div>
                        <div className="md:col-span-2">
                            <button className="bg-primary text-on-primary font-label-caps px-xl py-md rounded-lg hover:opacity-90 transition-opacity w-full md:w-auto" type="submit">ENVIAR SOLICITUD</button>
                        </div>
                    </form>
                </div>
                {/* <!-- Live Chat & Community Support --> */}
                <div className="md:col-span-4 flex flex-col gap-gutter">
                    <div className="bento-card flex flex-col gap-sm bg-secondary-container/10 border-2 border-secondary-container">
                        <div className="flex items-center justify-between">
                            <h4 className="text-headline-md font-headline-md">Live Chat</h4>
                            <span className="flex h-3 w-3 rounded-full bg-[#10B981]"></span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">¿Necesitas ayuda inmediata? Chatea con uno de nuestros especialistas financieros ahora mismo.</p>
                        <button className="mt-md bg-secondary text-on-secondary font-label-caps py-sm rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-xs">
                            <span className="material-symbols-outlined text-[20px]" data-icon="forum">forum</span>
                            INICIAR CHAT
                        </button>
                    </div>
                    <div className="bento-card flex flex-col gap-sm">
                        <h4 className="text-headline-md font-headline-md">Comunidad</h4>
                        <p className="text-body-sm text-on-surface-variant">Únete a más de 5,000 usuarios en nuestro foro. Comparte estrategias y resuelve dudas comunes.</p>
                        <div className="mt-md space-y-sm">
                            <a className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group" href="#">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-outline" data-icon="groups">groups</span>
                                    <span className="text-body-sm font-medium">Foro de Usuarios</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="arrow_forward">arrow_forward</span>
                            </a>
                            <a className="flex items-center justify-between p-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group" href="#">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-outline" data-icon="school">school</span>
                                    <span className="text-body-sm font-medium">Webinars Semanales</span>
                                </div>
                                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="arrow_forward">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </div>
                {/* <!-- FAQ Quick Links --> */}
                <div className="md:col-span-12 bento-card">
                    <h3 className="text-label-caps font-label-caps mb-lg">Preguntas Frecuentes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
                        <div className="space-y-md">
                            <details className="group border-b border-outline-variant pb-md">
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <span className="text-body-md font-medium">¿Cómo cancelo mi suscripción?</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" data-icon="expand_more">expand_more</span>
                                </summary>
                                <p className="mt-sm text-body-sm text-on-surface-variant">Ve a Configuración &gt; Suscripción y haz clic en 'Cancelar plan'. Tendrás acceso hasta el final de tu ciclo de facturación.</p>
                            </details>
                        </div>
                        <div className="space-y-md">
                            <details className="group border-b border-outline-variant pb-md">
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <span className="text-body-md font-medium">¿Es seguro vincular mi banco?</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" data-icon="expand_more">expand_more</span>
                                </summary>
                                <p className="mt-sm text-body-sm text-on-surface-variant">Sí, utilizamos encriptación de nivel bancario (AES-256) y nunca almacenamos tus credenciales de acceso directo.</p>
                            </details>
                        </div>
                        <div className="space-y-md">
                            <details className="group border-b border-outline-variant pb-md">
                                <summary className="flex items-center justify-between cursor-pointer list-none">
                                    <span className="text-body-md font-medium">¿Exportar reportes en PDF?</span>
                                    <span className="material-symbols-outlined transition-transform group-open:rotate-180" data-icon="expand_more">expand_more</span>
                                </summary>
                                <p className="mt-sm text-body-sm text-on-surface-variant">Desde la pestaña 'Reports', selecciona el rango de fechas y haz clic en el botón de descarga en la esquina superior derecha.</p>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
    </div>
  )
}

export default Support