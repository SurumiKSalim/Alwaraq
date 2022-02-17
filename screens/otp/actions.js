import { OTPVERIFY } from '../../common/endpoints'
import Api from '../../common/api'

export function otpverify(user, otp, navigation,id) {
    let formdata = new FormData()
    formdata.append('email', user.email)
    formdata.append('otp', otp.otp)
    formdata.append('appid', 1)
    return function (dispatch) {
        dispatch({ type: 'OTP_FETCHING' })
        Api('post', OTPVERIFY, formdata).then((response) => {
            if (response && response.status && response.statusCode == 200) {
                // if (session == 'Signup'||session =='Login') {
                if (id !==1) {
                    dispatch({ type: 'OTP_FETCHING_SUCCESS', response: response.user })
                }
                else {
                    dispatch({ type: 'OTP_FORGOT_FETCHING_SUCCESS', response: null })
                    navigation.navigate('ResetPassword', { response: user.email, otp: otp.otp })
                }
               



            }
            else
                dispatch({ type: 'OTP_FETCHING_FAILED', errormessage: response.errormessage })
        })
    }
}

export function resetOtp() {
    return { type: 'OTP_RESET' }
}

export function resetShowOtp() {
    return { type: 'RESET_OTP_SHOW' }
}

export function setShowOtp(response,id) {
    return { type: 'SET_OTP_SHOW',response:response,id:id }
}