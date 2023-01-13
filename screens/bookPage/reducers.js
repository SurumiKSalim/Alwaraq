let initialStage = {
    bookTree: [],
    isBookTreeLoading: false,
    suraInfoLoading:false,
    QuranContent: [],
    bookMark: []
}

const bookpage = (state = initialStage, actions) => {
    switch (actions.type) {
        case "BOOK_TREE_FETCHING":
            return { ...state, isBookTreeLoading: true }
            break;
        case "BOOK_TREE_FETCHING_SUCCESS":
            return { ...state, bookTree: actions.response, isBookTreeLoading: false }
            break;
        case "BOOK_TREE_FETCHING_FAILED":
            return { ...state, isBookTreeLoading: false }
            break;
            case "QURAN_CONTENTS_FETCHING":
            return { ...state, suraInfoLoading: true }
            break;
        case "QURAN_CONTENTS_FETCHING_SUCCESS":
            return { ...state, QuranContent: actions.response.entities,suraInfoLoading:false }
            break;
        case "QURAN_CONTENTS_FETCHING_FAILED":
            return { ...state, suraInfoLoading: false }
            break;
        case "BOOK_MARK_FETCHING_SUCCESS":
            return { ...state, bookMark: actions.bookmark }
            break;
        default:
            return state
    }
}

export default bookpage

