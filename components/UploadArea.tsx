import React, { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './Button';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, selectedFile, onClear }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
       const file = e.dataTransfer.files[0];
       if (file.type === 'application/pdf') {
        onFileSelect(file);
       } else {
         alert('Please upload a PDF file.');
       }
    }
  };

  const triggerSelect = () => {
    inputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className="w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-50 p-3 rounded-full">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClear} className="p-2 h-auto text-gray-400 hover:text-red-500 border-none bg-transparent hover:bg-transparent shadow-none">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer bg-white"
      onClick={triggerSelect}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept=".pdf" 
        className="hidden" 
      />
      <div className="bg-indigo-100 p-4 rounded-full inline-block mb-4">
        <Upload className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Upload your Check PDF</h3>
      <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select</p>
      <Button variant="secondary" onClick={(e) => { e.stopPropagation(); triggerSelect(); }}>
        Select PDF File
      </Button>
    </div>
  );
};