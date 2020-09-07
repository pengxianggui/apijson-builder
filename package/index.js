import LoginBuilder from "./loginBuilder";
import QueryBuilder from "./queryBuilder";
import CUDBuilder from "./cudBuilder";
import {config, setToken} from "./utils/request";
import {reverseMerge} from "./utils";

const install = function (Vue, opts = {}) {
    if (opts) {
        reverseMerge(config, opts)
    }
}

export default {
    install
}

export {
    setToken,
    LoginBuilder,
    QueryBuilder,
    CUDBuilder
}