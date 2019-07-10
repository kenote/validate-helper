import { isNull, checkLength, filterData, asyncFilterData } from '../src'
import { Maps, FilterOptions } from '../types'
import { testBody } from './'

describe('\nValidate Test\n', () => {

  test('Function: isNull(0) => false', () => {
    expect(isNull(0)).toBe(false)
  })

  test('Function: checkLength', () => {
    expect(checkLength('你好123')).toBe(7)
  })

  test('Function: filterData -> rule:required', () => {
    let body: Maps<any> = {}
    filterData(testBody(body), null, (data, error) => {
      expect(error && error.message).toBe('用户名 不能为空')
    })
  })

  test('Function: filterData -> rule:length', () => {
    let body: Maps<any> = {
      username: 'thondery',
      password: 'admin'
    }
    filterData(testBody(body), null, (data, error) => {
      expect(error && error.message).toBe('密码 长度控制在6～12字符内')
    })
  })

  test('Function: filterData -> rule:pattern', () => {
    let body: Maps<any> = {
      username: '1thondery',
      password: 'admin888'
    }
    filterData(testBody(body), null, (data, error) => {
      expect(error && error.message).toBe('用户名 格式错误')
    })
  })

  test('Function: filterData -> rule:validator', () => {
    let body: Maps<any> = {
      username: 'thondery',
      password: 'admin_888'
    }
    filterData(testBody(body), null, (data, error) => {
      expect(error && error.message).toBe('密码 格式错误')
    })
  })
  
  test('Function: filterData -> rule:maskWord', () => {
    let body: Maps<any> = {
      username: 'admin',
      password: 'admin_888'
    }
    filterData(testBody(body), null, (data, error) => {
      expect(error && error.message).toBe('用户名 禁用屏蔽词')
    })
  })

  test('Function: filterData -> options:picks', () => {
    let body: Maps<any> = {}
    let { username, password } = body
    let options: FilterOptions = {
      picks: [
        { 
          data: [ username, password ],
          code: 1,
          message: '用户名/密码至少填一个'
        }
      ]
    }
    filterData(testBody(body, true), options, (data, error) => {
      expect(error && error.message).toBe('用户名/密码至少填一个')
    })
  })
  
  test('Function: filterData -> ok', () => {
    let body: Maps<any> = {
      username: 'thondery',
      password: 'admin888'
    }
    filterData(testBody(body), null, (data, error) => {
      expect(data).toEqual({ username: 'thondery', password: 'admin888' })
    })
  })
  
  test('Function: asyncFilterData -> ok', async () => {
    let body: Maps<any> = {
      username: 'thondery',
      password: 'admin888'
    }
    try {
      let data: Maps<any> | null = await asyncFilterData(testBody(body))
      expect(data).toEqual({ username: 'thondery', password: 'admin888' })
    } catch (error) {
      // console.error(error)
    }
  })

})
