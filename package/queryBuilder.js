import {isEmpty, isString, isNumber, isBoolean, assert, reverseMerge} from "./utils"
import request from "./utils/request"
import Condition from './condition'
import AssociativeCondition from "./associativeCondition"

export default class QueryBuilder {
    table;
    conditions = [];
    queryType = 2; // 1表示返回总数, 2表示返回列表数和总数
    multiple = false;
    resField;
    pagination;
    orders;
    associativeCondition = [];

    static by(table, queryType) {
        return new QueryBuilder(table, queryType)
    }

    constructor(table, queryType) {
        assert(!isEmpty(table) && isString(table), `[ApiJson] 参数table: ${table} 非法`)
        if (queryType !== undefined) {
            assert([1, 2].indexOf(queryType) > -1, `[ApiJson] 参数queryType: ${queryType} 非法, 必须为数值1或2`)
            this.queryType = queryType
        }
        this.table = table
    }

    /**
     * 设置关联条件
     * @param table 关联的主表表名
     * @param primaryKey 关联的主表主键
     * @param foreignKey 和主表关联的当前表的外键。可以只输入字段名，或者符合apijson的外键全路径(以/开头)
     * @param resField 关联的主表响应字段
     */
    setAssociativeCondition(table, primaryKey, foreignKey, resField) {
        if (!isEmpty(foreignKey) && !foreignKey.startsWith("/")) {
            foreignKey = "/" + this.table + "/" + foreignKey
        }
        this.associativeCondition.push(AssociativeCondition.by(table, primaryKey, foreignKey, resField))
        return this
    }

    /**
     * 设置关联条件
     * @param condition
     * @returns {QueryBuilder}
     */
    setAssociativeConditionPlus(condition) {
        assert(condition instanceof AssociativeCondition, `[ApiJson] 参数condition: ${condition} 非法, 必须是 AssociativeCondition类型`)
        this.associativeCondition.push(condition)
        return this
    }

    condition(condition) {
        assert(condition instanceof Condition, `[ApiJson] 参数condition: ${condition} 非法, 必须是 Condition类型`)
        this.conditions.push(condition)
        return this;
    }

    setResFields(fields = '*') {
        assert(!isEmpty(fields) && isString(fields), `[ApiJson] 参数fields: ${fields} 非法`)

        if (fields.trim() !== '*') {
            this.resField = fields;
        }
        return this;
    }

    multi(multi = false) {
        this.multiple = multi;
        return this;
    }

    page(page = 0, count = 10) {
        assert(isNumber(page) && isNumber(count), `[ApiJson] 参数page: ${page} 和 count: ${count} 都必须为Number类型`)
        this.pagination = {
            page: page,
            count: count
        }
        return this;
    }

    /**
     *
     * @param field
     * @param desc 是否降序, 默认true
     */
    order(field, desc = true) {
        assert(!isEmpty(field) && isString(field), `[ApiJson] 参数field: ${field} 非法`)
        assert(isBoolean(desc), `[ApiJson] 参数desc: ${desc} 非法`)

        this.orders = {};
        this.orders[field] = (desc ? '-' : '+ ');
        return this;
    }

    toJson() {
        let json = {};
        const {table, conditions, pagination, resField, orders, multiple, associativeCondition, queryType} = this;

        assert(!(pagination && multiple === false), '指定了分页内容, 则必须指定multiple为true!')

        function tableToJson(table, conditions, resField, orders) {
            const tableJson = {};
            if (conditions && conditions.length > 0) {
                conditions.forEach(c => {
                    const json = c.toJson()
                    if (json !== null) {
                        reverseMerge(tableJson, c.toJson())
                    }
                });
            }
            if (resField) {
                tableJson['@column'] = resField + ',id'; // id内置
            }
            if (orders) {
                tableJson['@order'] = Object.keys(orders).map(field => field + orders[field]).join(',');
            }
            const json = {}
            json[table] = tableJson;
            return json;
        }

        function associativeTableToJson(associativeCondition, json) {
            associativeCondition.forEach(c => {
                reverseMerge(json, c.toJson())
            })
        }

        if (multiple) {
            json['[]'] = tableToJson(table, conditions, resField, orders)
            associativeTableToJson(associativeCondition, json['[]'])
            if (pagination) {
                reverseMerge(json['[]'], pagination)
            }

            json['[]']['query'] = queryType; // 查询数据和总数(附带total表示总数) // https://vincentcheng.github.io/apijson-doc/zh/grammar.html#%E5%88%86%E9%A1%B5
            json['total@'] = '/[]/total'
        } else {
            json = tableToJson(table, conditions, resField, orders)
            associativeTableToJson(associativeCondition, json)
        }

        return json
    }

    send() {
        const params = this.toJson();
        return request({
            url: '/get',
            method: 'post',
            data: params
        })
    }
}