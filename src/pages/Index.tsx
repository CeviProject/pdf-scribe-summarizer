
import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SectionAccordion } from '@/components/SectionAccordion';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface Section {
  id: string;
  title: string;
  content: string;
  summary?: string;
  entities?: any[];
  dependencies?: any[];
  isLoading?: boolean;
}

const Index = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [showEntities, setShowEntities] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePDFProcessed = (extractedSections: Section[]) => {
    setSections(extractedSections);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            PDF Document Analyzer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload a PDF document to extract text, organize it into sections, and generate AI-powered summaries and analysis
          </p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <FileUpload 
            onPDFProcessed={handlePDFProcessed}
            onProcessingStart={handleProcessingStart}
          />
        </Card>

        {/* Settings */}
        {sections.length > 0 && (
          <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="show-entities" 
                checked={showEntities}
                onCheckedChange={(checked) => setShowEntities(checked as boolean)}
              />
              <Label htmlFor="show-entities" className="text-sm font-medium text-slate-700">
                Show Entities and Dependencies
              </Label>
            </div>
          </Card>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Processing PDF document...</p>
            </div>
          </Card>
        )}

        {/* Sections */}
        {sections.length > 0 && !isProcessing && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Document Sections
            </h2>
            {sections.map((section) => (
              <SectionAccordion
                key={section.id}
                section={section}
                showEntities={showEntities}
                onSectionUpdate={(updatedSection) => {
                  setSections(prev => 
                    prev.map(s => s.id === updatedSection.id ? updatedSection : s)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
