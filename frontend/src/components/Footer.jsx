import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#1E0A00] text-[#DFCCB7] border-t-2 border-[#2E1200] pt-8 pb-6 px-4 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-xs">
        
        {/* Brand Column */}
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="logo-icon flex items-center justify-center border border-[#F5EBE0] text-[#F5EBE0] font-bold text-xs w-5 h-5 mr-2">
              ✕
            </div>
            <span className="font-bold text-base text-[#F5EBE0] tracking-wide">Medplus</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#DFCCB7]/80">
            Advanced Medical Image Encryption System utilizing Logistic Map Chaotic Permutation, ECDH NIST P-256, and Genuine Blum-Goldwasser Cryptosystem (BGC).
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div>
          <h4 className="font-bold text-[#C27803] uppercase tracking-wider text-[11px] mb-3">
            Navigation
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link to="/dashboard" className="hover:text-[#F5EBE0] transition">Home</Link>
            </li>
            <li>
              <Link to="/upload" className="hover:text-[#F5EBE0] transition">Image Encryption</Link>
            </li>
            <li>
              <Link to="/view-images" className="hover:text-[#F5EBE0] transition">View & Decrypt Images</Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-[#F5EBE0] transition">User Profile</Link>
            </li>
          </ul>
        </div>

        {/* Security & Cryptography Info */}
        <div>
          <h4 className="font-bold text-[#C27803] uppercase tracking-wider text-[11px] mb-3">
            Security Protocols
          </h4>
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2.5 py-1 rounded bg-[#2E1200] border border-[#853E04]/50 text-[#F5EBE0] font-mono">
              BGC (Blum-Goldwasser)
            </span>
            <span className="px-2.5 py-1 rounded bg-[#2E1200] border border-[#853E04]/50 text-[#F5EBE0] font-mono">
              ECDH NIST P-256
            </span>
            <span className="px-2.5 py-1 rounded bg-[#2E1200] border border-[#853E04]/50 text-[#F5EBE0] font-mono">
              Logistic Map Chaotic
            </span>
            <span className="px-2.5 py-1 rounded bg-[#2E1200] border border-[#853E04]/50 text-[#F5EBE0] font-mono">
              SHA-256 HKDF
            </span>
          </div>
        </div>

      </div>

      {/* Copyright & Disclaimer Bar */}
      <div className="max-w-7xl mx-auto pt-4 border-t border-[#4A1E00] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#DFCCB7]/70 gap-2">
        <p>© 2026 Medplus Medical Image Security System. All rights reserved.</p>
        <p className="font-mono text-[10px] text-[#C27803]">Powered by MERN Stack & BGC Engine</p>
      </div>
    </footer>
  );
};

export default Footer;
