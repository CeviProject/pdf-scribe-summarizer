
// API Configuration
const API_BASE = "http://localhost:8000";

export interface AnalysisResult {
  entities: Array<{
    text: string;
    label: string;
    start: number;
    end: number;
  }>;
  dependencies: Array<{
    text: string;
    head: string;
    dep: string;
    head_pos: string;
    dep_pos: string;
  }>;
}

export const generateSummary = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/generate-summary/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.summary || data.result || 'Summary generated successfully.';
  } catch (error) {
    console.error('Error calling summary API:', error);
    throw new Error('Failed to generate summary. Please check if the API server is running.');
  }
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_BASE}/analyze/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      entities: data.entities || [],
      dependencies: data.dependencies || []
    };
  } catch (error) {
    console.error('Error calling analysis API:', error);
    throw new Error('Failed to analyze text. Please check if the API server is running.');
  }
};

// Helper function to test API connectivity
export const testAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
