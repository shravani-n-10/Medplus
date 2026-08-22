import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-60px)] relative bg-[#1E0A00] overflow-hidden flex flex-col justify-center items-center text-center p-6 animate-fade-in">
      
      {/* Background Cyber-Medical Mesh with Rich Brown Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5C2800]/40 via-[#2E1200] to-[#1E0A00] pointer-events-none"></div>
      
      {/* Floating Animated Ambient Nodes */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#853E04]/20 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#C27803]/15 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 animate-slide-up">
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-bold font-mono tracking-[0.25em] text-[#C27803] uppercase">
          MEDPLUS MEDICAL IMAGE ENCRYPTION
        </p>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#F5EBE0] tracking-tight leading-tight drop-shadow-md">
          Through Chaotic<br className="hidden sm:inline" /> Asymmetric Cryptosystem
        </h1>

        <p className="text-xs sm:text-sm text-[#DFCCB7]/90 max-w-xl mx-auto font-light leading-relaxed">
          Medplus security portal integrating Logistic Map chaotic sequences, ECDH NIST P-256 key agreement, and genuine Blum-Goldwasser probabilistic encryption for DICOM, MRI, CT & X-Ray scans.
        </p>

        {/* Centered Login CTA Button */}
        <div className="pt-6">
          <Link
            to="/login"
            className="inline-block px-10 py-3.5 rounded-full bg-[#853E04] hover:bg-[#A34C06] text-[#F5EBE0] font-bold text-sm shadow-xl shadow-[#853E04]/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            Login
          </Link>
        </div>

      </div>

    </div>
  );
};

export default HomePage;
