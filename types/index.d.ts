export { filterData, asyncFilterData, isNull, isPattern, validRule, checkLength } from '../src'

/**
 * 过滤器单元
 */
export interface Filter {

  /**
   * 字段名
   */
  key               : string

  /**
   * 字段值
   */
  value             : any

  /**
   * 验证规则
   */
  rules             : Rule[]

  /**
   * 是否可忽略
   */
  ignore           ?: boolean

  /**
   * 标签名称
   */
  label            ?: string
}

/**
 * 规则单元
 */
export interface Rule extends errorInfo {

  /**
   * 不允许空值
   */
  required          ?: boolean

  /**
   * 最小字符长度
   */
  min               ?: number

  /**
   * 最大字符长度
   */
  max               ?: number

  /**
   * 正则验证规则
   */
  pattern           ?: string | RegExp

  /**
   * 验证函数
   */
  validator         ?: (value: any) => boolean

  /**
   * 屏蔽词
   */
  maskWord          ?: string[] | RegExp

}

/**
 * 过滤器选项
 */
export interface FilterOptions {

  /**
   * 筛选字段
   */
  picks             ?: Pick[]
}

/**
 * 筛选字段单元
 */
export interface Pick extends errorInfo {
  /**
   * 筛选字段值
   */
  data               : Array<string | number | boolean | undefined>
}

/**
 * 过滤器数据回调
 */
export type FilterDataResult = (data: Maps<any> | null, error?: errorInfo) => void

/**
 * Maps
 */
export interface Maps<T> extends Record<string, T> {}

/**
 * 错误信息
 */
export interface errorInfo {

  /**
   * 错误号
   */
  code               : number

  /**
   * 错误描述
   */
  message            : string
}