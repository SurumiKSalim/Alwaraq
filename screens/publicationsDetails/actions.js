import Api from '../../common/api'
import { LIKE_FORM,CHART_INFO } from '../../common/endpoints'

export function fetchLike(formdata) {
    console.log('haha',formdata)
    return function (dispatch) {
        dispatch({ type: 'LIKE_FORM_FETCHING' })
        Api('post', LIKE_FORM,formdata).then((response) => {
            if (response)
                dispatch({ type: 'LIKE_FORM_FETCHING_SUCCESS', response: response })
            else {
                dispatch({ type: 'LIKE_FORM_FETCHING_FAILED' })
            }
        })
    }
}

export function fetchCommentModal(action) {
    return function (dispatch) {
        dispatch({ type: 'FETCH_COMMENT_MODAL', response: action })
    }
}

// export function resetChartInfoCategories(searchVisible) {
//     return { type: 'RESET_CHART_INFO', searchVisible: searchVisible }
// }