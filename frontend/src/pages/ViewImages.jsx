import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ViewImages = () => {
  const { user } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/images/my-images');
      setImages(res.data.images);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (image) => {
    setSelectedImage(image);
    setDecrypting(true);
    setDecryptedData(null);

    try {
      const res = await axios.post(`/api/images/${image._id}/decrypt`);
      setDecryptedData(res.data);
      fetchImages();
    } catch (err) {
      alert('Decryption failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setDecrypting(false);
    }
  };

  const handleDownload = async (imageId, filename) => {
    try {
      const res = await axios.get(`/api/images/${imageId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Download failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Decrypt & Download View Modal (Matching Figure A.11) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="card-teal max-w-2xl w-full p-8 relative shadow-2xl animate-slide-up border border-[#853E04]/60">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-[#F5EBE0] hover:text-[#DFCCB7] font-bold text-xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-center text-[#F5EBE0] tracking-wider mb-6">
              Decrypt Medical Image
            </h2>

            {/* Soft Green Decrypted Banner */}
            {decryptedData && (
              <div className="mb-6 p-3 rounded bg-[#C6E6D2] border border-[#A2D4B5] text-[#1E5235] text-xs font-semibold text-center animate-bounce-short">
                Image decrypted successfully
              </div>
            )}

            {decrypting ? (
              <div className="py-12 text-center text-[#C27803] font-medium text-xs animate-pulse">
                Decrypting Medical Image using ECC P-256 + Genuine BGC Cryptosystem...
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Encrypted Image Textbox */}
                <div>
                  <label className="block text-xs font-semibold text-[#DFCCB7] mb-2">
                    Encrypted Image:
                  </label>
                  <textarea
                    readOnly
                    rows={4}
                    value={decryptedData ? decryptedData.encryptedData : selectedImage.encryptedHash || 'WCGrzw=='}
                    className="w-full input-original bg-[#F5EBE0] text-xs font-mono text-[#1E0A00] focus:outline-none"
                  />
                </div>

                {/* Restored Decrypted Image Preview */}
                {decryptedData && (
                  <div className="p-4 bg-[#1E0A00] rounded-lg text-center border border-[#853E04]/40">
                    <p className="text-xs text-[#C27803] font-semibold mb-2 font-mono">
                      Decrypted Output Preview ({decryptedData.durationMs} ms)
                    </p>
                    <div className="max-h-48 flex items-center justify-center overflow-hidden">
                      <img
                        src={decryptedData.decryptedData}
                        alt="Decrypted Medical"
                        className="max-h-48 object-contain rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%232E7D46" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={() => handleDecrypt(selectedImage)}
                    className="btn-blue text-xs px-6 py-2.5 font-bold shadow transition transform hover:scale-105"
                  >
                    Decrypt Image
                  </button>

                  <button
                    onClick={() => handleDownload(selectedImage._id, selectedImage.originalFileName)}
                    className="btn-green text-xs px-6 py-2.5 font-bold shadow transition transform hover:scale-105"
                  >
                    Download Image
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-6 animate-slide-up">
        
        <h3 className="text-lg font-bold text-[#1E0A00] mb-4">
          Encrypted Medical Images Directory
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#5C2800] font-mono animate-pulse">
            Loading encrypted datasets...
          </div>
        ) : images.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5C2800] font-mono">
            No medical images uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1E0A00]">
              <thead className="bg-[#DFCCB7] uppercase text-[10px] text-[#5C2800] font-semibold border-b border-[#C4A482]">
                <tr>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Recipient Public Key</th>
                  <th className="p-3">Uploaded At</th>
                  <th className="p-3 text-right">Decrypt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFCCB7]">
                {images.map((img) => (
                  <tr key={img._id} className="hover:bg-[#E8D5C4] transition">
                    <td className="p-3 font-semibold text-[#1E0A00]">
                      {img.originalFileName}
                      <span className="block text-[10px] text-[#5C2800] font-normal font-mono">
                        Type: {img.imageType} | Size: {(img.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <div className="p-2 bg-[#DFCCB7] rounded border border-[#C4A482] font-mono text-[10px] text-[#2E1200] max-h-16 overflow-hidden">
                        -----BEGIN PUBLIC KEY-----<br />
                        {img.recipientPublicKey ? img.recipientPublicKey.slice(0, 50) : 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEB4f...'}
                        <br />-----END PUBLIC KEY-----
                      </div>
                    </td>

                    <td className="p-3 font-mono text-[#5C2800]">
                      {new Date(img.createdAt).toISOString().replace('T', ' ').slice(0, 19)}Z
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDecrypt(img)}
                        className="btn-green text-xs px-4 py-1.5 font-bold shadow-sm transition transform hover:scale-105"
                      >
                        Decrypt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        <div className="mt-6 pt-4 border-t border-[#DFCCB7] flex items-center gap-2 text-xs text-[#5C2800]">
          <span className="px-2 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">« first</span>
          <span className="px-2 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">previous</span>
          <span className="px-3 py-1 bg-[#853E04] text-[#F5EBE0] font-bold rounded">1</span>
          <span className="px-2.5 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">2</span>
          <span className="px-2.5 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">3</span>
          <span className="px-2.5 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">4</span>
          <span className="px-2 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">next</span>
          <span className="px-2 py-1 bg-[#DFCCB7] border border-[#C4A482] rounded cursor-pointer hover:bg-[#C8AD8D]">last »</span>
        </div>

      </div>

    </div>
  );
};

export default ViewImages;
