export interface ProcessedPdfState {
  url: string | null;
  fileName: string | null;
  isProcessing: boolean;
  error: string | null;
}

export enum PageLayout {
  LetterLandscape = 'LetterLandscape', // 11 x 8.5
  LetterPortrait = 'LetterPortrait',   // 8.5 x 11
  A4Landscape = 'A4Landscape',         // 297mm x 210mm
  A4Portrait = 'A4Portrait'            // 210mm x 297mm
}

export interface ProcessingOptions {
  layout: PageLayout;
  margin: number;
}