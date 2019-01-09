import { isRegExp, isUndefined, format } from 'util'
import { isObject, pick } from 'lodash'
import { errorInfo, Rule, Filter, Options } from './index.d'

export const isNull = (value: any): boolean => String(value || '').length === 0 && value !== 0

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

export const isPattern = (value: string, rule: Rule): boolean => {
  if (rule.validator) {
    return rule.validator(value)
  }
  let regExp: RegExp = isRegExp(rule.pattern) ? rule.pattern : new RegExp(rule.pattern || '')
  let valid: boolean = regExp.test(value)
  if (valid) {
    let size: number = checkLength(value)
    if (rule.min && size < rule.min) {
      valid = false
    }
    if (rule.max && size > rule.max) {
      valid = false
    }
  }
  return valid
}

const validMessage = (rule: Rule, message: string = ''): errorInfo => (
  {
    message,
    ...pick(rule, ['message', 'code'])
  }
)

export const validRule = (value: any, rules: Rule[]): errorInfo | null => {
  for (let rule of rules) {
    if (rule.required && isNull(value)) {
      return validMessage(rule, 'Value cannot be empty.')
    }
    if (rule.pattern && !isPattern(value, rule)) {
      return validMessage(rule, 'Wrong value format.')
    }
  }
  return null
}

const chooseOne = (data: Array<string | number | boolean>): boolean => {
  let result: boolean = true
  for (let item of data) {
    result = isUndefined(item)
    if (!result) break
  }
  return result
}

export const filterData = (filters: Filter[], options: Options | undefined, done: (data: any, message?: errorInfo) => void): void => {
  let info: {} = {}
  for (let item of filters) {
    if (item.ignore && isUndefined(item.value)) continue
    info[item.key] = item.value
    if (isObject(item.value)) {
      for (let key in item.value) {
        let itemValid: errorInfo | null = validRule(item.value[key], item.rules)
        if (itemValid) {
          if (itemValid.message) {
            itemValid = { ...itemValid, message: format(itemValid.message, format(item.label || '', key)) }
          }
          return done(null, itemValid)
        }
      }
    }
    else {
      let itemValid: errorInfo | null = validRule(item.value, item.rules)
      if (itemValid) {
        if (itemValid.message) {
          itemValid = { ...itemValid, message: format(itemValid.message, item.label || '') }
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

export const asyncFilterData = (filters: Filter[], options?: Options): Promise<any> => {
  return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void): void => {
    filterData(filters, options, (data, message): void => {
      if (message) {
        reject(message)
      }
      else {
        resolve(data)
      }
    })
  })
}