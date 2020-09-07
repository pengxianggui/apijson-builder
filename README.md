# apijson-builder
[apijson](https://github.com/APIJSON/APIJSON) 不必过多解释，可查看连接。
apijson的请求构建是唯一的学习成本(不考虑撸源码的话)，因此为了方便js构建rest请求，
所以有了apijson-builder， 是个小东西，代码量也很小。方便你快速构建apijson的rest请求。

## 安装
```javascript
import ApiJsonBuilder from 'apijson-builder'
Vue.use(ApiJsonBuilder, {
    baseURL: '/api/apijson',
    tokenKey: 'X-Token',
    token: '304958029525nsd23423'
})
```

## 使用
```javascript
import {QueryBuilder} from 'apijson-builder';
import Condition from "./condition";
QueryBuilder.by('User')
        .condition(Condition.by('name', 'like', 'zhang'))
        .order('name')
        .multi(true)
        .setResFields('name,age,phone')
        .page(0, 10)
        .send()
.then(resp => {
    const {total, User: users} = resp // users 即为数据, total为总数
})
```

## 关于token
你可以这样设置token
```javascript
import {setToken, LoginBuilder} from "apijson-builder";

LoginBuilder.login('username', 'password').then(resp => {
    const {token} = resp
    setToken(token)
})
```

## 其他
更多使用方式自己看下就知道了， 欢迎来完善。
来改源码前请务必熟知apijson的语法！