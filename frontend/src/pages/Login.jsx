import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  const fillUser = () => {
    setEmail('sandeep@gmail.com');
    setPassword('password123');
  };

  const fillAdmin = () => {
    setEmail('admin@medicalsec.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#C8AD8D] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#F5EBE0] rounded-xl shadow-2xl overflow-hidden border border-[#C4A482] animate-slide-up">
        
        {/* Card Main Area */}
        <div className="p-8 sm:p-12">
          <h2 className="text-xl font-bold text-center text-[#1E0A00] tracking-wider mb-8">
            USER LOGIN
          </h2>

          {error && (
            <div className="mb-6 p-3 rounded bg-rose-100 border border-rose-300 text-rose-800 text-xs text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            
            {/* Email Field */}
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full input-original"
              />
              <p className="text-right text-[11px] text-[#5C2800] mt-1 font-medium">Email</p>
            </div>

            {/* Password Field */}
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full input-original"
              />
              <p className="text-right text-[11px] text-[#5C2800] mt-1 font-medium">Password</p>
            </div>

            {/* Forgot password link & Action buttons */}
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
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>

            {/* Don't have an account link */}
            <div className="text-center pt-4">
              <Link to="/register" className="text-xs text-[#5C2800] hover:text-[#1E0A00] font-medium underline">
                Don't have an account? Click here...
              </Link>
            </div>

            {/* Registration status banner */}
            <div className="p-3 rounded bg-[#E8D5C4] border border-[#C4A482] text-[#4A1E00] text-xs text-center font-semibold">
              Registration successful! Please log in.
            </div>

          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-4 border-t border-[#DFCCB7] flex justify-center gap-4 text-xs font-mono">
            <button onClick={fillUser} className="text-[#853E04] hover:underline font-bold">
              Demo User: sandeep@gmail.com
            </button>
            <button onClick={fillAdmin} className="text-[#5C2800] hover:underline font-bold">
              Demo Admin: admin@medicalsec.com
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
