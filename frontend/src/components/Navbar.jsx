import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar-original px-4 lg:px-12 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Medplus Brand Logo: ☒ Medplus */}
          <Link to="/" className="flex items-center group">
            <div className="logo-icon flex items-center justify-center border border-[#F5EBE0] text-[#F5EBE0] font-bold text-xs w-5 h-5 mr-2">
              ✕
            </div>
            <span className="font-bold text-lg text-[#F5EBE0] tracking-wide">Medplus</span>
          </Link>

          {/* Center/Right Primary Navigation Links */}
          <div className="flex items-center gap-6 text-xs font-medium text-[#DFCCB7]">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`hover:text-white transition ${isActive('/dashboard') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  Home
                </Link>
                
                <Link
                  to="/upload"
                  className={`hover:text-white transition ${isActive('/upload') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  Image Encryption
                </Link>

                <Link
                  to="/view-images"
                  className={`hover:text-white transition ${isActive('/view-images') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  View Images
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`hover:text-[#C27803] text-[#C27803] font-semibold transition ${isActive('/admin') ? 'underline underline-offset-4' : ''}`}
                  >
                    Admin Panel
                  </Link>
                )}

                {/* 3-Dots Dropdown Button (⋮) */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-1.5 rounded-full hover:bg-[#2E1200] text-[#F5EBE0] transition focus:outline-none flex items-center justify-center w-8 h-8"
                    title="Account & Menu options"
                  >
                    <span className="text-xl font-bold leading-none">⋮</span>
                  </button>

                  {/* 3-Dots Dropdown Menu */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2E1200] border border-[#853E04]/60 rounded-xl shadow-2xl py-2 z-50 animate-slide-up text-xs">
                      
                      {/* User Info Header */}
                      <div className="px-4 py-2 border-b border-[#4A1E00] text-[11px] text-[#DFCCB7]">
                        Signed in as <span className="font-bold text-[#F5EBE0] block truncate">{user.name}</span>
                      </div>

                      {/* User Profile Link */}
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-4 py-2.5 text-[#F5EBE0] hover:bg-[#4A1E00] transition"
                      >
                        <span className="mr-2.5 text-base">👤</span> User Profile
                      </Link>

                      {/* About Option */}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setAboutOpen(true);
                        }}
                        className="w-full text-left flex items-center px-4 py-2.5 text-[#F5EBE0] hover:bg-[#4A1E00] transition"
                      >
                        <span className="mr-2.5 text-base">ℹ️</span> About Medplus
                      </button>

                      <div className="border-t border-[#4A1E00] my-1"></div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2.5 text-rose-300 hover:bg-[#4A1E00] transition font-semibold"
                      >
                        <span className="mr-2.5 text-base">🚪</span> Logout
                      </button>

                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`hover:text-white transition ${isActive('/') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  Home
                </Link>
                
                {/* About for Guest */}
                <button
                  onClick={() => setAboutOpen(true)}
                  className="hover:text-white transition text-[#DFCCB7]"
                >
                  About
                </button>

                <Link
                  to="/admin-login"
                  className={`hover:text-white transition ${isActive('/admin-login') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  Admin Login
                </Link>
                <Link
                  to="/login"
                  className={`hover:text-white transition font-semibold ${isActive('/login') ? 'text-white font-bold underline underline-offset-4' : ''}`}
                >
                  User Login
                </Link>
                <Link
                  to="/register"
                  className={`hover:text-[#C27803] transition text-[#C27803] font-semibold ${isActive('/register') ? 'underline underline-offset-4' : ''}`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* About Medplus Modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card-teal max-w-xl w-full p-8 relative shadow-2xl animate-slide-up border border-[#853E04]/60 text-left">
            
            <button
              onClick={() => setAboutOpen(false)}
              className="absolute top-4 right-4 text-[#F5EBE0] hover:text-[#DFCCB7] font-bold text-xl"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="logo-icon flex items-center justify-center border border-[#F5EBE0] text-[#F5EBE0] font-bold text-sm w-7 h-7">
                ✕
              </div>
              <h2 className="text-xl font-bold text-[#F5EBE0] tracking-wide">About Medplus System</h2>
            </div>

            <p className="text-xs text-[#DFCCB7] leading-relaxed mb-4">
              <strong className="text-[#F5EBE0]">Medplus</strong> is an advanced medical image security platform engineered for confidential healthcare data storage and transmission.
            </p>

            <div className="space-y-3 text-xs text-[#DFCCB7] bg-[#1E0A00] p-4 rounded-xl border border-[#853E04]/40 mb-6">
              <h4 className="font-bold text-[#C27803] uppercase tracking-wider text-[11px]">Core Cryptographic Engine:</h4>
              <ul className="list-disc list-inside space-y-1.5 font-light">
                <li><strong className="text-[#F5EBE0]">Logistic Map Chaotic System:</strong> Non-periodic pixel permutation key stream generation.</li>
                <li><strong className="text-[#F5EBE0]">ECDH NIST P-256:</strong> Elliptic Curve Diffie-Hellman asymmetric key agreement.</li>
                <li><strong className="text-[#F5EBE0]">Genuine Blum-Goldwasser Cryptosystem (BGC):</strong> Probabilistic LSB stream encryption with BigInt CRT exponentiation decryption.</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setAboutOpen(false)}
                className="btn-blue text-xs font-bold px-6 py-2"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
