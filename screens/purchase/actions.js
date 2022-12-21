import Api from '../../common/api'
import { COUNTRY_LIST, SHIPPING_INFOS } from '../../common/endpoints'
import { store } from '../../App'

export function fetchCountryList(language) {
    return function (dispatch) {
        dispatch({ type: 'COUNTRY_LIST_FETCHING' })
        Api('get', COUNTRY_LIST).then(async (response) => {
            if (response.status == true)
                dispatch({ type: 'COUNTRY_LIST_SUCCESS', response: response.country, })
            else
                dispatch({ type: 'COUNTRY_LIST_FAILED' })
        })
    }
}

export function fetchShippingInfos(formdata) {
    return function (dispatch) {
        dispatch({ type: 'SHIPPING_INFOS_FETCHING' })
        Api('post', SHIPPING_INFOS, formdata).then(async (response) => {
            if (response) {
                dispatch({ type: 'SHIPPING_INFOS_SUCCESS', response: response.shipping})
            }
            else
                dispatch({ type: 'SHIPPING_INFOS_FAILED' })
        })
    }
}

