import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      
      {/* Welcome Banner matching Figure A.7 */}
      <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-8 sm:p-10 animate-slide-up">
        <h1 className="text-2xl font-bold text-[#1E0A00] tracking-wide mb-2">
          Welcome to Medplus Image Encryption System
        </h1>
        <p className="text-xs text-[#5C2800] font-semibold">
          Logged in as: <span className="text-[#1E0A00] font-bold">{user?.name}</span> ({user?.email})
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <Link
            to="/upload"
            className="card-teal p-6 text-center hover:scale-105 transition transform flex flex-col justify-center items-center shadow-lg group"
          >
            <div className="w-12 h-12 rounded-full bg-[#853E04]/40 flex items-center justify-center text-[#F5EBE0] text-xl font-bold mb-3 group-hover:rotate-12 transition">
              🔒
            </div>
            <h3 className="text-sm font-bold text-[#F5EBE0]">Image Encryption</h3>
            <p className="text-[11px] text-[#DFCCB7] mt-1 font-light">Upload & Encrypt Medical Scans</p>
          </Link>

          <Link
            to="/view-images"
            className="card-teal p-6 text-center hover:scale-105 transition transform flex flex-col justify-center items-center shadow-lg group"
          >
            <div className="w-12 h-12 rounded-full bg-[#853E04]/40 flex items-center justify-center text-[#F5EBE0] text-xl font-bold mb-3 group-hover:rotate-12 transition">
              🔓
            </div>
            <h3 className="text-sm font-bold text-[#F5EBE0]">View & Decrypt Images</h3>
            <p className="text-[11px] text-[#DFCCB7] mt-1 font-light">Decrypt & Download Datasets</p>
          </Link>

          <Link
            to="/profile"
            className="card-teal p-6 text-center hover:scale-105 transition transform flex flex-col justify-center items-center shadow-lg group"
          >
            <div className="w-12 h-12 rounded-full bg-[#853E04]/40 flex items-center justify-center text-[#F5EBE0] text-xl font-bold mb-3 group-hover:rotate-12 transition">
              👤
            </div>
            <h3 className="text-sm font-bold text-[#F5EBE0]">User Profile</h3>
            <p className="text-[11px] text-[#DFCCB7] mt-1 font-light">Manage Account Details</p>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
