import _ from 'lodash';

let initialStage = {
    offlinebook: [],
    offlineBookLoading: false,
    page: 1,
    isLastPage: false,
    tempBook: [],
    offlineAudio: [],
    totalLikes: 0,
    isLoading: true,
    isLiked: false,
    modalAction: false,
    totalComments: 0,
}

var base64 = require('base-64');
var utf8 = require('utf8');

const offlinebook = (state = initialStage, actions) => {
    switch (actions.type) {
        case "FETCH_BOOK_DOWNLOAD_FETCHING":
            return { ...state, offlineBookLoading: true }
            break;
        case "FETCH_BOOK_DOWNLOAD_SUCCESS":
            let preResponse = []
            console.log('actions.response', actions.response)
            let book = (state.tempBook[0] && state.tempBook[0].page) ?
                state.tempBook[0].page.concat(actions.response.book.page) : actions.response.book.page;
            preResponse = [{ ...actions.response.book, page: book }]
            return { ...state, isLastPage: actions.response.book.isLastPage, offlineBookLoading: false, page: actions.response.book.isLastPage == false ? state.page + 1 : state.page, tempBook: preResponse }
            break;
        case "FETCH_BOOK_DOWNLOAD_FAILED":
            return { ...state, offlineBookLoading: false }
            break;
        case "FETCH_BOOK_DOWNLOAD_RESET":
            return { ...state, error: false, tempBook: [], page: 1, isLastPage: false }
            break;
        case "FETCH_DELETE_BOOK":
            return { ...state, offlinebook: _.without(state.offlinebook, actions.book) }
            break;
        case "FETCH_COVER_IMAGE_BOOK":
            let ob = state.tempBook.find(o => o.bookid == actions.bookId);
            let ind = state.tempBook.indexOf(ob);
            let preBook = [{ ...state.tempBook[ind], imgPath: actions.imgPath }]
            console.log('preBook', preBook)
            return { ...state, offlinebook: state.offlinebook.concat(preBook), tempBook: [] }
            break;
        case "FETCH_PDF_DOWNLOAD_SUCCESS":
            let pdfBook = [{ ...actions.response, pdfPath: actions.pdfPath, imgPath: actions.imgPath }]
            return { ...state, offlinebook: state.offlinebook.concat(pdfBook) }
            break;
        case "FETCH_AUDIO_DOWNLOAD_SUCCESS":
            let audioBook = [{ ...actions.response, audioArray: actions.audio_Array, imgPath: actions.imgPath }]
            return { ...state, offlinebook: state.offlinebook.concat(audioBook) }
            break;
        case "FETCH_REMOVE_AUDIO_SUCCESS":
            return { ...state, offlineAudio: [],isLoading:false }
            break;
        case "FETCH_ADD_AUDIO_SUCCESS":
            return { ...state, offlineAudio: actions.response }
            break;
        case "COVER_IMAGE_DOWNLOAD_SUCCESS":
            let obj = state.tempBook.find(o => o.bookid == actions.bookId);
            let index = state.tempBook.indexOf(obj);
            let preBooks = [{ ...state.tempBook[index] }]
            console.log('preBook', preBook, state.tempBook)
            return { ...state, }
            break;
        case "LIKE_FORM_FETCHING":
            return { ...state, isLoading: true }
        case "LIKE_FORM_FETCHING_SUCCESS":
            return { ...state, isLoading: false, isLiked: actions.response.isLiked, totalLikes: actions.response.totalLikes }
        case "LIKE_FORM_FETCHING_FAILED":
            return { ...state, isLoading: false }
        case "FETCH_COMMENT_MODAL":
            return { ...state, modalAction: actions.response }
        case "FETCH_COMMENT_COUNT":
            return { ...state, totalComments: actions.response }
        case "RESET_LIKE_COMMENT":
            return { ...state, totalComments: 0, isLiked: false, totalLikes: 0 }
        default:
            return state
    }
}

export default offlinebook