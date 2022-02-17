import { Alert } from 'react-native'
import { CHANGE_PASSWORD} from '../../common/endpoints'
import Api from '../../common/api'


// export function getUser(user) {
//     return function (dispatch) {
//         dispatch({ type: 'USER_HOME' })
//         dispatch({ type: 'USER_HOME_SUCCESS' })
//         dispatch({ type: 'USER_HOME_FAILED' })
//     }
// }

export function postChangePassword(body) {
    let formdata = new FormData()
    formdata.append('oldPassword', body.currentPassword)
    formdata.append('newPassword', body.newPassword)
    formdata.append('appid', 1)
    return function (dispatch) {
        dispatch({ type: 'CHANGE_PASSWORD' })
        Api('post', CHANGE_PASSWORD, formdata).then((response) => {
            if (response.status == true) {
                dispatch({ type: 'CHANGE_PASSWORD_SUCCESS', response: response })
                Alert.alert('Password Changed Successfully',
                    '',
                    [
                        { text: 'OK', },
                    ],
                    { cancelable: false },
                )
            }
            else
                dispatch({ type: 'CHANGE_PASSWORD_FAILED', response: response })
        })
    }
}


// export function resetUserHome() {
//     return { type: 'RESET_USER' }
// }

// export function locationNotificationEnable(value) {
//     return { type: 'LOCATION_NOTIFICATION_ENABLE', value:value }
// }