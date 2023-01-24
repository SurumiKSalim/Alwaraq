let initialStage = {
  user: null,
  error: false,
  isLogging: false,
  isLoading: false,
  passwordLoading: false,
  errorMessage: null,
  isFirstLogin: true,
  isImageChanging: false,
  locale: 'en',
  activeSession: 'home',
  isSubcribed: false,
  fcmToken: null,
  uniqueId: null,
  isNameChangeing: false,
  isPremium: false,
  isSubcribing: false,
  otpErrorMessage: null,
  signUpErrorMessage: null,
  currentSelectedTrip: null,
  isShowWalkThrough: false,
  changePasswordError: null,
  rememberUser: null,
};

const user = (state = initialStage, actions) => {
  switch (actions.type) {
    case 'LOGIN_FETCHING':
      return {...state, isLogging: true, user: null, errorMessage: null};
      break;
    case 'LOGIN_FETCHING_SUCCESS':
      let locale = actions.user ? actions.user.language : 'en';
      let profile_pic = actions.user.profile_pic;
      profile_pic =
        actions.user.profile_pic + '&' + 'test=12' + new Date().getTime();
      let user_updated = {...actions.user, profile_pic: profile_pic};
      return {
        ...state,
        isLogging: false,
        error: false,
        user: user_updated,
        locale: locale,
        fcmToken: actions.fcmToken,
        isSocialLogin: actions.isSocialLogin,
      };
      break;
    case 'LOGIN_FETCHING_FAILED':
      return {
        ...state,
        isLogging: false,
        error: true,
        user: null,
        errorMessage: actions.errorMessage,
      };
      break;
    case 'LOGIN_RESET':
      return {
        ...state,
        isLogging: false,
        error: true,
        user: null,
        errorMessage: null,
        fcmToken: null,
        isNameChangeing: false,
      };
      break;
    case 'SIGNUP_FETCHING':
      return {
        ...state,
        isLogging: true,
        user: null,
        signUpErrorMessage: null,
      };
      break;
    case 'SIGNUP_FETCHING_SUCCESS':
      let signup_profile_pic = actions.user.profile_pic;
      let localeupdate = actions.user ? actions.user.language : 'en';
      signup_profile_pic =
        actions.user.profile_pic + '&' + 'test=12' + new Date().getTime();
      let signup_user_updated = {
        ...actions.user,
        profile_pic: signup_profile_pic,
      };
      return {
        ...state,
        isLogging: false,
        error: false,
        locale: localeupdate,
        user: signup_user_updated,
        fcmToken: actions.fcmToken,
        signUpErrorMessage: null,
        isSocialLogin: actions.isSocialLogin,
      };
      break;
    case 'SIGNUP_FETCHING_GUEST_SUCCESS':
      return {...state, isLogging: false, error: false};
      break;
    case 'SIGNUP_FETCHING_FAILED':
      return {
        ...state,
        isLogging: false,
        error: true,
        user: null,
        signUpErrorMessage: actions.errorMessage,
      };
      break;
    case 'SIGNUP_RESET':
      return {
        ...state,
        user: null,
        error: false,
        signUpErrorMessage: null,
        fcmToken: null,
      };
      break;
    case 'OTP_FETCHING_FETCHING':
      return {...state, isLoading: true, user: null};
      break;
    case 'OTP_FETCHING':
      return {...state, isLoading: true, user: null, otpErrorMessage: null};
      break;
    case 'OTP_FETCHING_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: false,
        user: actions.response,
      };
      break;
    case 'OTP_FETCHING_FAILED':
      return {
        ...state,
        isLoading: false,
        error: true,
        user: null,
        otpErrorMessage: actions.errormessage,
      };
      break;
    case 'OTP_RESET':
      return {
        ...state,
        user: null,
        error: false,
        otpErrorMessage: null,
        isLoading: false,
      };
      break;
    case 'SEND_FCM_TOKEN':
      return {...state, error: false, isLoading: true};
      break;
    case 'SEND_FCM_TOKEN_SUCCESS':
      return {
        ...state,
        error: false,
        isLoading: false,
        notification: actions.response,
        fcmToken: actions.fcmToken,
        uniqueId: actions.uniqueId,
      };
      break;
    case 'SEND_FCM_TOKEN_FAILED':
      return {...state, error: true, isLoading: false};
      break;
    case 'CHANGE_LANGUAGE':
      return {...state, isLoading: true};
      break;
    case 'CHANGE_LANGUAGE_SUCCESS':
      let temp_user = state.user;
      temp_user.language = actions.locale;
      return {
        ...state,
        user: {...temp_user},
        isLoading: false,
        locale: actions.locale,
      };
      break;
    case 'CHANGE_LANGUAGE_FAILED':
      return {...state, errorMessage: actions.response, isLoading: false};
      break;
    case 'CHANGE_NAME':
      return {...state, isNameChangeing: true};
      break;
    case 'CHANGE_NAME_SUCCESS':
      let updated_name = {...state.user, fullname: actions.fullname};
      return {...state, user: updated_name, isNameChangeing: false};
      break;
    case 'CHANGE_NAME_FAILED':
      return {...state, isNameChangeing: false};
      break;
    case 'CHANGE_PROFILE_IMAGE':
      return {...state, isImageChanging: true};
      break;
    case 'CHANGE_PROFILE_IMAGE_SUCCESS':
      let profile_pic_updated = actions.response.profile_pic;
      profile_pic_updated =
        actions.response.profile_pic + '&' + 'test=12' + new Date().getTime();
      let updated_user = {...state.user, profile_pic: profile_pic_updated};
      return {...state, isImageChanging: false, user: updated_user};
      break;
    case 'CHANGE_PROFILE_IMAGE_FAILED':
      return {...state, isImageChanging: false};
      break;
    case 'CHANGE_PASSWORD':
      return {...state, passwordLoading: true};
      break;
    case 'CHANGE_PASSWORD_SUCCESS':
      return {
        ...state,
        passwordLoading: false,
        changePassword: actions.response,
      };
      break;
    case 'CHANGE_PASSWORD_FAILED':
      return {
        ...state,
        changePasswordError: actions.response,
        passwordLoading: false,
      };
      break;
    case 'CHANGE_FIRST_LOGIN':
      return {
        ...state,
        isFirstLogin: actions.isFirstLogin,
        locale: actions.locale,
      };
      break;
    case 'CHANGE_USER_LOCALE':
      return {...state, locale: actions.locale};
      break;
    case 'CHANGE_USER_SESSION':
      return {...state, activeSession: actions.session};
    case 'CHANGE_USER_SUBCRIBTION':
      return {...state, isSubcribed: actions.isSubcribed};
    case 'CHANGE_USER_SUBSCRIPTION':
      let user_subscription_change = {
        ...state.user,
        isPremium: actions.isPremium,
      };
      return {...state, user: user_subscription_change};
    case 'USER_SUBSCRIBE':
      return {...state, isSubcribing: true};
    case 'USER_SUBSCRIBE_SUCCESS':
      return {...state, isSubcribing: false, isPremium: true};
    case 'USER_SUBSCRIBE_FAILED':
      return {...state, isSubcribing: false, isPremium: false};
    case 'USER_NOTIFICATION':
      return state;
    case 'USER_NOTIFICATION_SUCCESS':
      let user_status_change = {...state.user, isNotificationEnable: true};
      return {...state, user: user_status_change};
    case 'USER_NOTIFICATION_FAILED':
      return state;
    case 'CHANGE_USER_CURRENT_TRIP':
      return {...state, currentSelectedTrip: actions.trip};
    case 'UPDATE_WALK_THROUGH':
      return {...state, isShowWalkThrough: actions.show};
    case 'PROMOSUBSCRIPTION_SUCCESS':
      return {...state, user: actions.user};
    case 'RESET_LOADERS':
      return {
        ...state,
        isLogging: false,
        isLoading: false,
        passwordLoading: false,
        error: null,
        errorMessage: null,
        isImageChanging: false,
        isNameChangeing: false,
        otpErrorMessage: null,
        signUpErrorMessage: null,
        changePasswordError: null,
      };
    case 'CHANGE_EMAIL_SUCCESS':
      return {...state, user: actions.user};
    case 'UPDATE_REMEMBER_USER':
      return {...state, rememberUser: actions.user};
    case 'BIOMETRIC_CHANGED':
      return {...state, isBiometric: actions.value};
    default:
      return state;
  }
};

export default user;
