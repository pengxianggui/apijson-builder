import {isEmpty, isString, assert} from "./utils";

/**
 * 关联条件构建
 */
export default class AssociativeCondition {
    table;
    primaryKey;
    foreignKey;
    resFields;

    associateTables = [];

    static by(table, primaryKey, foreignKey, resFields) {
        return new AssociativeCondition(table, primaryKey, foreignKey, resFields)
    }

    constructor(table, primaryKey, foreignKey, resFields = '*') {
        assert(!isEmpty(table) && isString(table), `[ApiJson] 参数table: ${table} 非法`)
        assert(!isEmpty(primaryKey) && isString(primaryKey), `[ApiJson] 参数primaryKey: ${primaryKey} 非法, 必须是当前主表的主键`)
        assert(!isEmpty(foreignKey) && isString(foreignKey), `[ApiJson] 参数foreignField: ${foreignKey} 非法, 必须是关联表的外键字段`)
        this.table = table
        this.primaryKey = primaryKey
        this.foreignKey = foreignKey
        if (resFields.trim() !== '*') {
            this.resFields = resFields;
        }
    }

    associated(table, resFields) {
        this.associateTables.push({ // TODO 可以转为类型变量
            table: table,
            resFields: resFields
        })
        return this
    }

    toJson() {
        const json = {}
        const tableJson = {}
        const {table, primaryKey, foreignKey, resFields, associateTables} = this
        // 处理关联表
        tableJson[primaryKey + '@'] = foreignKey
        tableJson['@column'] = resFields
        json[table] = tableJson

        // 处理关联目标表
        associateTables.forEach(t => {
            json[t.table] = {
                '@column': t.resFields
            }
        })

        return json
    }
}