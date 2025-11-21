import React, { useState, useEffect } from 'react';
import { Printer, X, FileText, Layout, Download, Loader2 } from 'lucide-react';

// Extend window interface to include html2pdf
declare global {
  interface Window {
    html2pdf: any;
  }
}

interface PrintSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintSettings: React.FC<PrintSettingsProps> = ({ isOpen, onClose }) => {
  const [paperSize, setPaperSize] = useState('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Check if html2pdf is loaded (it is included in index.html)
  useEffect(() => {
    const checkScript = () => {
      if (typeof window !== 'undefined' && window.html2pdf) {
        setScriptLoaded(true);
      } else {
        // Fallback poll if script loads slow
        setTimeout(checkScript, 500);
      }
    };
    checkScript();
  }, []);

  // Native Browser Print (Reliable Fallback)
  const handleBrowserPrint = () => {
    // 1. Inject Print Styles for Size/Orientation
    const styleId = 'dynamic-print-style';
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @page {
        size: ${paperSize} ${orientation};
        margin: 5mm;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `;
    document.head.appendChild(style);

    // 2. Trigger Print directly (Modal is hidden via CSS media print)
    setTimeout(() => {
        window.print();
    }, 100);
  };

  // HTML2PDF Generation
  const handleDownloadPDF = async () => {
    if (!scriptLoaded) {
        alert('PDF engine is still loading. Please try again in a few seconds.');
        return;
    }

    const element = document.querySelector('.print-content') as HTMLElement;
    if (!element) {
        alert('Content area not found. Please ensure you are on the Dashboard or Tasks page.');
        return;
    }

    setIsGenerating(true);
    
    // 1. Add class to body to hide UI elements and force layout
    document.body.classList.add('pdf-generating');
    
    // 2. Scroll to top to ensure capture starts correctly
    window.scrollTo(0, 0);

    // 3. Wait for layout to stabilize (especially Recharts and Flexbox)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Options for better rendering
    const opt = {
      margin: [5, 5, 5, 5], // top, left, bottom, right
      filename: `Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, // Critical for images/avatars
        logging: false,
        letterRendering: true,
        allowTaint: true,
        scrollY: 0,
        windowWidth: 1200 // Force desktop width rendering matching CSS
      },
      jsPDF: { 
        unit: 'mm', 
        format: paperSize, 
        orientation: orientation 
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
       await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF Generation Failed:', error);
      alert('Could not generate PDF automatically. Please use the "System Print" option below and select "Save as PDF".');
    } finally {
      document.body.classList.remove('pdf-generating');
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div id="print-settings-modal" className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm no-print animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <Printer size={24} />
             </div>
             <div>
                <h3 className="font-bold text-lg">Print & PDF</h3>
                <p className="text-slate-300 text-xs">Export Report Configuration</p>
             </div>
           </div>
           <button onClick={onClose} disabled={isGenerating} className="text-slate-300 hover:text-white transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-6 space-y-6">
            {/* Paper Size */}
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-slate-400"/> Paper Size
               </label>
               <div className="grid grid-cols-2 gap-3">
                   {['a4', 'legal', 'letter', 'a3'].map((size) => (
                       <button
                         key={size}
                         onClick={() => setPaperSize(size)}
                         className={`py-2 px-3 rounded-lg border text-sm font-bold uppercase transition-all
                         ${paperSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-blue-300'}`}
                       >
                         {size}
                       </button>
                   ))}
               </div>
            </div>

            {/* Orientation */}
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Layout size={18} className="text-slate-400"/> Orientation
               </label>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setOrientation('portrait')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                    ${orientation === 'portrait' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="w-6 h-8 border-2 border-current rounded-sm bg-white/50"></div>
                    <span className="text-sm font-bold">Portrait</span>
                  </button>
                  <button 
                    onClick={() => setOrientation('landscape')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                    ${orientation === 'landscape' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className="w-8 h-6 border-2 border-current rounded-sm bg-white/50"></div>
                    <span className="text-sm font-bold">Landscape</span>
                  </button>
               </div>
            </div>
            
            <div className="pt-2 flex gap-3 flex-col">
                <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating || !scriptLoaded}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                    {isGenerating ? (
                       <><Loader2 size={20} className="animate-spin" /> Generating PDF...</>
                    ) : (
                       <><Download size={20} /> Download PDF File</>
                    )}
                </button>
                <button 
                    onClick={handleBrowserPrint}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Printer size={18} /> System Print / Save as PDF
                </button>
            </div>
            
            {!scriptLoaded && (
                <p className="text-xs text-orange-500 text-center flex items-center justify-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Loading PDF Engine...
                </p>
            )}
        </div>
      </div>
    </div>
  );
};