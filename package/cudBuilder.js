import {isEmpty, isString, assert} from "./utils";
import Condition from "./condition";
import {reverseMerge} from "./utils";
import request from "./utils/request";

export default class CUDBuilder {
    table;
    method;
    static methods = ['post', 'put', 'delete']
    data = {};
    tag;

    constructor(table, method) {
        assert(!isEmpty(table) && isString(table), `[ApiJson] 参数table: ${table} 非法`)
        assert(CUDBuilder.methods.indexOf(method) > -1, `[ApiJson] 参数method: ${method} 非法， 只支持 ${CUDBuilder.methods}, get请求请使用QueryBuilder构建`)

        this.table = table
        this.method = method
    }

    static by(table, method) {
        return new CUDBuilder(table, method)
    }

    set(field, value) {
        assert(!isEmpty(field) && isString(field), `[ApiJson] ${field} 非法`)
        this.data[field] = value;
        return this;
    }

    whereId(expr, value) {
        const condition = Condition.by('id', expr, value);
        reverseMerge(this.data, condition.toJson())
        return this;
    }

    setTag(tag) {
        assert(!isEmpty(tag) && isString(tag), `[ApiJson] 参数tag: ${tag} 非法`)
        this.tag = tag
        return this;
    }

    toJson() {
        const {table, tag, data} = this;
        const json = {};
        json[table] = {};
        assert(tag, `[ApiJson] 参数tag: ${tag}参数非法`)
        assert(Object.keys(data).length > 0, `[ApiJson] 参数data: ${data} 参数非法`)

        reverseMerge(json[table], data);
        json['tag'] = tag;
        return json;
    }

    send() {
        const params = this.toJson()
        const {method} = this;
        return request({
            url: '/' + method,
            method: 'post',
            data: params
        })
    }
}