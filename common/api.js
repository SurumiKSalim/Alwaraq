import axios from 'axios'
import { store } from './store'

function select(state) {
    return state.userLogin.user != null ? state.userLogin.user.sessionToken : null
  }

export default function request(type, url, params) {
    let  locale = store.getState().userLogin.locale
    let token = select(store.getState())
    console.log('token',locale)
    axios.defaults.headers.common['sessiontoken'] =token?token: ""
    // axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    switch (type) {
        case 'get':
            return axios.get(url,{ params: {...params,language:locale == 'ar' ? 1 : 2} })
                .then(function (response) {
                    console.log("Get Response", response)
                    return response.data
                })
                .catch(function (error) {
                    console.log("Server Error", error)
                    console.log("Server response", error.response)
                    console.log("Server params", params)
                    console.log("Server url",url)
                    return error.response.data
                })
            break;
        case 'post':
            return axios.post(url, params)
                .then(function (response) {
                    console.log("Post Response", response)
                    return response.data
                })
                .catch(function (error) {
                    console.log("Server Error", error)
                    console.log("Server response", error.response)
                    console.log("Server params", params)
                    console.log("Server url",url)
                    return error.response.data
                })
            break;
        default:
            break;
    }
}