import request from "./utils/request";

export default class LoginBuilder {
    static login(phone, pass) {
        return request({
            url: `/login`,
            method: 'post',
            data: {
                phone: phone,
                password: pass
            }
        })
    }
}