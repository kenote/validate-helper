
export interface errorInfo {
  code: number;
  message: string;
}

export interface Rule extends errorInfo {
  pattern?: string | RegExp;
  min?: number;
  max?: number;
  required?: boolean;
}

export interface Filter {
  key: string;
  rules: Rule[];
  value: any;
  ignore?: boolean;
  label?: string;
}

interface Pick extends errorInfo {
  data: Array<string | number | boolean>;
}

export interface Options {
  picks: Pick[];
}


