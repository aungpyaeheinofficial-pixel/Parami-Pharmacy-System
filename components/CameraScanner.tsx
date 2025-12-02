import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';

interface CameraScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  className?: string;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, onClose, className = '' }) => {
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const scannerRef = useRef<any>(null);
  // Generate a unique ID for this instance to prevent DOM conflicts
  const scannerId = useRef(`scanner-${Math.random().toString(36).substr(2, 9)}`);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Check if library is loaded
    if (!(window as any).Html5Qrcode) {
      setError("Scanner library not loaded. Please refresh.");
      return;
    }
    
    setIsReady(true);

    const initScanner = async () => {
      try {
        const Html5Qrcode = (window as any).Html5Qrcode;
        // Use the unique ID
        const html5QrCode = new Html5Qrcode(scannerId.current);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText: string) => {
             if (isMounted.current) {
                onScan(decodedText);
             }
          },
          () => {} // Ignore frame errors to keep console clean
        );
      } catch (err) {
        console.error("Scanner Error:", err);
        if (isMounted.current) {
            setError("Could not access camera. Ensure permissions are granted.");
        }
      }
    };

    // Small delay to ensure DOM element is rendered
    const timer = setTimeout(initScanner, 100);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
      
      if (scannerRef.current) {
         // Stop scanning and clear the element
         scannerRef.current.stop().then(() => {
             scannerRef.current.clear();
         }).catch((err: any) => {
             // If stop fails (e.g. wasn't running), just clear
             console.warn("Scanner stop failed", err);
             scannerRef.current.clear();
         });
      }
    };
  }, [onScan]);

  return (
    <div className={`relative bg-black overflow-hidden flex flex-col items-center justify-center ${className}`}>
        {/* Dynamic ID used here */}
        <div id={scannerId.current} className="w-full h-full"></div>
        
        {(!isReady || error) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center bg-slate-900 z-10">
                {error ? (
                    <>
                        <AlertCircle size={32} className="mb-2 text-red-500" />
                        <p className="text-sm font-medium">{error}</p>
                    </>
                ) : (
                    <div className="animate-pulse flex flex-col items-center">
                        <Camera size={32} className="mb-2 opacity-50" />
                        <p className="text-sm">Initializing Camera...</p>
                    </div>
                )}
            </div>
        )}

        {onClose && (
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md z-20 transition-all"
            >
                <X size={20} />
            </button>
        )}
        
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-20">
            <p className="text-white/70 text-xs bg-black/30 inline-block px-3 py-1 rounded-full backdrop-blur-sm">Align barcode within frame</p>
        </div>
    </div>
  );
};

export default CameraScanner;