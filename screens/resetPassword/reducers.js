let initialStage = {
    error: false,
    isPasswordResting:false,
    errorMessgae: null,
}

const resetpassword = (state = initialStage, actions) => {
    switch (actions.type) {
        case "RESET_PASSWORD_FETCHING":
            return { ...state, isPasswordResting: true, }
            break;
        case "RESET_PASSWORD_FETCHING_SUCCESS":
            return { ...state, isPasswordResting: false, error: false,  }
            break;
        case "RESET_PASSWORD_FETCHING_FAILED":
            return { ...state, isPasswordResting: false, error: true,  errorMessgae: actions.errormessage }
            break;
        case "RESET_PASSWORD_RESET":
            return { ...state,  error: false, errorMessgae: null }
            break;
        default:
            return state
    }
}

export default resetpassword

