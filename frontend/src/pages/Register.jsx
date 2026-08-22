import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: ''
  });
  const [profileFile, setProfileFile] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await register(formData);
      setSuccessMsg(res.message || 'Registration successful! Please log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#C8AD8D] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-[#F5EBE0] rounded-xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#C4A482] animate-slide-up">
        
        {/* Left Side Banner Image with Espresso & Copper Theme */}
        <div className="bg-gradient-to-br from-[#4A1E00] to-[#1E0A00] p-8 text-[#F5EBE0] flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="w-48 h-48 rounded-2xl bg-[#853E04]/20 flex items-center justify-center mb-6 shadow-inner border border-[#853E04]/40 animate-float">
            <svg className="w-24 h-24 text-[#C27803]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-wide">Medplus Image Security</h3>
          <p className="text-xs text-[#DFCCB7] mt-2 font-light max-w-xs">
            Chaotic Asymmetric Cryptosystem Portal
          </p>
        </div>

        {/* Right Side Form Container */}
        <div className="p-8 sm:p-10">
          <h2 className="text-lg font-bold text-center text-[#1E0A00] tracking-wider mb-6">
            USER REGISTRATION FORM
          </h2>

          {error && (
            <div className="mb-4 p-2.5 rounded bg-rose-100 border border-rose-300 text-rose-800 text-xs text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-2.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs text-center font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="sandeep"
                className="w-full input-original"
              />
              <p className="text-right text-[10px] text-[#5C2800] mt-0.5 font-medium">Name</p>
            </div>

            <div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="sandeep@gmail.com"
                className="w-full input-original"
              />
              <p className="text-right text-[10px] text-[#5C2800] mt-0.5 font-medium">Email</p>
            </div>

            <div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full input-original"
              />
              <p className="text-right text-[10px] text-[#5C2800] mt-0.5 font-medium">Password</p>
            </div>

            <div>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9856325689"
                className="w-full input-original"
              />
              <p className="text-right text-[10px] text-[#5C2800] mt-0.5 font-medium">Mobile</p>
            </div>

            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="bangalore"
                className="w-full input-original"
              />
              <p className="text-right text-[10px] text-[#5C2800] mt-0.5 font-medium">Address</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="file"
                id="profileFileInput"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="profileFileInput"
                className="px-3 py-1.5 rounded bg-[#DFCCB7] hover:bg-[#C8AD8D] text-[#1E0A00] text-xs font-semibold cursor-pointer border border-[#C4A482] transition"
              >
                Choose File
              </label>
              <span className="text-xs text-[#5C2800] truncate max-w-[150px]">
                {profileFile ? profileFile.name : 'No file chosen'}
              </span>
            </div>
            <p className="text-right text-[10px] text-[#5C2800] font-medium">Profile</p>

            <div className="pt-2 text-center">
              <button
                type="submit"
                disabled={loading}
                className="btn-blue w-full py-2.5 text-xs font-bold transition-all transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-xs text-[#5C2800] hover:text-[#1E0A00] font-medium underline">
              Already have an account? Click here...
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
