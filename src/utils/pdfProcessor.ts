import * as pdfjsLib from 'pdfjs-dist';
import { Section } from '@/pages/Index';

// Configure PDF.js worker with a more reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const SECTION_ALIASES = {
  "abstract": ["abstract"],
  "introduction": ["introduction", "background"],
  "literature_review": ["literature review", "background study", "related work", "review on literature"],
  "methodology": ["methodology", "methods", "approach"],
  "experiment": ["experiments", "implementation", "evaluation"],
  "results": ["results", "findings"],
  "discussion": ["discussion", "analysis"],
  "conclusion": ["conclusion", "summary"],
  "future_work": ["future work", "scope"]
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += pageText + '\n';
  }
  
  return fullText;
};

export const organizeSections = (text: string): Section[] => {
  const sections: Section[] = [];
  
  // Split text into paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  
  let currentSection: Section | null = null;
  let sectionId = 0;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    // Check if this paragraph is a section header
    const sectionType = detectSectionType(trimmedParagraph);
    
    if (sectionType) {
      // Save previous section if it exists
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        id: `section-${sectionId++}`,
        title: formatSectionTitle(sectionType),
        content: ''
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += trimmedParagraph + '\n';
    } else {
      // If no section detected yet, create a general section
      if (sections.length === 0) {
        currentSection = {
          id: `section-${sectionId++}`,
          title: 'Introduction',
          content: trimmedParagraph + '\n'
        };
      }
    }
  }
  
  // Add the last section
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  // If no sections were detected, create sections based on numbered headings
  if (sections.length === 0) {
    return createNumberedSections(text);
  }
  
  return sections.filter(section => section.content.trim().length > 50); // Filter out very short sections
};

const detectSectionType = (text: string): string | null => {
  const lowerText = text.toLowerCase().trim();
  
  // Check for numbered sections (1., 2., etc.)
  if (/^\d+\.?\s/.test(text)) {
    return null; // Let numbered sections be handled separately
  }
  
  // Check against section aliases
  for (const [sectionType, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const alias of aliases) {
      if (lowerText.includes(alias) && text.length < 100) {
        return sectionType;
      }
    }
  }
  
  return null;
};

const formatSectionTitle = (sectionType: string): string => {
  return sectionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const createNumberedSections = (text: string): Section[] => {
  const sections: Section[] = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let currentSection: Section | null = null;
  let sectionId = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for numbered headings
    const numberedMatch = trimmedLine.match(/^(\d+\.?\d*\.?)\s*(.+)/);
    
    if (numberedMatch && trimmedLine.length < 100) {
      // Save previous section
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }
      
      // Create new section
      currentSection = {
        id: `section-${sectionId++}`,
        title: `${numberedMatch[1]} ${numberedMatch[2]}`,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += trimmedLine + '\n';
    } else {
      // First section
      currentSection = {
        id: `section-${sectionId++}`,
        title: 'Document Content',
        content: trimmedLine + '\n'
      };
    }
  }
  
  // Add the last section
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  return sections.filter(section => section.content.trim().length > 50);
};
