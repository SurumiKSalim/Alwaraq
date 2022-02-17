import { act } from "react-test-renderer";

let initialStage = {
    searchList:[],
    isLoading:false,
    isLastPage: false,
    page: 1,
    total:0
}

const searchpage = (state = initialStage, actions) => {
    switch (actions.type) {
        case "SEARCH_FETCHING":
            return { ...state, isLoading: true }
            break;
        case "SEARCH__FETCHING_SUCCESS":
            if(actions.option1!=1)
            return { ...state, isLoading: false, error: false, searchList:state.searchList.concat(actions.response.exsearchlist?actions.response.exsearchlist:actions.response.items),page:state.page+1,isLastPage: actions.response.isLastPage,total:actions.response.total}
            else
            return { ...state, isLoading: false, error: false, searchList:state.searchList.concat(actions.response.quransearchlist),page:state.page+1,isLastPage: actions.response.isLastPage,total:actions.response.total }
            break;
        case "SEARCH__FETCHING_FAILED":
            return { ...state, isLoading: false, error: true }
            break;
        case "SEARCH__FETCHING_RESET":
            return { ...state, isLoading: false, searchList: [], error: false,page:1,isLastPage: false }
            break;
        default:
            return state
    }
}

export default searchpage

