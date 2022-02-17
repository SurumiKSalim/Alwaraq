import Api from '../../common/api'
import { BOOK_PAGE, BOOK_PAGE_CONTENT, SEARCH_BOOK_PAGE } from '../../common/endpoints'

export function fetchBookTree(bookId, url) {
    return function (dispatch) {
        dispatch({ type: 'BOOK_TREE_FETCHING' })
        Api('get', url ? url : BOOK_PAGE_CONTENT, { bookid: !url && bookId }).then((response) => {
            if (response)
                dispatch({ type: 'BOOK_TREE_FETCHING_SUCCESS', response: response.booktree })
            else {
                dispatch({ type: 'BOOK_TREE_FETCHING_FAILED' })
            }
        })
    }
}

export function fetchBookMark(bookmark) {
    return function (dispatch) {
        dispatch({ type: 'BOOK_MARK_FETCHING_SUCCESS', bookmark: bookmark})
    }
}