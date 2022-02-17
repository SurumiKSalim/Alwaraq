
import Api from '../../common/api'
import { BOOKTITLES_SEARCH, DOCUMENT_INFOS } from '../../common/endpoints'
import { store } from '../../App'

export function fetchBookList(subjectId,kind,language,bookLanguage,listType,authorId) {
    return function (dispatch) {
        if (!store.getState().booklist.isLoading) {
            dispatch({ type: 'BOOK_LIST_FETCHING' })
            let page = store.getState().booklist.page != null ? store.getState().booklist.page : 1
            Api('get', DOCUMENT_INFOS, { subjectId: subjectId, kind: kind, page: page,language:language,bookLanguage:bookLanguage,listType:listType,authorId:authorId }).then((response) => {
                if (response&&response.statusCode==200)
                    dispatch({ type: 'BOOK_LIST_FETCHING_SUCCESS', response: response })
                else {
                    dispatch({ type: 'BOOK_LIST_FETCHING_FAILED' })
                }
            })
        }
    }
}

export function fetchSearch(searchText,subjectId,language,listType,authorId,bookLanguage) {
    return function (dispatch) {
        if (!store.getState().booklist.isLoading) {
            dispatch({ type: 'BOOK_LIST_FETCHING' })
            let page = store.getState().booklist.page != null ? store.getState().booklist.page : 1
            Api('get', DOCUMENT_INFOS, { subjectId: subjectId, searchText:searchText, page: page,language:language,listType:listType,authorId:authorId,bookLanguage:bookLanguage}).then((response) => {
                if (response)
                    dispatch({ type: 'BOOK_LIST_FETCHING_SUCCESS', response: response })
                else {
                    dispatch({ type: 'BOOK_LIST_FETCHING_FAILED' })
                }
            })
        }
    }
}

export function resetBookList() {
    return { type: 'BOOK_LIST_RESET' }
}