import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, ScanLine, X, History, Keyboard, QrCode, AlertCircle, CheckCircle2, Search, Copy } from 'lucide-react';
import { Card, Button, Input, Badge } from './UI';
import CameraScanner from './CameraScanner';

// --- Types ---

export interface ParsedBarcode {
  type: 'GS1' | 'EAN-13' | 'UNKNOWN';
  gtin?: string;
  expiry?: string; // YYYY-MM-DD
  batch?: string;
  raw: string;
  timestamp: number;
}

// --- Parsing Logic ---

export const parseBarcodeString = (input: string): ParsedBarcode => {
  const timestamp = Date.now();
  let clean = input.trim();
  
  clean = clean.replace(/[\(\)]/g, '');
  clean = clean.replace(/^\][a-zA-Z0-9]+/, '');

  if ((clean.length === 13 || clean.length === 12) && /^\d+$/.test(clean)) {
    return { 
      type: 'EAN-13', 
      gtin: clean.padStart(14, '0'), 
      raw: input,
      timestamp
    };
  }
  
  let gtin: string | undefined;
  let expiry: string | undefined;
  let batch: string | undefined;
  let type: ParsedBarcode['type'] = 'UNKNOWN';

  let remaining = clean;

  if (remaining.startsWith('01')) {
    type = 'GS1';
    if (remaining.length >= 16) {
      gtin = remaining.substring(2, 16);
      remaining = remaining.substring(16);
    }
  }

  if (remaining.startsWith('17')) {
    type = 'GS1';
    if (remaining.length >= 8) {
       const rawDate = remaining.substring(2, 8);
       const yy = parseInt(rawDate.substring(0, 2));
       const mm = rawDate.substring(2, 4);
       const dd = rawDate.substring(4, 6);
       const yyyy = yy > 50 ? 1900 + yy : 2000 + yy;
       expiry = `${yyyy}-${mm}-${dd}`;
       remaining = remaining.substring(8);
    }
  }

  if (remaining.startsWith('10')) {
     type = 'GS1';
     batch = remaining.substring(2);
  }

  if (type === 'UNKNOWN' && clean.length === 14 && /^\d+$/.test(clean)) {
      return { type: 'GS1', gtin: clean, raw: input, timestamp };
  }

  return {
    type,
    gtin,
    expiry,
    batch,
    raw: input,
    timestamp
  };
};

export const useHardwareScanner = (onScan: (barcode: string) => void) => {
  const buffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;
      
      if (timeDiff > 50) {
         buffer.current = '';
      }
      
      lastKeyTime.current = now;

      if (e.key === 'Enter') {
          if (buffer.current.length >= 3) {
              e.preventDefault(); 
              onScan(buffer.current);
          }
          buffer.current = '';
      } else if (e.key.length === 1) { 
          buffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScan]);
};

const PharmacyScanner = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [history, setHistory] = useState<ParsedBarcode[]>([]);
  const [lastResult, setLastResult] = useState<ParsedBarcode | null>(null);
  const [manualInput, setManualInput] = useState('');

  const handleScan = useCallback((raw: string) => {
    const result = parseBarcodeString(raw);
    setLastResult(result);
    setHistory(prev => [result, ...prev].slice(0, 5));
  }, []);

  useHardwareScanner(handleScan);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput);
      setManualInput('');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ScanLine className="text-parami" /> Scanner Utility
          </h1>
          <p className="text-slate-500 text-sm">GS1 DataMatrix & Barcode Processor for Pharmacy Operations</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsCameraActive(!isCameraActive)}
            className={`${isCameraActive ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
          >
            {isCameraActive ? <><X size={18} /> Stop Camera</> : <><Camera size={18} /> Enable Camera</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="space-y-6">
            <div className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative ${isCameraActive ? 'bg-black border-slate-900 shadow-xl' : 'bg-slate-100 border-slate-300'}`}>
               {isCameraActive ? (
                 <CameraScanner 
                    onScan={handleScan} 
                    className="w-full h-full"
                 />
               ) : (
                 <div className="text-slate-400 flex flex-col items-center">
                    <Camera size={48} className="mb-2 opacity-50" />
                    <p className="font-medium">Camera Inactive</p>
                    <p className="text-xs">Click "Enable Camera" to start visual scanning</p>
                 </div>
               )}
            </div>

            <Card title="Manual Test Input">
               <form onSubmit={handleManualSubmit} className="flex gap-2">
                 <div className="flex-1 relative">
                    <Keyboard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="Paste barcode string here..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-a7/20 font-mono text-sm"
                    />
                 </div>
                 <Button type="submit" variant="primary">Process</Button>
               </form>
               <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-bold">Test Case:</span> 01088512345678901725123110BATCH001
               </div>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="min-h-[280px] flex flex-col justify-center relative overflow-hidden">
               {!lastResult ? (
                  <div className="text-center text-slate-400 py-12">
                     <QrCode size={64} className="mx-auto mb-4 opacity-20" />
                     <h3 className="text-lg font-medium text-slate-600">Ready to Scan</h3>
                     <p className="text-sm">Waiting for scanner input or manual entry...</p>
                  </div>
               ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                     <div className="absolute top-0 right-0 p-4">
                        <Badge variant={lastResult.type === 'GS1' ? 'success' : 'neutral'}>{lastResult.type}</Badge>
                     </div>
                     
                     <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product GTIN</p>
                        <h2 className="text-3xl font-mono font-bold text-slate-800 break-all">
                           {lastResult.gtin || 'N/A'}
                        </h2>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                           <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Batch No.</p>
                           <p className="text-lg font-mono font-semibold text-amber-900">{lastResult.batch || 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-xl border ${lastResult.expiry ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                           <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${lastResult.expiry ? 'text-blue-700' : 'text-slate-500'}`}>Expiry Date</p>
                           <p className={`text-lg font-mono font-semibold ${lastResult.expiry ? 'text-blue-900' : 'text-slate-400'}`}>
                              {lastResult.expiry || 'N/A'}
                           </p>
                        </div>
                     </div>

                     <div className="bg-slate-900 rounded-lg p-3 overflow-hidden">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
                           <span>Raw Data</span>
                           <span className="font-mono text-slate-600">{lastResult.raw.length} chars</span>
                        </p>
                        <p className="font-mono text-xs text-green-400 break-all">{lastResult.raw}</p>
                     </div>
                  </div>
               )}
            </Card>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                     <History size={16} /> Recent Scans
                  </h3>
                  <span className="text-xs text-slate-500">{history.length} items</span>
               </div>
               <div className="divide-y divide-slate-100">
                  {history.map((scan, idx) => (
                     <div key={idx} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 mb-0.5">
                              <span className={`w-2 h-2 rounded-full ${scan.type === 'GS1' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              <span className="font-mono text-sm font-medium text-slate-700 truncate">{scan.gtin || 'Unknown GTIN'}</span>
                           </div>
                           <div className="text-xs text-slate-500 flex gap-3">
                              {scan.batch && <span>Batch: {scan.batch}</span>}
                              {scan.expiry && <span>Exp: {scan.expiry}</span>}
                           </div>
                        </div>
                        <div className="text-right pl-4">
                           <span className="text-[10px] text-slate-400 block">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                           <Badge variant="neutral" className="scale-75 origin-right">{scan.type}</Badge>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PharmacyScanner;