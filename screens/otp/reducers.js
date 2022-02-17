let initialStage = {
  user: null,
  error: false,
  isLoading: false,
  errorMessgae: null,
  showOtp: false,
  userResponse: null,
  id: null
};

const otp = (state = initialStage, actions) => {
  switch (actions.type) {
    case "OTP_FETCHING":
      return { ...state, isLoading: true, user: null };
    case "OTP_FORGOT_FETCHING_SUCCESS":
      return { ...state, isLoading: false, error: false };
    case "OTP_FETCHING_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: false,
        user: actions.response.user
      };
    case "OTP_FETCHING_FAILED":
      return {
        ...state,
        isLoading: false,
        error: true,
        user: null,
        errorMessgae: actions.response
      };
    case "OTP_RESET":
      return {
        ...state,
        user: null,
        error: false,
        errorMessgae: null
      };
    case "RESET_OTP_SHOW":
      return { ...state, showOtp: false };
    case "SET_OTP_SHOW":
      return {
        ...state,
        showOtp: true,
        userResponse: actions.response,
        id: actions.id
      };
    default:
      return state;
  }
};

export default otp;
