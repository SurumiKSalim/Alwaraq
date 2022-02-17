let initialStage = {
    bookList: [],
    isLoading: false,
    page:1,
    isLastPage:false,
    total:0
}

const booklist = (state = initialStage, actions) => {
    switch (actions.type) {
        case "BOOK_LIST_FETCHING":
            return { ...state, isLoading: true }
            break;
        case "BOOK_LIST_FETCHING_SUCCESS":
            return { ...state, isLoading: false,isLastPage: actions.response.isLastPage,page:state.page+1, bookList:state.bookList.concat(actions.response.books?actions.response.books:actions.response.items),total:actions.response.total}
            break;
        case "BOOK_LIST_FETCHING_FAILED":
            return { ...state, isLoading: false,total:0}
            break;
        case "BOOK_LIST_RESET":
            return { ...state, isLoading: false,page:1, bookList: []}
            break;
        default:
            return state
    }
}

export default booklist