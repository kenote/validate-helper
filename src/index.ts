import { isRegExp, isUndefined, format } from 'util'
import { pick, isObject } from 'lodash'
import { Filter, Rule, FilterOptions, FilterDataResult, Maps, errorInfo } from '../types'

/**
 * 过滤提交数据；回调方式
 * @param filters Filter[]
 * @param options FilterOptions | undefined | null,
 * @param done FilterDataResult
 * @returns void
 */
export const filterData = (filters: Filter[], options: FilterOptions | undefined | null, done: FilterDataResult): void => {
  let info: Maps<any> = {}
  for (let filter of filters) {
    if (filter.ignore && isUndefined(filter.value)) continue
    info[filter.key] = filter.value
    if (isObject(filter.value)) {
      for (let key in filter.value) {
        let itemValid: errorInfo | null = validRule(filter.value[key], filter.rules)
        if (itemValid) {
          if (itemValid.message) {
            itemValid = { ...itemValid, message: format(itemValid.message, format(filter.label || '', key)) }
          }
          return done(null, itemValid)
        }
      }
    }
    else {
      let itemValid: errorInfo | null = validRule(filter.value, filter.rules)
      if (itemValid) {
        if (itemValid.message) {
          itemValid = { ...itemValid, message: format(itemValid.message, filter.label || '') }
        }
        return done(null, itemValid)
      }
    }
  }
  if (options && options.picks) {
    for (let item of options.picks) {
      let pick: boolean = chooseOne(item.data)
      if (pick) {
        return done(null, validMessage(item))
      }
    }
  }
  return done(info)
}

/**
 * 过滤提交数据；异步方式
 * @param filters Filter[]
 * @param options FilterOptions | null
 * @returns Promise<Maps<any> | null>
 */
export const asyncFilterData = (filters: Filter[], options?: FilterOptions | null): Promise<Maps<any> | null> => {
  return new Promise((resolve, reject): void => {
    filterData(filters, options, (data, error): void => {
      if (error) {
        reject(error)
      }
      else {
        resolve(data)
      }
    })
  })
}

/**
 * 判断空值，不包含数字0
 * @param value value
 * @returns boolean
 */
export const isNull = (value: any): boolean => String(value || '').length === 0 && value !== 0

/**
 * 检测字符串长度，中文算2个字符
 * @param str string
 * @returns number
 */
export const checkLength = (str: string): number => {
  let size: number = 0
  if (isNull(str)) return size
  let arr: string[] = str.split('')
  for (let word of arr) {
    size++
    (/[^\x00-\xff]/g.test(word)) && size++
  }
  return size
}

/**
 * 通过正则表达式或验证函数检测
 * @param value string
 * @param rule Rule
 * @returns boolean
 */
export const isPattern = (value: string, rule: Rule): boolean => {
  if (rule.validator) {
    return rule.validator(value)
  }
  let regExp: RegExp = isRegExp(rule.pattern) ? rule.pattern : new RegExp(rule.pattern || '')
  let valid: boolean = regExp.test(value)
  if (valid) {
    valid = isLength(value, rule)
  }
  return valid
}

/**
 * 验证规则
 * @param value any
 * @param rules Rule[]
 * @returns errorInfo | null
 */
export const validRule = (value: any, rules: Rule[]): errorInfo | null => {
  for (let rule of rules) {
    if (rule.required && isNull(value)) {
      return validMessage(rule, 'Value cannot be empty.')
    }
    if ((rule.pattern || rule.validator) && !isPattern(value, rule)) {
      return validMessage(rule, 'Wrong value format.')
    }
    else if (!isLength(value, rule)) {
      return validMessage(rule, 'Wrong value format of length.')
    }
    else if (isMaskWord(value, rule)) {
      return validMessage(rule, 'Wrong value of mask word.')
    }
  }
  return null
}

/**
 * 检测包含屏蔽词
 * @param value string
 * @param rule Rule
 * @returns boolean
 */
const isMaskWord = (value: string, rule: Rule) => {
  let valid: boolean = false
  if (rule.maskWord) {
    let reg: RegExp
    if (isRegExp(rule.maskWord)) {
      reg = rule.maskWord
    }
    else {
      let words: string = rule.maskWord.join('|')
      reg = new RegExp(words, 'gi')
    }
    valid = value.search(reg) > -1
  }
  return valid
}

/**
 * 检测数据字节长度
 * @param value string
 * @param rule Rule
 * @returns boolean
 */
const isLength = (value: string, rule: Rule): boolean => {
  let valid: boolean = true
  let size: number = checkLength(value)
    if (rule.min && size < rule.min) {
      valid = false
    }
    if (rule.max && size > rule.max) {
      valid = false
    }
  return valid
}

/**
 * 验证消息
 * @param rule Rule
 * @param message string
 * @returns errorInfo
 */
const validMessage = (rule: Rule, message: string = ''): errorInfo => (
  {
    message,
    ...pick(rule, ['message', 'code'])
  }
)

/**
 * 判断多个可忽略字段，必选一个有效值
 * @param data Array<string | number | boolean | undefined>
 * @returns boolean
 */
const chooseOne = (data: Array<string | number | boolean | undefined>): boolean => {
  let result: boolean = true
  for (let item of data) {
    result = isUndefined(item)
    if (!result) break
  }
  return result
}