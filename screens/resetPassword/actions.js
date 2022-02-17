import { RESET_PASSWORD } from '../../common/endpoints'
import Api from '../../common/api'
import { Alert } from 'react-native'

export function resetPassword(user, navigation) {
    let formdata = new FormData()
    formdata.append('email', user.email)
    formdata.append('newPassword', user.newPassword)
    formdata.append('otp', user.otp)
    formdata.append('appid', 1)
    return function (dispatch) {
        dispatch({ type: 'RESET_PASSWORD_FETCHING' })
        Api('post', RESET_PASSWORD, formdata).then((response) => {
            if (response && response.status && response.statusCode == 200) {
                dispatch({ type: 'RESET_PASSWORD_FETCHING_SUCCESS', response: response, })
                Alert.alert('Password Changed Successfully',
                '',
                [
                    { text: 'OK', },
                ],
                { cancelable: false },
            )
                navigation.navigate('Profile')
            }
            else
                dispatch({ type: 'RESET_PASSWORD_FETCHING_FAILED', errormessage: response.errormessage })
        })
    }
}
