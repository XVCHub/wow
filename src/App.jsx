import React, { useState, useEffect } from 'react';
import { Upload, ImageIcon, Copy, Check } from 'lucide-react';

export default function App() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('https://upload-api.xvchubontop.workers.dev/list');
      const data = await res.json();
      setImages(data || []);
    } catch (err) {
      console.error('List error:', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('https://upload-api.xvchubontop.workers.dev/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.url) {
        setUploadedUrl(result.url);
        fetchImages();
      } else {
        setError('Upload failed: No URL returned');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-blue-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        egirlswow.pages.dev
      </h1>

      <label className="cursor-pointer bg-blue-700 hover:bg-blue-600 text-white px-6 py-4 rounded-lg flex items-center gap-3 transition-all">
        <Upload size={24} />
        {uploading ? 'Uploading...' : 'Upload Image'}
        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
      </label>

      {error && <p className="text-red-400 mt-3">{error}</p>}

      {uploadedUrl && (
        <div className="bg-zinc-900 border border-blue-700 p-4 rounded-lg mt-6 w-full max-w-lg text-center">
          <p className="text-blue-300 mb-2">your image url:</p>
          <div className="flex items-center gap-2 justify-center">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="bg-zinc-800 px-3 py-2 rounded text-sm w-full"
            />
            <button
              onClick={copyToClipboard}
              className="bg-blue-700 px-3 py-2 rounded text-white hover:bg-blue-600 transition"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 w-full max-w-5xl">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Recent Uploads</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.reverse().map((img, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-48 object-cover" />
                <div className="p-2 text-xs text-center truncate">{img.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-300">no uploads yet</p>
        )}
      </div>
    </div>
  );
}
