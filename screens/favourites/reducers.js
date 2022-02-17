
import _ from 'lodash';

let initialStage = {
    isLoading: false,
    error: false,
    Favourites: [],
    isLastPage: false,
    page: 1
}

const favourites = (state = initialStage, actions) => {
    switch (actions.type) {
        case "FAVOURITES_FETCHING":
            return { ...state, isLoading: true }
            break;
        case "FAVOURITES_SUCCESS":
            return { ...state, isLoading: false, error: false, Favourites: state.Favourites.concat(actions.response.favourites), page: state.page + 1, isLastPage: actions.isLastPage }
            break;
        case "FAVOURITES_FAILED":
            return { ...state, isLoading: false, error: true, isLastPage: actions.isLastPage }
            break;
        case "FAVOURITES_RESET":
            return { ...state, isLoading: false, error: false, Favourites: [], page: 1, isLastPage: false }
            break;
        // case "FAVOURITES_DELETE_SUCCESS":
        //     return { ...state, isLoading: false, error: false, Favourites:_.without(state.Favourites, actions.item) , page: state.page + 1, isLastPage: actions.isLastPage }
        //     break;
        default:
            return state
    }
}

export default favourites