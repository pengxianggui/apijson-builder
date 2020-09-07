import axios from 'axios'
import {reverseMerge} from "./index";

export const config = {
    baseURL: '/api',
    tokenKey: 'X-Token',
    token: 'apijson-builder'
}
export const setToken = function (token) {
    config.token = token
}

const request = axios.create({
    baseURL: config.baseURL
})


/**
 * @param res
 */
function extractResponse(res = {}) {
    let data = {};
    // eslint-disable-next-line no-prototype-builtins
    const multi = res.hasOwnProperty('[]');
    if (multi) {
        const formatEntities = function (data) {
            data['[]'].forEach(item => {
                Object.keys(item).forEach(table => {
                    // eslint-disable-next-line no-prototype-builtins
                    if (!data.hasOwnProperty(table)) {
                        data[table] = [];
                    }
                    data[table].push(item[table])
                })
            })
            delete data['[]']
        }
        const isAssociatedResult = function (data) { // 认为, 当集合(key为'[]')中存在多个实体对象时，当作关联结果集处理.TODO 应当有更可靠的判断方式
            const arr = data['[]']
            if (arr.length > 0) {
                return Object.keys(arr[0]).length > 1
            }
            return false;
        }

        if (!isAssociatedResult(res)) { // 非关联的响应结果, 则无需格式化(保证了关联关系)
            reverseMerge(data, res)
            formatEntities(data)
        } else {
            data = res;
        }
    } else {
        data = res;
    }
    return data;
}

request.interceptors.request.use(
    config => {
        if (config.token) {
            config.headers[config.tokenKey] = config.token
        }
        return config
    },
    err => {
        console.error("err:", err);
        return Promise.reject(err)
    }
)

request.interceptors.response.use(
    response => {
        const res = response.data
        const {code} = res;
        if (code !== 200) {
            return Promise.reject(new Error(res))
        }
        return Promise.resolve(extractResponse(res));
    },
    err => {
        console.error("err:", err);
        return Promise.reject(err)
    }
)

export default request;
