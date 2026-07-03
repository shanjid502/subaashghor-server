export interface IQuestionOption {
  value: 'fresh' | 'warm' | 'floral' | 'woody';
  label: {
    bn: string;
    en: string;
  };
}

export interface IQuestion {
  _id?: string;
  id: string; // unique lowercase slug
  prompt: {
    bn: string;
    en: string;
  };
  options: IQuestionOption[];
}
