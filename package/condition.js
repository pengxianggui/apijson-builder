import {isEmpty, isString, assert} from "./utils";

export default class Condition {
    field;
    expr;
    value;
    ignoreValue = [];
    static EXPRS = ['eq', 'in', 'and', 'or', 'like', 'pattern'];

    constructor(field, expr, value) {
        assert(!isEmpty(field) && isString(field), `[ApiJson] ${field} 非法`)
        assert(Condition.EXPRS.indexOf(expr) > -1, `[ApiJson] 未知操作符 ${expr}, 支持的操作符为: ${Condition.EXPRS}`)

        this.field = field;
        this.expr = expr;
        this.value = value;
    }

    static by(field, expr, value) {
        return new Condition(field, expr, value);
    }

    ignore(ignoreValue) {
        if (Array.isArray(ignoreValue)) {
            this.ignoreValue = ignoreValue
        } else {
            this.ignoreValue.push(ignoreValue)
        }
        return this;
    }

    toJson() {
        const json = {};
        const {field, expr, value, ignoreValue} = this;
        if (ignoreValue.indexOf(value) > -1) {
            return null;
        }
        switch (expr) {
            case 'eq':
                json[field] = value; // 5
                break;
            case 'in':
                json[field + '{}'] = value; // [1,2,3]
                break;
            case 'and':
                json[field + '&{}'] = value; // ">=300, <=400"
                break;
            case "like":
                json[field + '$'] = '%' + value + '%'; // "meta"
                break;
            case "pattern":
                json[field + '?'] = value; // "^[0-9]+$"
                break;
            default:
                throw new Error(`[ApiJson] 未知操作类型： ${expr}`)
        }
        return json;
    }
}