import { useEffect, useRef, useState } from 'react'

// type Context = 'individuo' | 'family' | 'company' | null;
export type View = 'tracker' | 'dashboard' | 'fixedExpenses' | 'settings' | 'support' | 'profile' | 'dashboard2' | 'report';

interface SideBarProps {
    onAddTransaction: () => void;
    currentView: View;
    onNavigate: (view: View) => void;
    onCollapsedChange?: (collapsed: boolean) => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

export default function SideBar({ currentView, onNavigate, onCollapsedChange, mobileOpen = false, onMobileClose }: SideBarProps) {
    // const [contextStatus, setContextStatus] = useState<Context>(null);
    const [showContext, setShowContext] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const switcherRef = useRef<HTMLDivElement | null>(null);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        onCollapsedChange?.(next);
    };

    // const handleShowcontext = () => setShowContext((prev) => !prev);

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

    // const handleContextSelection = (btnStatus: Context) =>
    //     `p-xs hover:bg-surface-container-low rounded cursor-pointer text-body-sm w-full text-left transition-colors ${
    //         contextStatus === btnStatus
    //         ? 'text-primary font-bold border-l-4 border-primary pl-4'
    //         : 'text-on-surface-variant'
    //     }`;

    const navLinkClasses = (view: View) =>
        `flex items-center gap-md py-sm transition-colors pl-4 rounded-lg w-full text-left ${
            currentView === view
                ? 'text-primary font-bold border-l-4 border-primary'
                : 'hover:bg-surface-container text-on-surface-variant dark:text-outline'
        }`;

    const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

    const handleNavigate = (view: View) => {
        onNavigate(view);
        onMobileClose?.();
    };

    const navContent = (
        <>
            {/* Context Switcher
            {!collapsed && (
                <div className="px-lg mb-xl">
                    <div className="px-md mb-lg mt-10" ref={switcherRef}>
                        <button
                            className="p-sm bg-surface-container rounded-lg cursor-pointer hover:bg-surface-container-high transition-colors w-full"
                            onClick={handleShowcontext}
                        >
                            <div className="flex items-center gap-sm">
                                <div className="min-w-0">
                                    <p className="text-label-caps font-label-caps text-on-surface-variant text-sm">Context Switcher</p>
                                    <p className="text-body-md font-bold text-on-surface truncate">{contextStatus?.toUpperCase()}</p>
                                </div>
                                <span className="material-symbols-outlined ml-auto text-on-surface-variant">unfold_more</span>
                            </div>
                        </button>
                        {showContext &&
                            <div className="mt-md space-y-1">
                                <button className={handleContextSelection('company')} onClick={() => { setContextStatus('company'); setShowContext(false); }}>
                                    Company
                                </button>
                                <button className={handleContextSelection('family')} onClick={() => { setContextStatus('family'); setShowContext(false); }}>
                                    Family
                                </button>
                                <button className={handleContextSelection('individuo')} onClick={() => { setContextStatus('individuo'); setShowContext(false); }}>
                                    Individuo
                                </button>
                            </div>
                        }
                    </div>
                </div>
            )} */}

            {collapsed && <div className="mt-10" />}

            {/* Navigation */}
            <nav className="flex-1 px-sm space-y-xs">
                <button className={navLinkClasses('dashboard')} onClick={() => handleNavigate('dashboard')} title="Dashboard">
                    <span className="material-symbols-outlined shrink-0" data-icon="dashboard">dashboard</span>
                    {!collapsed && <span className="text-body-md font-body-md">Dashboard</span>}
                </button>
                {/* <button className={navLinkClasses('dashboard')} onClick={() => handleNavigate('dashboard2')} title="Dashboard 2">
                    <span className="material-symbols-outlined shrink-0" data-icon="dashboard">dashboard</span>
                    {!collapsed && <span className="text-body-md font-body-md">Dashboard - 2</span>}
                </button> */}
                <button className={navLinkClasses('tracker')} onClick={() => handleNavigate('tracker')} title="Expenses Feed">
                    <span className="material-symbols-outlined shrink-0" data-icon="receipt_long">receipt_long</span>
                    {!collapsed && <span className="text-body-md font-body-md">Expenses Feed</span>}
                </button>
                <button className={navLinkClasses('fixedExpenses')} onClick={() => handleNavigate('fixedExpenses')} title="Fixed Expenses">
                    <span className="material-symbols-outlined shrink-0" data-icon="calendar_month">calendar_month</span>
                    {!collapsed && <span className="text-body-md font-body-md">Fixed Expenses</span>}
                </button>
                <button className={navLinkClasses('report')} onClick={() => handleNavigate('report')} title="Reports">
                    <span className="material-symbols-outlined shrink-0" data-icon="bar_chart">bar_chart</span>
                    {!collapsed && <span className="text-body-md font-body-md">Reports</span>}
                </button>
            </nav>

            {/* Bottom section */}
            <div className="mt-auto px-sm pt-md border-t border-outline-variant space-y-xs">
                <button className={navLinkClasses('settings')} onClick={() => handleNavigate('settings')} title="Settings">
                    <span className="material-symbols-outlined shrink-0" data-icon="settings">settings</span>
                    {!collapsed && <span className="text-body-md font-body-md">Settings</span>}
                </button>
                <button className={navLinkClasses('support')} onClick={() => handleNavigate('support')} title="Support">
                    <span className="material-symbols-outlined shrink-0" data-icon="help">help</span>
                    {!collapsed && <span className="text-body-md font-body-md">Support</span>}
                </button>

                {/* Collapse toggle - hidden on mobile */}
                <button
                    className="hidden md:flex items-center gap-md py-sm transition-colors pl-4 rounded-lg w-full text-left hover:bg-surface-container text-on-surface-variant"
                    onClick={toggleCollapsed}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className="material-symbols-outlined shrink-0">
                        {collapsed ? 'chevron_right' : 'chevron_left'}
                    </span>
                    {!collapsed && <span className="text-body-md font-body-md">Collapse</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className={`hidden md:fixed md:left-0 md:top-16 md:h-[calc(100vh-64px)] md:flex md:flex-col bg-surface shadow-md py-md transition-all duration-300 ${sidebarWidth}`}>
                {navContent}
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-[200]">
                    {/* Opaque backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={onMobileClose}
                    />
                    {/* Sidebar panel */}
                    <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-xl flex flex-col py-md animate-slide-in-left">
                        {/* Mobile close button */}
                        <div className="flex items-center justify-between px-lg mb-md mt-sm">
                            <div className="flex items-center gap-xs">
                                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-primary text-[20px]" data-icon="account_balance">account_balance</span>
                                </div>
                                <h1 className="text-headline-md font-headline-md font-bold text-on-surface">AccounterFlow</h1>
                            </div>
                            <button
                                className="p-xs text-on-surface-variant hover:text-primary transition-colors"
                                onClick={onMobileClose}
                            >
                                <span className="material-symbols-outlined" data-icon="close">close</span>
                            </button>
                        </div>
                        {navContent}
                    </aside>
                </div>
            )}
        </>
    )
}
