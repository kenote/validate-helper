import { Maps, Filter } from '../types'

export function testBody (body: Maps<any>, ignore: boolean = false): Filter[] {
  let { username, password } = body
  let filters: Filter[] = [
    {
      key: 'username',
      value: username,
      rules: [
        { required: true, code: 1, message: '%s 不能为空' },
        { pattern: /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]{4,19}$/, code: 2, message: '%s 格式错误' },
        { maskWord: ['admin', 'console'], code: 3, message: '%s 禁用屏蔽词' }
      ],
      label: '用户名',
      ignore
    },
    {
      key: 'password',
      value: password,
      rules: [
        { required: true, code: 1, message: '%s 不能为空' },
        { min: 8, max: 20, code: 2, message: '%s 长度控制在6～12字符内' },
        { validator: validPassword, code: 3, message: '%s 格式错误' }
      ],
      label: '密码',
      ignore
    }
  ]
  return filters
}

function validPassword (value: any): boolean {
  let valid: boolean = true
  let reg: RegExp = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/
  valid = reg.test(value)
  return valid
}
