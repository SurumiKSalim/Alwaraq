let initialStage = {
    categorySubjucts: [],
    popularPage: 1,
    latestPage: 1,
    ContemporaryPage: 1,
    isPopularLastPage: false,
    isLatestLastPage: false,
    isContemporaryLastPage: false,
    isPopularLoading: false,
    isCategoryLoading: false,
    isLatestLoading: false,
    isContemporaryLoading: false,
    popularDocumentList: [],
    latestDocumentList: [],
    ContemporaryDocumentList: [],
    popularError: false,
    latestError: false,
    ContemporaryError: false,
    searchVisible: false,
    languageModalVisible: false,
    bookAds: true,
    latestAds: [],
}

const dashboard = (state = initialStage, actions) => {
    switch (actions.type) {
        case "DASHBOARD_CATEGORY_FETCHING":
            return { ...state, isCategoryLoading: true }
            break;
        case "DASHBOARD_CATEGORY_FETCHING_SUCCESS":
            return { ...state, isCategoryLoading: false, error: false, categorySubjucts: actions.response.subjects }
            break;
        case "DASHBOARD_CATEGORY_FETCHING_FAILED":
            return { ...state, isCategoryLoading: false, error: true }
            break;
        case "DASHBOARD_CATEGORY_RESET":
            return { ...state, isCategoryLoading: false, categorySubjucts: [], error: false }
            break;
        case "POPULAR_DOCUMENT_INFO_FETCHING":
            return { ...state, isPopularLoading: true }
            break;
        case "LATEST_DOCUMENT_INFO_FETCHING":
            return { ...state, isLatestLoading: true }
            break;
        case "CONTEMPORARY_DOCUMENT_INFO_FETCHING":
            return { ...state, isContemporaryLoading: true }
            break;
        case "POPULAR_DOCUMENT_INFO_FETCHING_SUCCESS":
            return { ...state, isPopularLoading: false, popularError: false, isPopularLastPage: actions.response.isLastPage, popularPage: state.popularPage + 1, popularDocumentList: state.popularDocumentList.concat(actions.response.books) }
            break;
        case "LATEST_DOCUMENT_INFO_FETCHING_SUCCESS":
            return { ...state, isLatestLoading: false, latestError: false, isLatestLastPage: actions.response.isLastPage, latestPage: state.latestPage + 1, latestDocumentList: state.latestDocumentList.concat(actions.response.books) }
            break;
        case "CONTEMPORARY_DOCUMENT_INFO_FETCHING_SUCCESS":
            return { ...state, isContemporaryLoading: false, ContemporaryError: false, isContemporaryLastPage: actions.response.isLastPage, ContemporaryPage: state.ContemporaryPage + 1, ContemporaryDocumentList: state.ContemporaryDocumentList.concat(actions.response.books) }
            break;
        case "POPULAR_DOCUMENT_INFO_FETCHING_FAILED":
            return { ...state, isPopularLoading: false, popularError: true }
            break;
        case "LATEST_DOCUMENT_INFO_FETCHING_FAILED":
            return { ...state, isLatestLoading: false, latestError: true }
            break;
        case "CONTEMPORARY_DOCUMENT_INFO_FETCHING_FAILED":
            return { ...state, isContemporaryLoading: false, ContemporaryError: true }
            break;
        case "POPULAR_DOCUMENT_INFO_RESET":
            return { ...state, isPopularLoading: false, popularPage: 1, popularDocumentList: [], popularError: false }
            break;
        case "LATEST_DOCUMENT_INFO_RESET":
            return { ...state, isLatestLoading: false, latestDocumentList: [], latestPage: 1, latestError: false }
            break;
        case "CONTEMPORARY_DOCUMENT_INFO_RESET":
            return { ...state, isContemporaryLoading: false, ContemporaryDocumentList: [], ContemporaryPage: 1, ContemporaryError: false }
            break;
        case "RESET_SEARCH_MODAL":
            return { ...state, searchVisible: actions.searchVisible }
            break;
        case "RESET_BOOK_ADS":
            return { ...state, bookAds: actions.bookAds }
            break;
        case "LATEST_ADS_FETCHING_SUCCESS":
            return { ...state, latestAds: actions.response }
            break;
        case "TOOGLE_LANGUAGE_MODAL":
            return { ...state, languageModalVisible: !state.languageModalVisible }
            break;
        // case "FETCH_APP_INFO":
        //     return { ...state, appInfo: actions.response }
        //     break;
        default:
            return state
    }
}

export default dashboard

