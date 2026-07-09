import { useEffect, useRef, useState } from 'react'

type Context = 'individuo' | 'family' | 'company' | null;
export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';

interface SideBarProps {
    onAddTransaction: () => void;
    currentView: View;
    onNavigate: (view: View) => void;
}

export default function SideBar({  currentView, onNavigate }: SideBarProps) {
    const [contextStatus, setContextStatus] = useState<Context>(null);
    const [showContext, setShowContext] = useState(false);
    const switcherRef = useRef<HTMLDivElement | null>(null);

    const handleShowcontext = () => setShowContext((prev) => !prev);

    // Cierra el popover al hacer clic fuera del bloque del Context Switcher
    useEffect(() => {
        if (!showContext) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
                setShowContext(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showContext]);

    const handleContextSelection = (btnStatus: Context) => {
        return `p-xs hover:bg-surface-container-low rounded cursor-pointer text-body-sm w-full text-left ${
            contextStatus === btnStatus
            ? 'text-primary font-bold border-l-4 border-primary pl-4 '
            : 'text-on-surface-variant'
        }`
    }

    // Clases del link de navegación según si es la vista activa o no
    const navLinkClasses = (view: View) =>
        `flex items-center gap-md py-sm transition-colors pl-4 rounded-lg w-full text-left ${
            currentView === view
                ? 'text-primary font-bold border-l-4 border-primary'
                : 'hover:bg-surface-container text-on-surface-variant dark:text-outline'
        }`;

    return (
        <aside className="hidden md:fixed md:left-0 md:top-16 md:w-64 md:h-[calc(100vh-64px)] md:flex md:flex-col bg-surface shadow-md py-md">
            <div className="px-lg mb-xl">
                {/* <div className="flex items-center gap-xs">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[20px]" data-icon="account_balance">account_balance</span>
                    </div>
                    <h1 className="text-headline-md font-headline-md font-bold text-on-surface">AccounterFlow</h1>
                </div> */}
                <div className="px-md mb-lg mt-10" ref={switcherRef}>
                    <button
                        className="p-sm bg-surface-container rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors"
                        onClick={handleShowcontext}
                        >
                        <div className="flex items-center gap-sm">
                            <div>
                                <p className="text-label-caps font-label-caps text-on-surface-variant text-sm">Context Switcher</p>
                                <p className="text-body-md font-bold text-on-surface">{contextStatus?.toUpperCase()}</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-on-surface-variant">unfold_more</span>
                        </div>
                    </button>
                    {/* <!-- Context Switcher Popover (Simplified) --> */}
                    {showContext &&
                        <div className="mt-md space-y-1">
                            <div>
                                <button
                                    className={handleContextSelection('company')}
                                    onClick={() => {
                                        setContextStatus('company');
                                        setShowContext(false);
                                    }}>
                                        Company
                                </button>
                            </div>
                            <div>
                                <button className={handleContextSelection('family')}
                                onClick={() => {
                                    setContextStatus('family');
                                    setShowContext(false);
                                }}>Family</button>
                            </div>
                            <div>
                                <button className={handleContextSelection('individuo')}
                                onClick={() => {
                                    setContextStatus('individuo');
                                    setShowContext(false);
                                }}>Individuo</button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            <nav className="flex-1 px-sm space-y-xs">
                <button className={navLinkClasses('dashboard')} onClick={() => onNavigate('dashboard')}>
                    <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span className="text-body-md font-body-md">Dashboard</span>
                </button>
                <button className={navLinkClasses('dashboard')} onClick={() => onNavigate('dashboard2')}>
                    <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span className="text-body-md font-body-md">Dashboard - 2</span>
                </button>
                <button className={navLinkClasses('tracker')} onClick={() => onNavigate('tracker')}>
                    <span className="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
                    <span className="text-body-md font-body-md">Expenses Feed</span>
                </button>
                <button className={navLinkClasses('fixedExpenses')} onClick={() => onNavigate('fixedExpenses')}>
                    <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
                    <span className="text-body-md font-body-md">Fixed Expenses</span>
                </button>
                <button className={navLinkClasses('fixedExpenses')} onClick={() => onNavigate('report')}>
                    <span className="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
                    <span className="text-body-md font-body-md">Reports</span>
                </button>
            </nav>
            <div className="mt-auto px-sm pt-md border-t border-outline-variant">
            
            <button className={navLinkClasses('settings')} onClick={() => onNavigate('settings')}>
                <span className="material-symbols-outlined" data-icon="settings">settings</span>
                <span className="text-body-md font-body-md">Settings</span>
            </button>
            <button className={navLinkClasses('support')} onClick={() => onNavigate('support')}>
                <span className="material-symbols-outlined" data-icon="help">help</span>
                <span className="text-body-md font-body-md">Support</span>
            </button>
            </div>
        </aside>
    )
}