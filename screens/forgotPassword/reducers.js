let initialStage = {
    user: null,
    error: false,
    isLoading: false,
    errorMessgae: null,
}

const forgotpassword = (state = initialStage, actions) => {
    switch (actions.type) {
        case "FORGOT_PASSWORD_FETCHING":
            return { ...state, isLoading: true, user: null }
            break;
        case "FORGOT_PASSWORD_FETCHING_SUCCESS":
            return { ...state, isLoading: false, error: false}
            break;
        case "FORGOT_PASSWORD_FETCHING_FAILED":
            return { ...state, isLoading: false, error: true, user: null, errorMessgae:actions.errormessage }
            break;
        case "FORGOT_PASSWORD_RESET":
            return { ...state, user: null, error: false, errorMessgae: null }
            break;
        default:
            return state
    }
}

export default forgotpassword