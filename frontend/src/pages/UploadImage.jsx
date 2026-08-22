import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadImage = () => {
  const { user } = useContext(AuthContext);
  const [imgType, setImgType] = useState('MRI');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose an image file.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('imageType', imgType);

    try {
      await axios.post('/api/images/upload-encrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Image uploaded and encrypted successfully!');
      setTimeout(() => {
        navigate('/view-images');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
      
      {/* Card Teal with Brown Gradient */}
      <div className="card-teal p-8 sm:p-12 shadow-2xl animate-slide-up">
        
        <h2 className="text-xl font-bold text-center text-[#F5EBE0] tracking-wider mb-8">
          Upload Encrypted Medical Image
        </h2>

        {error && (
          <div className="mb-6 p-3 rounded bg-rose-900/40 border border-rose-500 text-rose-100 text-xs text-center animate-pulse">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-3 rounded bg-emerald-900/40 border border-emerald-500 text-emerald-100 text-xs text-center font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
          
          <div>
            <label className="block text-xs font-semibold text-[#DFCCB7] mb-1">
              Username:
            </label>
            <input
              type="text"
              readOnly
              value={user?.name || 'Sandeep'}
              className="w-full input-original bg-[#F5EBE0] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DFCCB7] mb-1">
              Email:
            </label>
            <input
              type="email"
              readOnly
              value={user?.email || 'sandeep@gmail.com'}
              className="w-full input-original bg-[#F5EBE0] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DFCCB7] mb-1">
              Image Type (e.g., MRI, X-Ray):
            </label>
            <select
              value={imgType}
              onChange={(e) => setImgType(e.target.value)}
              className="w-full input-original bg-[#F5EBE0] font-medium cursor-pointer"
            >
              <option value="MRI">MRI</option>
              <option value="CT">CT Scan</option>
              <option value="X-Ray">X-Ray</option>
              <option value="DICOM">DICOM Medical File</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#DFCCB7] mb-1">
              Upload Image:
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#1E0A00] rounded-lg border border-[#853E04]/50">
              <input
                type="file"
                id="medicalUploadInput"
                accept=".dcm,.png,.jpg,.jpeg,.bmp,.tif"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="medicalUploadInput"
                className="px-4 py-2 rounded bg-[#DFCCB7] hover:bg-[#F5EBE0] text-[#1E0A00] text-xs font-bold cursor-pointer transition transform hover:scale-105"
              >
                Choose File
              </label>
              <span className="text-xs text-[#DFCCB7] truncate">
                {selectedFile ? selectedFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="btn-blue px-10 py-2.5 text-xs font-bold shadow-lg transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Encrypting & Uploading...' : 'Submit'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default UploadImage;
