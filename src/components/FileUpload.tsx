
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { extractTextFromPDF, organizeSections } from '@/utils/pdfProcessor';
import { Section } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onPDFProcessed: (sections: Section[]) => void;
  onProcessingStart: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onPDFProcessed,
  onProcessingStart
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive"
      });
      return;
    }

    try {
      onProcessingStart();
      const extractedText = await extractTextFromPDF(file);
      const sections = organizeSections(extractedText);
      onPDFProcessed(sections);
      
      toast({
        title: "PDF processed successfully",
        description: `Extracted ${sections.length} sections from the document.`
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Error processing PDF",
        description: "Failed to extract text from the PDF file.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      processFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Upload PDF Document
        </h3>
        <p className="text-slate-500 mb-4">
          Drag and drop your PDF file here, or click to browse
        </p>
        <Button variant="outline" className="bg-white/80">
          <Upload className="mr-2 h-4 w-4" />
          Choose File
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
