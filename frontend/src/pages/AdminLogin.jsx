import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('Account authenticated is not an administrator.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const fillAdmin = () => {
    setEmail('admin@medicalsec.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#C8AD8D] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#F5EBE0] rounded-xl shadow-2xl overflow-hidden border border-[#C4A482] animate-slide-up">
        
        <div className="p-8 sm:p-12">
          <h2 className="text-xl font-bold text-center text-[#1E0A00] tracking-wider mb-8">
            ADMIN LOGIN
          </h2>

          {error && (
            <div className="mb-6 p-3 rounded bg-rose-100 border border-rose-300 text-rose-800 text-xs text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medicalsec.com"
                className="w-full input-original font-mono"
              />
              <p className="text-right text-[11px] text-[#5C2800] mt-1 font-medium">Admin Email</p>
            </div>

            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full input-original font-mono"
              />
              <p className="text-right text-[11px] text-[#5C2800] mt-1 font-medium">Password</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#5C2800] hover:underline cursor-pointer">
                Forgot password?
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2 rounded bg-[#DFCCB7] hover:bg-[#C8AD8D] text-[#1E0A00] text-xs font-semibold transition"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-yellow px-8 py-2 text-xs transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Login'}
                </button>
              </div>
            </div>

          </form>

          <div className="mt-8 pt-4 border-t border-[#DFCCB7] text-center">
            <button onClick={fillAdmin} className="text-xs font-mono text-[#853E04] hover:underline font-bold">
              Demo Admin Credentials: admin@medicalsec.com / admin123
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
