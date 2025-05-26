
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Section } from '@/pages/Index';
import { generateSummary, analyzeText } from '@/utils/apiService';
import { useToast } from '@/hooks/use-toast';

interface SectionAccordionProps {
  section: Section;
  showEntities: boolean;
  onSectionUpdate: (section: Section) => void;
}

export const SectionAccordion: React.FC<SectionAccordionProps> = ({
  section,
  showEntities,
  onSectionUpdate
}) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateSummary(section.content);
      onSectionUpdate({ ...section, summary });
      toast({
        title: "Summary generated",
        description: `Summary for "${section.title}" has been generated.`
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error generating summary",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleAnalyzeText = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeText(section.content);
      onSectionUpdate({ 
        ...section, 
        entities: analysis.entities,
        dependencies: analysis.dependencies 
      });
      toast({
        title: "Analysis complete",
        description: `Analysis for "${section.title}" has been completed.`
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Error analyzing text",
        description: "Failed to analyze text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectionColor = (title: string) => {
    const colors = {
      abstract: 'bg-purple-50 border-purple-200',
      introduction: 'bg-blue-50 border-blue-200',
      literature_review: 'bg-green-50 border-green-200',
      methodology: 'bg-yellow-50 border-yellow-200',
      experiment: 'bg-orange-50 border-orange-200',
      results: 'bg-red-50 border-red-200',
      discussion: 'bg-indigo-50 border-indigo-200',
      conclusion: 'bg-pink-50 border-pink-200',
      future_work: 'bg-cyan-50 border-cyan-200'
    };
    
    const key = title.toLowerCase().replace(/\s+/g, '_') as keyof typeof colors;
    return colors[key] || 'bg-slate-50 border-slate-200';
  };

  return (
    <Card className={`${getSectionColor(section.title)} border-2 shadow-md overflow-hidden`}>
      <Accordion type="single" collapsible>
        <AccordionItem value={section.id} className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <h3 className="text-lg font-semibold text-slate-800 text-left">
                {section.title}
              </h3>
              <Badge variant="secondary" className="ml-2">
                {section.content.split(' ').length} words
              </Badge>
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4">
              {/* Section Content */}
              <div className="bg-white/80 rounded-lg p-4 border border-slate-200">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {section.content.substring(0, 500)}
                  {section.content.length > 500 && '...'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  variant="outline"
                  size="sm"
                  className="bg-white/80"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Summary'
                  )}
                </Button>

                {showEntities && (
                  <Button
                    onClick={handleAnalyzeText}
                    disabled={isAnalyzing}
                    variant="outline"
                    size="sm"
                    className="bg-white/80"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Text'
                    )}
                  </Button>
                )}
              </div>

              {/* Summary */}
              {section.summary && (
                <div className="bg-white/90 rounded-lg p-4 border border-emerald-200 border-l-4 border-l-emerald-400">
                  <h4 className="font-medium text-emerald-800 mb-2">Summary</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {section.summary}
                  </p>
                </div>
              )}

              {/* Entities and Dependencies */}
              {showEntities && section.entities && (
                <div className="bg-white/90 rounded-lg p-4 border border-blue-200 border-l-4 border-l-blue-400">
                  <h4 className="font-medium text-blue-800 mb-2">Named Entities</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {section.entities.map((entity: any, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {entity.text} ({entity.label})
                      </Badge>
                    ))}
                  </div>
                  
                  {section.dependencies && (
                    <>
                      <h4 className="font-medium text-blue-800 mb-2">Dependencies</h4>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {section.dependencies.map((dep: any, index: number) => (
                          <li key={index} className="bg-blue-50 rounded px-2 py-1">
                            {dep.text} → {dep.head} ({dep.dep})
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
