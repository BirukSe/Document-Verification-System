import React, { useEffect, useRef, useState } from 'react';

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dropArea = dropAreaRef.current;

    if (dropArea) {
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        dropArea.classList.add('border-green-500');
      };

      const handleDragLeave = () => {
        dropArea.classList.remove('border-green-500');
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        dropArea.classList.remove('border-green-500');
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          setFile(files[0]);
        }
      };

      dropArea.addEventListener('dragover', handleDragOver);
      dropArea.addEventListener('dragleave', handleDragLeave);
      dropArea.addEventListener('drop', handleDrop);

      return () => {
        dropArea.removeEventListener('dragover', handleDragOver);
        dropArea.removeEventListener('dragleave', handleDragLeave);
        dropArea.removeEventListener('drop', handleDrop);
      };
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setResponseData(data);
      console.log('Upload success:', data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full headColor rounded pacifico-regular text-white py-4 text-center">
        <h1 className="text-4xl font-extrabold">OneStep Document Verifier</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div
          ref={dropAreaRef}
          className="relative w-96 h-64 border-4 border-dashed border-gray-400 p-8 flex items-center justify-center cursor-pointer"
        >
          <input
            type="file"
            id="file-input"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {file ? (
            <p className="text-lg font-medium text-center">{file.name}</p>
          ) : (
            <p className="text-lg font-medium text-center">
              Drag and drop or{' '}
              <span
                onClick={() => document.getElementById('file-input')?.click()}
                className="text-blue-500 cursor-pointer"
              >
                click here
              </span>{' '}
              to upload a photo
            </p>
          )}
        </div>

        {file && (
          <button
            onClick={handleUpload}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        )}

        {/* Display images after upload */}
        {responseData && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-bold text-gray-700">Uploaded Images</h2>

           
           

            {/* QR Embedded Image */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold">QR-Embedded Image:</h3>
              <img src={responseData.qrCodeImage} alt="QR Embedded" className="mt-2 w-64 h-64 object-cover rounded-lg border" />
            </div>

            {/* Redirect Link */}
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Verify Document:</h3>
              <a
                href={responseData.qrRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Click here to verify document
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-3 text-center">
        <p>© {new Date().getFullYear()} OneStep Document Verifier. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
