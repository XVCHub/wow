import React, { useState, useEffect } from 'react';
import { Upload, Link2, ImageIcon, Copy, Check } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('home');
  const [customName, setCustomName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const keys = await window.storage.list('img:', true);
      if (keys && keys.keys) {
        const imagePromises = keys.keys.map(async (key) => {
          const result = await window.storage.get(key, true);
          return result ? JSON.parse(result.value) : null;
        });
        const loadedImages = await Promise.all(imagePromises);
        setImages(loadedImages.filter(img => img !== null));
      }
    } catch (error) {
      console.log('First load:', error);
      setImages([]);
    }
  };

  const generateRandomName = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateFileName = async () => {
    const randomChoice = Math.floor(Math.random() * 4) + 1;
    let fileName;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      if (randomChoice === 1) {
        fileName = generateRandomName(9);
      } else if (randomChoice === 2) {
        fileName = generateRandomName(10);
      } else if (randomChoice === 3) {
        const randomNum = Math.floor(Math.random() * 900) + 100;
        fileName = randomNum + generateRandomName(5);
      } else {
        fileName = generateRandomName(4) + generateRandomName(4);
      }
      
      attempts++;
      
      try {
        const exists = await window.storage.get(`img:${fileName}`, true);
        if (!exists) break;
      } catch {
        break;
      }
      
      if (attempts >= maxAttempts) {
        fileName = generateRandomName(10);
        break;
      }
    } while (true);

    return fileName;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      
      let fileName;
      if (useCustomName && customName.trim()) {
        fileName = customName.trim();
        try {
          const exists = await window.storage.get(`img:${fileName}`, true);
          if (exists) {
            alert('This name is already taken! Generating random name...');
            fileName = await generateFileName();
          }
        } catch {
          // Name available
        }
      } else {
        fileName = await generateFileName();
      }

      const extension = file.name.split('.').pop();
      const fullFileName = `${fileName}.${extension}`;
      const url = `https://egirlswow.pages.dev/👅/${fullFileName}`;

      const imageData = {
        fileName: fullFileName,
        url: url,
        data: base64,
        size: (file.size / 1024).toFixed(2),
        uploadedBy: 'Anonymous',
        date: new Date().toISOString()
      };

      try {
        await window.storage.set(`img:${fileName}`, JSON.stringify(imageData), true);
        setUploadedImage(imageData);
        setUploadedUrl(url);
        await loadImages();
      } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading image!');
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewImage = (image) => {
    setCurrentImage(image);
    setView('view');
  };

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-zinc-950 text-blue-100 font-sans">
        <main className="flex flex-col justify-center min-h-screen p-4">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                egirlswow.pages.dev
              </h1>
              <p className="text-xl text-blue-300">Free Image Upload & Sharing</p>
            </div>

            <div className="bg-zinc-900 border-2 border-zinc-800 hover:border-blue-700 duration-500 rounded-lg p-8 mb-8">
              <button
                onClick={() => setView('upload')}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-6 px-8 rounded-lg flex items-center justify-center gap-3 text-xl transition-all duration-300 active:translate-y-1"
              >
                <Upload size={28} />
                Upload Image
              </button>
            </div>

            {images.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-blue-300">Recently Uploaded</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.slice(-12).reverse().map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => viewImage(img)}
                      className="bg-zinc-900 border-2 border-zinc-800 hover:border-blue-700 duration-300 rounded-lg p-4 cursor-pointer transition-all hover:scale-105"
                    >
                      <img
                        src={img.data}
                        alt={img.fileName}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <p className="text-sm font-semibold truncate">{img.fileName}</p>
                      <p className="text-xs text-blue-400">{img.size} KiB</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-zinc-950 text-blue-100 font-sans">
        <main className="flex flex-col justify-center min-h-screen p-4">
          <div className="max-w-2xl mx-auto w-full">
            <button
              onClick={() => setView('home')}
              className="mb-6 text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Home
            </button>

            {!uploadedImage ? (
              <div className="bg-zinc-900 border-2 border-zinc-800 rounded-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">Upload Image</h2>
                
                <div className="mb-6">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomName}
                      onChange={(e) => setUseCustomName(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-blue-300">Use custom name</span>
                  </label>
                  
                  {useCustomName && (
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Filename (without extension)"
                      className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-lg px-4 py-3 text-blue-100 placeholder-blue-400 focus:border-blue-600 outline-none"
                    />
                  )}
                </div>

                <label className="block w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-8 px-6 rounded-lg cursor-pointer text-center transition-all duration-300 hover:scale-105">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <ImageIcon size={48} className="mx-auto mb-3" />
                  <span className="text-xl">Choose Image</span>
                  <p className="text-sm mt-2 text-blue-200">PNG, JPG, GIF, WebP</p>
                </label>

                <p className="text-sm text-blue-400 mt-4 text-center">
                  {useCustomName ? 'Custom name will be used' : 'Random name will be generated'}
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900 border-2 border-blue-700 rounded-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">Uploaded! ✓</h2>
                
                <img
                  src={uploadedImage.data}
                  alt={uploadedImage.fileName}
                  className="w-full max-h-96 object-contain rounded-lg mb-6"
                />

                <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-400 mb-2">Here's your link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={uploadedUrl}
                      readOnly
                      className="flex-1 bg-zinc-700 border-2 border-zinc-600 rounded px-3 py-2 text-blue-100 text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedUrl('');
                      setCustomName('');
                    }}
                    className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => setView('home')}
                    className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'view' && currentImage) {
    return (
      <div className="min-h-screen bg-zinc-950 text-blue-100 font-sans">
        <main className="flex flex-col justify-center min-h-screen p-4">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-zinc-900 border-2 border-zinc-800 hover:border-blue-700 duration-500 rounded-lg p-8">
              <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                <h1 className="text-2xl font-semibold text-blue-100">{currentImage.fileName}</h1>
                <h2 className="text-xl font-medium text-blue-300">{currentImage.size} KiB</h2>
              </div>

              <img
                src={currentImage.data}
                alt={currentImage.fileName}
                className="rounded-lg max-h-[38rem] max-w-full mx-auto"
              />

              <p className="text-xl font-semibold text-blue-100 mt-6 text-center">
                Uploaded By {currentImage.uploadedBy}
              </p>
            </div>

            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <a
                href={currentImage.data}
                download={currentImage.fileName}
                className="bg-zinc-900 border-2 border-zinc-800 hover:border-blue-700 duration-500 text-blue-100 font-semibold px-6 py-3 rounded-lg transition-all active:translate-y-1"
              >
                View Raw
              </a>
              <button
                onClick={() => setView('home')}
                className="bg-zinc-900 border-2 border-zinc-800 hover:border-blue-700 duration-500 text-blue-100 font-semibold px-6 py-3 rounded-lg transition-all active:translate-y-1"
              >
                Home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
