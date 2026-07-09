import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from './ErrorMessage';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, name);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error
          : 'Error al registrarse';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg p-10">
      <h2 className="text-3xl font-black text-center mb-8">Crear Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <div className="flex flex-col gap-2">
          <label className="text-xl" htmlFor="reg-name">Nombre</label>
          <input
            id="reg-name"
            type="text"
            className="bg-slate-100 p-2 border"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xl" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            className="bg-slate-100 p-2 border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xl" htmlFor="reg-password">Contraseña</label>
          <input
            id="reg-password"
            type="password"
            className="bg-slate-100 p-2 border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 w-full p-3 text-white uppercase font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p className="text-center mt-6 text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <button className="text-blue-600 underline font-semibold" onClick={onSwitchToLogin}>
          Iniciar Sesión
        </button>
      </p>
    </div>
  );
}
