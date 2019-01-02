# validate-helper
Validate Helper.

## Installation

```bash
$ yarn add kenote-validate-helper
```

## Usages

```ts
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { trim } from 'lodash'

const username: string = 'thondery'
const password: string = '123456'

const filters: Filter[] = [
  {
    key: 'username',
    value: trim(username),
    rules: [
      {
        required: true,
        code: 1001,
        message: 'Username Can not be empty.'
      },
      {
        pattern: '^[a-zA-Z]{1}[a-zA-Z0-9_]{3,11}$',
        code: 1002,
        message: 'Username Wrong value format.'
      }
    ]
  },
  {
    key: 'password',
    value: trim(password),
    rules: [
      {
        required: true,
        code: 1001,
        message: 'Password Can not be empty.'
      },
      {
        pattern: '^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{6,32}$',
        code: 1002,
        message: 'Password Wrong value format.'
      }
    ]
  }
]

async login () {
  try {
    let data = await asyncFilterData(filters)
    console.log(data)
    /* Data
    {
      username: 'thondery',
      password: '123456'
    }
    */
  } catch (error) {
    console.error(error)
    /* Error
    {
      code: 1001,
      message: 'Username Can not be empty.'
    }
    */
  }
}
```


## License

this repo is released under the [MIT License](https://github.com/kenote/validate-helper/blob/master/LICENSE).