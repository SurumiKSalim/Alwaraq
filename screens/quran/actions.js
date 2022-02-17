import Api from '../../common/api'
import { QURAN_CONTENTS } from '../../common/endpoints'

export function fetchQuranContent() {
    return function (dispatch) {
        dispatch({ type: 'QURAN_CONTENTS_FETCHING' })
        Api('get', QURAN_CONTENTS).then((response) => {
            if (response)
                dispatch({ type: 'QURAN_CONTENTS_FETCHING_SUCCESS', response: response })
            else {
                dispatch({ type: 'QURAN_CONTENTS_FETCHING_FAILED' })
            }
        })
    }
}