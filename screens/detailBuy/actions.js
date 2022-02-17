import Api from '../../common/api'
import { LIKE_FORM } from '../../common/endpoints'

export function fetchBookDownload(response, bookId) {    
    return function (dispatch) {
        if (response) {
            dispatch({ type: 'FETCH_BOOK_DOWNLOAD_SUCCESS', response: response, bookId: bookId })
        }
        else {
            dispatch({ type: 'FETCH_BOOK_DOWNLOAD_FAILED' })
        }
    }
}

export function fetchPdfDownload(response, pdfPath,imgPath) {
    return function (dispatch) {
        if (response) {
            dispatch({ type: 'FETCH_PDF_DOWNLOAD_SUCCESS', response: response, pdfPath: pdfPath,imgPath:imgPath })
        }
        else {
            dispatch({ type: 'FETCH_PDF_DOWNLOAD_FAILED' })
        }
    }
}

export function fetchAudioDownload(response, audio_Array,imgPath) {
    return function (dispatch) {
        if (response) {
            dispatch({ type: 'FETCH_AUDIO_DOWNLOAD_SUCCESS', response: response, audio_Array: audio_Array,imgPath:imgPath })
        }
        else {
            dispatch({ type: 'FETCH_AUDIO_DOWNLOAD_FAILED' })
        }
    }
}

export function fetchAudioRemove() {
    return function (dispatch) {
            dispatch({ type: 'FETCH_REMOVE_AUDIO_SUCCESS'})
    }
}

export function fetchAudioAdd(audio_Array) {
    return function (dispatch) {
            dispatch({ type: 'FETCH_ADD_AUDIO_SUCCESS',response:audio_Array})
    }
}

export function fetchCoverImg(response, imgPath) {
    return function (dispatch) {
        if (response) {
            dispatch({ type: 'COVER_IMAGE_DOWNLOAD_SUCCESS', response: response, imgPath: imgPath,bookId:response.bookId })
        }
        else {
            dispatch({ type: 'COVER_IMAGE_DOWNLOAD_FAILED' })
        }
    }
}

export function fetchDeleteBook(book) {
    return function (dispatch) {
        dispatch({ type: 'FETCH_DELETE_BOOK', book: book })
    }
}

export function fetchCoverImage(imgPath, bookId) {
    return function (dispatch) {
        dispatch({ type: 'FETCH_COVER_IMAGE_BOOK', imgPath: imgPath, bookId: bookId })
    }
}

export function resetBookDownload() {
    return { type: 'FETCH_BOOK_DOWNLOAD_RESET' }
}


export function fetchLike(formdata) {
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

export function fetchCommentCount(count) {
    return function (dispatch) {
        dispatch({ type: 'FETCH_COMMENT_COUNT', response: count })
    }
}

export function resetLikeComment() {
    return function (dispatch) {
        dispatch({ type: 'RESET_LIKE_COMMENT'})
    }
}