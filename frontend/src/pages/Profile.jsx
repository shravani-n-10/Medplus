import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Breadcrumb matching Figure A.8 */}
      <div className="text-xs text-[#5C2800] font-medium">
        <Link to="/dashboard" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span>User</span>
        <span className="mx-2">/</span>
        <span className="text-[#1E0A00] font-bold">User Profile</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        
        {/* Left Avatar Card matching Figure A.8 */}
        <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-[#1E0A00] border-4 border-[#C4A482] overflow-hidden flex items-center justify-center text-[#F5EBE0] text-3xl font-bold shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h3 className="text-lg font-bold text-[#1E0A00]">{user.name}</h3>

          <button className="btn-blue text-xs font-semibold px-6 py-2 transition transform hover:scale-105">
            Edit Profile
          </button>
        </div>

        {/* Right Details Table matching Figure A.8 */}
        <div className="md:col-span-2 bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-6">
          <div className="divide-y divide-[#DFCCB7] text-xs text-[#1E0A00] font-medium">
            
            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Full Name</span>
              <span className="col-span-2 text-[#1E0A00] font-bold">{user.name}</span>
            </div>

            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Email</span>
              <span className="col-span-2 text-[#1E0A00] font-bold">{user.email}</span>
            </div>

            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Phone</span>
              <span className="col-span-2 text-[#1E0A00] font-bold">{user.mobile || '9856325689'}</span>
            </div>

            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Address</span>
              <span className="col-span-2 text-[#1E0A00] font-bold">{user.address || 'bangalore'}</span>
            </div>

            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Created At</span>
              <span className="col-span-2 text-[#1E0A00] font-bold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Sept. 30, 2024'}
              </span>
            </div>

            <div className="py-4.5 grid grid-cols-3 items-center">
              <span className="text-[#5C2800]">Account Status</span>
              <span className="col-span-2 uppercase text-[#2E7D46] font-bold">{user.status}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
