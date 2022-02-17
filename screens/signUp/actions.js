import { SIGNUP } from '../../common/endpoints'
import Api from '../../common/api'

export function signup(user, navigation, locale, goBack) {

    let formdata = new FormData()
    formdata.append('email', user.email)
    formdata.append('password', user.password)
    formdata.append('auth', user.fbgoogle)
    formdata.append('profile_pic', user.photo)
    formdata.append('fullname', user.name)
    formdata.append('appid', 1)
    // formdata.append('language', locale)

    return function (dispatch) {
        dispatch({ type: 'SIGNUP_FETCHING' })
        Api('post', SIGNUP, formdata).then((response) => {
            if (response && response.status && response.statusCode == 200) {
                if (user.fbgoogle) {
                    dispatch({ type: 'SIGNUP_FETCHING_SUCCESS', user: response.user, fcmToken: user.fcmToken, isPremium: response.user.isPremium, isSocialLogin: response.user.isSocialLogin })
                    if (!goBack)
                        navigation.navigate('Profile')
                }
                else {
                    dispatch({ type: 'SIGNUP_FETCHING_GUEST_SUCCESS' })
                    navigation.navigate('Otp', { response: response.user })
                }

            }
            else
                dispatch({ type: 'SIGNUP_FETCHING_FAILED', errorMessage: response.errormessage })
        })
    }
}

export function resetUser() {
    return { type: 'SIGNUP_RESET' }
}

