import Api from '../../common/api'
import { FAVOURITES, FAVOURITES_ADD_DELETE, CHECK_FAVOURITES } from '../../common/endpoints'
import { store } from '../../App'

export function fetchFavourites() {
    return function (dispatch) {
        if (!store.getState().favourites.isLoading) {
            dispatch({ type: 'FAVOURITES_FETCHING' })
            let page = store.getState().favourites.page != null ? store.getState().favourites.page : 1
            Api('get', FAVOURITES, { page: page }).then(async (response) => {
                if (response.status == true)
                    dispatch({ type: 'FAVOURITES_SUCCESS', response: response, isLastPage: response.isLastPage })
                else
                    dispatch({ type: 'FAVOURITES_FAILED', isLastPage: response.isLastPage })
            })
        }
    }
}

export function resetFavourites() {
    return { type: 'FAVOURITES_RESET' }
}

export function fetchAddFavourites(action, bookid, item) {
    let formdata = new FormData()
    formdata.append('action', action)
    formdata.append('bookId', bookid)
    formdata.append('appId', 1)
    return function (dispatch) {
        dispatch({ type: 'FAVOURITES_ADD_DELETE_FETCHING' })
        Api('post', FAVOURITES_ADD_DELETE, formdata).then(async (response) => {
            if (response) {
                // if (action == 'add')
                //     dispatch({ type: 'FAVOURITES_ADD_SUCCESS' })
                // else {
                //     dispatch({ type: 'FAVOURITES_DELETE_SUCCESS', item: item })
                // }
                dispatch(resetFavourites())
                dispatch(fetchFavourites())
            }
            else
                dispatch({ type: 'FAVOURITES_ADD_DELETE_FAILED' })
        })
    }
}

