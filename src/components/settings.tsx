export default function Settings() {
    return (
        <div className=" space-y-lg ">
            <main className="flex-1 flex min-h-screen  w-full">
                {/* <!-- Scrollable Canvas --> */}
                <div className="p-lg space-y-lg">
                    {/* <!-- Bento Grid Layout --> */}
                    <div className="lg:grid lg:grid-cols-12 gap-gutter ">
                        {/* <!-- Profile Management Card (Large) --> */}
                        <section className="col-span-12 lg:col-span-8 bento-card">
                            <header className="flex justify-between items-start mb-md">
                                <div>
                                    <span className="text-label-caps font-label-caps text-outline block mb-xs">PROFILE MANAGEMENT</span>
                                    <h2 className="text-headline-md font-headline-md text-on-surface">Switching & Editing Profiles</h2>
                                </div>
                                <button className="bg-primary text-on-primary px-md py-xs rounded-lg text-body-sm font-medium hover:opacity-90 transition-opacity">
                                    Add Profile
                                </button>
                            </header>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                {/* <!-- Profile Item: Business --> */}
                                <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary transition-all cursor-pointer group active-ring">
                                    <div className="flex items-center gap-sm mb-md">
                                        <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-fixed flex items-center justify-center">
                                            <span className="material-symbols-outlined" data-icon="business">business</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-body-md text-on-surface">Main Business</h3>
                                            <span className="text-label-caps font-label-caps text-secondary-container bg-secondary px-xs rounded text-[10px]">ACTIVE</span>
                                        </div>
                                    </div>
                                    <p className="text-body-sm text-on-surface-variant mb-md">Corporate tax, payroll, and asset management.</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-data-mono font-data-mono text-[12px] text-outline">ID: BNZ-2024</span>
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary" data-icon="edit_square">edit_square</span>
                                    </div>
                                </div>
                                {/* <!-- Profile Item: Family --> */}
                                <div className="p-md rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary transition-all cursor-pointer group">
                                    <div className="flex items-center gap-sm mb-md">
                                        <div className="w-12 h-12 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                                            <span className="material-symbols-outlined" data-icon="family_restroom">family_restroom</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-body-md text-on-surface">Family Fund</h3>
                                            <span className="text-label-caps font-label-caps text-outline px-xs rounded text-[10px]">SHARED</span>
                                        </div>
                                    </div>
                                    <p className="text-body-sm text-on-surface-variant mb-md">Household expenses, savings, and joint accounts.</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-data-mono font-data-mono text-[12px] text-outline">ID: FAM-4491</span>
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary" data-icon="edit_square">edit_square</span>
                                    </div>
                                </div>
                                {/* <!-- Profile Item: Individual --> */}
                                <div className="p-md rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary transition-all cursor-pointer group">
                                    <div className="flex items-center gap-sm mb-md">
                                        <div className="w-12 h-12 rounded-lg bg-surface-variant text-on-surface-variant flex items-center justify-center">
                                            <span className="material-symbols-outlined" data-icon="person">person</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-body-md text-on-surface">Individual</h3>
                                            <span className="text-label-caps font-label-caps text-outline px-xs rounded text-[10px]">PRIVATE</span>
                                        </div>
                                    </div>
                                    <p className="text-body-sm text-on-surface-variant mb-md">Personal investments and discretionary spending.</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-data-mono font-data-mono text-[12px] text-outline">ID: IND-9012</span>
                                        <span className="material-symbols-outlined text-outline group-hover:text-primary" data-icon="edit_square">edit_square</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* <!-- Security Card (Medium) --> */}
                        <section className="col-span-12 lg:col-span-4 bento-card">
                            <span className="text-label-caps font-label-caps text-outline block mb-xs">SECURITY</span>
                            <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Safety Measures</h2>
                            <div className="space-y-md">
                                <div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-lowest border border-outline-variant">
                                    <div className="flex items-center gap-sm">
                                        <span className="material-symbols-outlined text-primary" data-icon="lock_reset">lock_reset</span>
                                        <span className="text-body-md font-medium">Password</span>
                                    </div>
                                    <button className="text-primary text-body-sm font-bold hover:underline">Change</button>
                                </div>
                                <div className="p-sm rounded-lg bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20">
                                    <div className="flex items-center justify-between mb-xs">
                                        <div className="flex items-center gap-sm">
                                            <span className="material-symbols-outlined text-on-secondary-container" data-icon="verified_user">verified_user</span>
                                            <span className="text-body-md font-bold text-on-secondary-container">Two-Factor (2FA)</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input className="sr-only peer" type="checkbox" />
                                            <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                        </label>
                                    </div>
                                    <p className="text-[12px] text-on-secondary-fixed-variant leading-tight">Secure your account with a secondary mobile device verification.</p>
                                </div>
                                <div className="flex items-center justify-between p-sm rounded-lg bg-surface-container-lowest border border-outline-variant">
                                    <div className="flex items-center gap-sm">
                                        <span className="material-symbols-outlined text-outline" data-icon="history">history</span>
                                        <span className="text-body-md font-medium">Login History</span>
                                    </div>
                                    <span className="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                                </div>
                            </div>
                        </section>
                        {/* <!-- General Preferences Card (Medium) --> */}
                        <section className="col-span-12 lg:col-span-6 bento-card">
                            <span className="text-label-caps font-label-caps text-outline block mb-xs">GENERAL PREFERENCES</span>
                            <h2 className="text-headline-md font-headline-md text-on-surface mb-lg">Localization & Display</h2>
                            <div className="grid grid-cols-2 gap-lg">
                                <div className="space-y-sm">
                                    <label className="text-label-caps font-label-caps text-outline">DEFAULT LANGUAGE</label>
                                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                                        <option>Español (ES)</option>
                                        <option>English (US)</option>
                                        <option>Deutsch (DE)</option>
                                        <option>Français (FR)</option>
                                    </select>
                                </div>
                                <div className="space-y-sm">
                                    <label className="text-label-caps font-label-caps text-outline">CURRENCY</label>
                                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                                        <option>Euro (€) - EUR</option>
                                        <option>US Dollar ($) - USD</option>
                                        <option>Pound (£) - GBP</option>
                                        <option>Yen (¥) - JPY</option>
                                    </select>
                                </div>
                                <div className="space-y-sm">
                                    <label className="text-label-caps font-label-caps text-outline">TIMEZONE</label>
                                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                                        <option>(GMT+01:00) Madrid</option>
                                        <option>(GMT-05:00) New York</option>
                                        <option>(GMT+00:00) London</option>
                                    </select>
                                </div>
                                <div className="space-y-sm">
                                    <label className="text-label-caps font-label-caps text-outline">DATE FORMAT</label>
                                    <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-sm text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                                        <option>DD / MM / YYYY</option>
                                        <option>MM / DD / YYYY</option>
                                        <option>YYYY / MM / DD</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        {/* <!-- Notifications Card (Medium) --> */}
                        <section className="col-span-12 lg:col-span-6 bento-card">
                            <span className="text-label-caps font-label-caps text-outline block mb-xs">NOTIFICATIONS</span>
                            <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Communication Hub</h2>
                            <div className="space-y-base">
                                {/* <!-- Table for Notification controls --> */}
                                <div className="overflow-hidden rounded-xl border border-outline-variant">
                                    <table className="w-full text-left">
                                        <thead className="bg-surface-container-low">
                                            <tr>
                                                <th className="px-md py-sm text-label-caps font-label-caps text-outline">EVENT TYPE</th>
                                                <th className="px-md py-sm text-label-caps font-label-caps text-outline text-center">EMAIL</th>
                                                <th className="px-md py-sm text-label-caps font-label-caps text-outline text-center">PUSH</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant">
                                            <tr className="hover:bg-surface-container-lowest transition-colors">
                                                <td className="px-md py-md">
                                                    <div className="font-medium">Transaction Alerts</div>
                                                    <div className="text-[12px] text-outline">Over $1,000 movements</div>
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-surface-container-lowest transition-colors">
                                                <td className="px-md py-md">
                                                    <div className="font-medium">Budget Thresholds</div>
                                                    <div className="text-[12px] text-outline">When 80% limit is reached</div>
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-surface-container-lowest transition-colors">
                                                <td className="px-md py-md">
                                                    <div className="font-medium">Monthly Insights</div>
                                                    <div className="text-[12px] text-outline">Detailed finance summaries</div>
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                                <td className="px-md py-md text-center">
                                                    <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                        {/* <!-- Danger Zone / Bottom Utility Card (Full Width) --> */}
                        <section className="col-span-12 bento-card border-l-4 border-on-tertiary-container lg:col-span-6 ">
                            <div className="justify-between items-center gap-md">
                                <div>
                                    <h3 className="text-body-lg font-bold text-on-tertiary-container">Data Management</h3>
                                    <p className="text-body-sm text-outline">Export your entire financial history or request account deactivation.</p>
                                </div>
                                <div className="flex gap-md w-full md:w-auto">
                                    <button className="flex-1 md:flex-none border border-outline-variant px-lg py-sm rounded-lg font-medium hover:bg-surface-container transition-colors">
                                        Export Data (.CSV)
                                    </button>
                                    <button className="flex-1 md:flex-none bg-on-tertiary-container/10 text-on-tertiary-container px-lg py-sm rounded-lg font-bold hover:bg-on-tertiary-container/20 transition-colors">
                                        Deactivate Account
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                {/* <!-- Footer Info --> */}
            </main>
            {/* <!-- FAB (Contextual for Settings: Save) --> */}
            <button className="fixed bottom-xl right-xl bg-primary text-on-primary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50" id="save-fab">
                <span className="material-symbols-outlined" data-icon="save">save</span>
            </button>
        </div>
    )
}