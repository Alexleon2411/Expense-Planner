import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
  const { login, register } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      console.log('Error during login:', err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error
          : 'Error al iniciar sesión';
      setLoginError(msg);
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSubmitting(true);
    try {
      await register(regEmail, regPassword, `${firstName} ${lastName}`.trim());
    } catch (err: unknown) {
      console.log('Registration error:', err);
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error
          : 'Error al registrarse';
      setRegError(msg);
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden bg-background  text-on-background ">
      {/* Left Side: Branding */}
      <section className="hidden lg:flex lg:w-1/2 relative items-center justify-center  overflow-hidden p-7"
        style={{ background: 'linear-gradient(135deg, #0b1c30 0%, #1e293b 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-[500px] round-secondary-fixed blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary-fixed-dim blur-[100px]"></div>
        </div>
         
        <div className="relative z-10 w-full max-w-xl">
          {/* Logo & Name */}
          <div className="mb-5">
            <span className="font-headline-lg flex items-center gap-2">
              <span className="material-symbols-outlined  text-secondary-fixed text-4xl">account_balance_wallet</span>
              <span className='text-cyan-50'>AccounterFlow</span>
            </span>
          </div>
          {/* Paragraph */}
          <div className="my-5">
            <h1 className="mb-5  text-white">
              Master your capital with <span className="text-emerald-400">precision-grade</span> analytics.
            </h1>
            <p className="text-slate-500 font-sans opacity-75">
              Experience the next generation of financial management. Centralized controls, real-time insights, and institutional-grade security for your assets.
            </p>
          </div>
          {/* centered squared's */}
          <div className="my-5 grid grid-flow-col gap-4">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-lg border border-white/10 btn-highlight-glow">
              <p className="font-body-sm text-white/60 mb-2 uppercase tracking-wider text-sm font-semibold">MONTHLY GROWTH</p>
              <p className="font-data-mono text-headline-md text-secondary-fixed">+14.2%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5  rounded-xl border border-white/10 btn-highlight-glow">
              <p className="font-body-sm text-white/60 mb-2 uppercase  tracking-wider text-sm font-semibold">ACTIVE ACCOUNTS</p>
              <p className="font-data-mono text-headline-md text-white">2,841</p>
            </div>
          </div>
          {/* image */}
          <div className="mt-5 rounded-xl overflow-hidden shadow-2xl border border-white/20 sm:display-none">
            <img
              alt="Financial Data Dashboard"
              className="w-full h-64 object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2xe9cP-qrWZ9SBIVVfUb8fr2-m3E8mjaV6ygQWGP8nVSmrBTRCyugxNTxhwWp7t0IiFk63ZVmLg5uAcQjzabVGvfImw752wymOajStIdp5txhJd6iBW27VHY0Jrq0XxX_XdWC3k8e659xu2IpAjUxqdxIFxU_qUrceEaMZ8DdNsVuehCDV9fAl0_7WSC0LaJBXW9Th-Rz0kuFUiXrj8mP4ZTkyoBmykWLWtvlTHxSbq2NnfIEyaWsTnzyTlMll_L9dP-SzQNywKc"
            />
          </div>
        </div>
      </section>

      {/* Right Side: Forms */}
      <section className="w-screen lg:w-1/2 flex items-center justify-center bg-surface p-5">
      <img src="/17062026_img-header-bg.svg" className="img-fluid img-header-bg"/>
        <div className="w-full max-w-md bg-surface-container-lowest p-5 rounded-xl bento-card border border-outline-variant/30">
          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b-2 border-outline-variant">
            <button
              className={` pb-2 font-label-caps transition-all ${
                activeTab === 'login'
                  ? 'text-slate-950 border-b-2 border-slate-950'
                  : 'text-slate-500 hover:text-primary'
              }`}
              onClick={() => setActiveTab('login')}
            >
              LOGIN
            </button>
            <button
              className={`pb-2 font-label-caps transition-all ${
                activeTab === 'register'
                  ? 'text-primary border-b-2 border-slate-950'
                  : 'text-slate-500 hover:text-primary'
              }`}
              onClick={() => setActiveTab('register')}
            >
              REGISTER
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <div>
              <header className="my-5">
                <h2 className="font-headline-md text-slate-600 mb-xs">Welcome Back</h2>
                <p className="font-body-sm text-slate-600 ">Enter your credentials to access your dashboard.</p>
              </header>

              {loginError && (
                <div className="mb-md p-sm rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                  {loginError}
                </div>
              )}
                {/* EMAIL */}
              <form className="space-y-ms" onSubmit={handleLogin}>
                <div className="space-y-1">
                  <label className=" text-on-surface-variant text-sm" htmlFor="email">EMAIL ADDRESS</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                  {/* CONTRASENA */}
                <div className="space-y-1 mt-4">
                  <label className="font-label-caps text-on-surface-variant text-sm" htmlFor="password">PASSWORD</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div >

                <div className='flex items-center gap-1 my-4'>
                  <input type="checkbox" className='w-4 h-4 rounded border-outline-variant text-slate-900 focus:ring-black' id='remember'/> 
                  <label htmlFor="remember">Stay signedn in for 30 days </label></div>

                <button
                  type="submit"
                  disabled={loginSubmitting}
                  className="w-full bg-slate-900 text-slate-100 py-2 rounded-lg font-800  hover:bg-on-surface transition-colors shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {loginSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <div>
              <header className="mb-lg">
                <h2 className="font-headline-md text-on-surface mb-2">Create Account</h2>
                <p className="text-xs text-on-surface-variant">Join 10k+ professionals managing their wealth.</p>
              </header>

              {regError && (
                <div className="mb-4 p-2 rounded-lg bg-error-container text-on-error-container text-sm font-medium">
                  {regError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <label className="font-label-caps text-on-surface-variant text-sm " htmlFor="fname">FIRST NAME</label>
                    <input
                      id="fname"
                      type="text"
                      placeholder="Jane"
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-caps text-on-surface-variant text-sm" htmlFor="lname">LAST NAME</label>
                    <input
                      id="lname"
                      type="text"
                      placeholder="Doe"
                      className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-on-surface-variant text-sm" htmlFor="reg-email">EMAIL ADDRESS</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="name@company.com"
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-on-surface-variant text-sm" htmlFor="reg-password">SET PASSWORD</label>
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-slate-100 focus:outline-offset-4 focus:border-none form-input transition-all"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <p className="font-body-sm text-on-surface-variant leading-tight">
                  By registering, you agree to our{' '}
                  <a className="text-secondary underline" href="#">Terms of Service</a> and{' '}
                  <a className="text-secondary underline" href="#">Privacy Policy</a>.
                </p>

                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full bg-slate-900 text-slate-100 py-2 rounded-lg text-base font-800 hover:bg-on-surface transition-colors shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {regSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          )}

          {/* Social Logins */}
          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <span className="relative px-8 bg-white font-label-caps text-slate-950 text-sm">
                OR CONTINUE WITH
              </span>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg border border-outline-variant bg-white hover:bg-surface-container transition-colors shadow-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-body-sm font-medium">Google</span>
              </button>
              {/* <button
                type="button"
                className="flex items-center justify-center gap-1 px-2 py-3 rounded-lg border border-outline-variant bg-white hover:bg-surface-container transition-colors shadow-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4-6.7-6.81-1.98-15.65 4.34-15.65 1.44.02 2.37.5 3.19.49.82-.01 2.25-.6 3.73.1 1.27.59 2.23 1.61 2.74 3.05-2.93 1.25-2.45 5.31.54 6.54-.6 1.55-1.41 3.07-2.16 4.07-.63.84-1.28 1.67-2.03 1.66-.75-.01-1-.47-2.03-.46zM12.03 7.25c-.02-2.23 1.83-4.11 4.05-4.14.26 2.45-2.15 4.41-4.05 4.14z" />
                </svg>
                <span className="font-body-sm font-medium">Apple</span>
              </button> */}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-md grayscale opacity-40">
            <span className="font-label-caps text-base">MOBILE APP COMING SOON</span>
          </div>
        </div>
      </section>
    </div>
  );
}
