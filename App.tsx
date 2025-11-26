import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { Button } from './components/Button';
import { generateTiledPdf } from './services/pdfService';
import { ProcessedPdfState, PageLayout } from './types';
import { Download, LayoutTemplate, Printer } from 'lucide-react';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<PageLayout>(PageLayout.LetterPortrait);
  const [copiesPerPage, setCopiesPerPage] = useState<number>(8);
  const [result, setResult] = useState<ProcessedPdfState>({
    url: null,
    fileName: null,
    isProcessing: false,
    error: null
  });

  const handleProcess = async () => {
    if (!selectedFile) return;

    setResult(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const pdfBytes = await generateTiledPdf(selectedFile, {
        layout,
        margin: 18,
        copiesPerPage
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const fileName = `${copiesPerPage}-up-${selectedFile.name}`;

      setResult({
        url,
        fileName,
        isProcessing: false,
        error: null
      });
    } catch (err: any) {
      setResult(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message || 'An unexpected error occurred'
      }));
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (result.url) URL.revokeObjectURL(result.url);
    setResult({
      url: null,
      fileName: null,
      isProcessing: false,
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-md">
              <LayoutTemplate className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Check Tiler (8-Up)</h1>
          </div>
          <div className="text-sm text-gray-500">
            Secure, client-side PDF processing
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:px-6">
        <div className="space-y-8">
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">8-Up PDF Layout Tool</h2>
            <p className="mt-3 text-lg text-gray-500">
              Upload a single PDF check and we'll arrange {copiesPerPage} copies onto a single page for efficient printing.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Upload */}
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">1</span>
                <h3 className="text-lg font-medium text-gray-900">Upload Source PDF</h3>
              </div>
              
              <UploadArea 
                selectedFile={selectedFile} 
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  // Reset result if new file selected
                  if (result.url) {
                    URL.revokeObjectURL(result.url);
                    setResult({ url: null, fileName: null, isProcessing: false, error: null });
                  }
                }} 
                onClear={handleReset}
              />
            </div>

            {/* Step 2: Settings (Only visible if file selected) */}
            {selectedFile && (
              <div className="bg-white shadow rounded-lg p-6 space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">2</span>
                  <h3 className="text-lg font-medium text-gray-900">Layout Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Size & Orientation</label>
                    <select 
                      value={layout}
                      onChange={(e) => setLayout(e.target.value as PageLayout)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                      <option value={PageLayout.LetterPortrait}>US Letter - Portrait (Recommended)</option>
                      <option value={PageLayout.A4Portrait}>A4 - Portrait</option>
                      <option value={PageLayout.LetterLandscape}>US Letter - Landscape</option>
                      <option value={PageLayout.A4Landscape}>A4 - Landscape</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Portrait mode fits multiple checks.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Copies per Page</label>
                    <select 
                      value={copiesPerPage}
                      onChange={(e) => setCopiesPerPage(Number(e.target.value))}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                      <option value={1}>1 copy</option>
                      <option value={4}>4 copies</option>
                      <option value={8}>8 copies (Recommended)</option>
                      <option value={9}>9 copies</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Number of check copies to arrange on each page.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Action */}
            {selectedFile && !result.url && (
               <div className="flex justify-end pt-4">
                 <Button 
                    onClick={handleProcess} 
                    isLoading={result.isProcessing}
                    className="w-full sm:w-auto text-lg px-8 py-3 shadow-lg"
                  >
                   <Printer className="mr-2 h-5 w-5" />
                   Generate Printable PDF
                 </Button>
               </div>
            )}

            {/* Error Message */}
            {result.error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error processing PDF</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{result.error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success / Download */}
            {result.url && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                      <Download className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-green-900">PDF Ready!</h3>
                      <p className="text-sm text-green-700">Your 8-up document has been created successfully.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                     <a 
                      href={result.url} 
                      download={result.fileName || 'document.pdf'} 
                      className="flex-1 sm:flex-none"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500">
                        Download PDF
                      </Button>
                    </a>
                    <Button variant="outline" onClick={handleReset}>
                      Start Over
                    </Button>
                  </div>
                </div>
                
                {/* PDF Preview Frame */}
                <div className="mt-6 border rounded-lg overflow-hidden shadow-sm bg-gray-200 h-96">
                   <iframe 
                    src={result.url} 
                    className="w-full h-full"
                    title="PDF Preview" 
                   />
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          <p>Processing happens entirely in your browser. No files are uploaded to any server.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;