import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface DocumentData {
  message: string;
  imageUrl: string;
}

const VerifyDocument = () => {
  const { publicId } = useParams<{ publicId: string }>(); 
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`http://localhost:5000/verify/${publicId}`);
        if (!response.ok) {
          throw new Error('Document not found');
        }
        const result = await response.json();
        setDocument(result);
      } catch (error: any) {
        setError(error.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [publicId]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="w-full headColor rounded pacifico-regular text-white py-4 text-center">
        <h1 className="text-4xl font-extrabold ">OneStep Document Verifier</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500 italic">{error}</p>}
        {document && (
          <>
            <h1 className="text-xl font-bold italic">{document.message}</h1> 
            <img src={document.imageUrl} alt="Original Document" className="mt-4 w-96 h-auto rounded-lg shadow-lg" />
          </>
        )}
      </main>

      {/* Footer - Always Sticks to Bottom */}
      <footer className="w-full bg-gray-900 text-white py-4 text-center mt-auto">
        <h1 className="text-lg font-bold">OneStep Verification System</h1>
        <div className="flex justify-center gap-4 text-sm mt-2">
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
        <hr className="my-2 border-gray-600" />
        <p className="text-xs">Copyright © {new Date().getFullYear()} OneStep Verification</p>
      </footer>
    </div>
  );
};

export default VerifyDocument;
