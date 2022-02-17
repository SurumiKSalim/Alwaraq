import { FORGOT_PASSWORD } from '../../common/endpoints'
import Api from '../../common/api'

export function forgotPassword(user, navigation) {
    let formdata = new FormData()
    formdata.append('email', user.email)
    formdata.append('appid', 1)
    return function (dispatch) {
        dispatch({ type: 'FORGOT_PASSWORD_FETCHING' })
        Api('post', FORGOT_PASSWORD, formdata).then((response) => {
            if (response && response.status && response.statusCode == 200) {
                dispatch({ type: 'FORGOT_PASSWORD_FETCHING_SUCCESS', response: response })
                navigation.navigate('Otp',{response:response,id:1})
            }
            else
                dispatch({ type: 'FORGOT_PASSWORD_FETCHING_FAILED', errormessage: response.errormessage })
        })
    }
}

export function resetForgotPassword() {
    return { type: 'FORGOT_PASSWORD_RESET' }
}