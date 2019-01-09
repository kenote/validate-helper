export { isNull, checkLength, isPattern, validRule, filterData, asyncFilterData } from './'

export interface errorInfo {
  code: number;
  message: string;
}

export interface Rule extends errorInfo {
  pattern?: string | RegExp;
  min?: number;
  max?: number;
  required?: boolean;
  validator?: (value: any) => boolean
}

export interface Filter {
  key: string;
  rules: Rule[];
  value: any;
  ignore?: boolean;
  label?: string;
}

export interface Pick extends errorInfo {
  data: Array<string | number | boolean>;
}

export interface Options {
  picks: Pick[];
}


