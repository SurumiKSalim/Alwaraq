
import _ from 'lodash';

let initialStage = {
    country:[],
    shipping:[],
    isCountryLoading:false,
    isLoading: false,
}

const address = (state = initialStage, actions) => {
    switch (actions.type) {
        case "COUNTRY_LIST_FETCHING":
            return { ...state, isCountryLoading: true }
            break;
        case "COUNTRY_LIST_SUCCESS":
            return { ...state,country:actions.response, isCountryLoading: false }
            break;
        case "COUNTRY_LIST_FAILED":
            return { ...state, isCountryLoading: false  }
            break;
        case "SHIPPING_INFOS_FETCHING":
            return { ...state, isLoading: true }
            break;
        case "SHIPPING_INFOS_SUCCESS":
            return { ...state,shipping:actions.response, isLoading: false}
            break;
        case "SHIPPING_INFOS_FAILED":
            return { ...state, isLoading: false,}
            break;
        default:
            return state
    }
}

export default address