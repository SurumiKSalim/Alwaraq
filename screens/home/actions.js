
import Api from '../../common/api'
import { DASHBOARD_CATEGORY, DOCUMENT_INFOS } from '../../common/endpoints'
import { store } from '../../App'

export function fetchDashboardCategory(locale) {
    return function (dispatch) {
        dispatch({ type: 'DASHBOARD_CATEGORY_FETCHING' })
        Api('get', DASHBOARD_CATEGORY, { language: locale }).then((response) => {
            if (response)
                dispatch({ type: 'DASHBOARD_CATEGORY_FETCHING_SUCCESS', response: response })
            else {
                dispatch({ type: 'DASHBOARD_CATEGORY_FETCHING_FAILED' })
            }
        })
    }
}

export function resetDashboardCategory() {
    return { type: 'DASHBOARD_CATEGORY_RESET' }
}

export function fetchDocumentInfos(listType, subjectId, fromOnLoad) {
    return function (dispatch) {
        let language = store.getState().userLogin.locale
        if (listType === 'popular') {
            if (!store.getState().dashboard.isPopularLoading) {
                dispatch({ type: 'POPULAR_DOCUMENT_INFO_FETCHING', fromOnLoad: fromOnLoad })
                let page = store.getState().dashboard.popularPage != null ? store.getState().dashboard.popularPage : 1
                Api('get', DOCUMENT_INFOS, { listType: listType, subjectId: subjectId, page: page, language: language == 'ar' ? 1 : 2 }).then((response) => {
                    if (response.status && (response.statusCode == 200 || response.status == 200))
                        dispatch({ type: 'POPULAR_DOCUMENT_INFO_FETCHING_SUCCESS', response: response })
                    else
                        dispatch({ type: 'POPULAR_DOCUMENT_INFO_FETCHING_FAILED' })
                })
            }
        }
        else if (listType === 'latest') {
            if (!store.getState().dashboard.isLatestLoading) {
                dispatch({ type: 'LATEST_DOCUMENT_INFO_FETCHING', fromOnLoad: fromOnLoad })
                let page = store.getState().dashboard.latestPage != null ? store.getState().dashboard.latestPage : 1
                Api('get', DOCUMENT_INFOS, { listType: listType, subjectId: subjectId, page: page, language: language == 'ar' ? 1 : 2 }).then((response) => {
                    if (response.status && (response.statusCode == 200 || response.status == 200)) {
                        
                        dispatch({ type: 'LATEST_DOCUMENT_INFO_FETCHING_SUCCESS', response: response })
                    }
                    else
                        dispatch({ type: 'LATEST_DOCUMENT_INFO_FETCHING_FAILED' })
                })
            }
        }
        else  {
            if (!store.getState().dashboard.isContemporaryLoading) {
                dispatch({ type: 'CONTEMPORARY_DOCUMENT_INFO_FETCHING', fromOnLoad: fromOnLoad })
                let page = store.getState().dashboard.ContemporaryPage != null ? store.getState().dashboard.ContemporaryPage : 1
                Api('get', DOCUMENT_INFOS, { listType: listType, subjectId: subjectId, page: page, language: language == 'ar' ? 1 : 2 }).then((response) => {
                    if (response.status && (response.statusCode == 200 || response.status == 200)) {
                        
                        dispatch({ type: 'CONTEMPORARY_DOCUMENT_INFO_FETCHING_SUCCESS', response: response })
                    }
                    else
                        dispatch({ type: 'CONTEMPORARY_DOCUMENT_INFO_FETCHING_FAILED' })
                })
            }
        }
    }
}

export function resetDocumentInfos(listType) {
    if (listType == 'popular')
        return { type: 'POPULAR_DOCUMENT_INFO_RESET' }
    else if (listType === 'latest')
        return { type: 'LATEST_DOCUMENT_INFO_RESET' }
    else
        return { type: 'CONTEMPORARY_DOCUMENT_INFO_RESET' }
}

export function resetSearchModal(searchVisible) {
    return { type: 'RESET_SEARCH_MODAL', searchVisible: searchVisible }
}


export function fetchBookAds(bookAds) {
    return { type: 'RESET_BOOK_ADS', bookAds: bookAds }
}

export function toogleLanguageModal() {
    return function (dispatch) {
        dispatch({ type: 'TOOGLE_LANGUAGE_MODAL' })
    }
}

// export function fetchAppInfo(response) {
//     return { type: 'FETCH_APP_INFO', response: response }
// }

export function fetchLatestAds() {
    let language = store.getState().userLogin.locale
    
    return function (dispatch) {
        
        Api('get', DOCUMENT_INFOS, { listType: 'slideshow', page: 1,language: language == 'ar' ? 1 : 2 }).then((response) => {
            
            if (response && response.books && response.books.length > 0) {
                var arr = response.books
                arr = arr.slice(0, 5)
                dispatch({ type: 'LATEST_ADS_FETCHING_SUCCESS', response: arr })
            }
        })
    }
}