import request from "./utils/request";

export default class LoginBuilder {
    static login(username, pass) {
        return request({
            url: `/login`,
            method: 'post',
            data: {
                username: username,
                password: pass
            }
        })
    }
}