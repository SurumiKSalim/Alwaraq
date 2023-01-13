import {
  LOGIN,
  PROMO_COUNTER,
  NOTIFICATION,
  USER_NOTIFICATION_STATUS,
  CHANGE_PROFILE_PIC,
  CHANGELANGUAGE,
  CHANGE_NAME,
  ADD_SUBSCRIBTION,
  UPDATE_SUBSCRIBTION,
} from '../../common/endpoints';
import Api from '../../common/api';
// import I18n from '../../i18n'
import RNIap from 'react-native-iap';
import {Platform} from 'react-native';
import {store} from './../../common/store';

function getFCMToken(state) {
  return state.userLogin.fcmToken;
}

const SubscribeItems = Platform.select({
  ios: ['org.evillage.AlwaraqMonthly', 'org.evillage.AlwaraqYearly'],
  android: ['org.evillage.alwaraq_monthly', 'org.evillage.alwaraq_yearly'],
});

export function fetchUser(body, navigation) {
  let formdata = new FormData();
  formdata.append('email', body.email);
  formdata.append('password', body.password);
  formdata.append('appid', 1);
  return async function (dispatch) {
    dispatch({type: 'LOGIN_FETCHING'});
    Api('post', LOGIN, formdata).then(response => {
      if (response && response.status && response.statusCode == 200) {
        if (response.userinfo && response.userinfo.language) {
          dispatch({
            type: 'LOGIN_FETCHING_SUCCESS',
            user: response.userinfo,
            fcmToken: body.fcmToken,
            isPremium: response.userinfo.isPremium,
            isSocialLogin: response.userinfo.isSocialLogin,
          });
        } else {
          dispatch({
            type: 'LOGIN_FETCHING_FAILED',
            errorMessage: 'something went wrong',
          });
        }
      } else if (
        response &&
        response.statusCode &&
        response.statusCode == 100
      ) {
        navigation.navigate('Otp', {response: body});
      } else {
        dispatch({
          type: 'LOGIN_FETCHING_FAILED',
          errorMessage: response.errormessage,
        });
      }
    });
  };
}

export function postChangeProfileImage(body) {
  let formdata = new FormData();
  formdata.append('profile_pic', body.image);
  return function (dispatch) {
    dispatch({type: 'CHANGE_PROFILE_IMAGE'});
    Api('post', CHANGE_PROFILE_PIC, formdata).then(response => {
      if (response.status == true) {
        dispatch({type: 'CHANGE_PROFILE_IMAGE_SUCCESS', response: response});
      } else {
        dispatch({type: 'CHANGE_PROFILE_IMAGE_FAILED', response: response});
      }
    });
  };
}

export function fetchChangeName(updateusername) {
  let formdata = new FormData();
  formdata.append('username', updateusername);
  formdata.append('appid', 1);
  return function (dispatch) {
    dispatch({type: 'CHANGE_NAME'});
    Api('post', CHANGE_NAME, formdata).then(async response => {
      if (response.status === true) {
        dispatch({
          type: 'CHANGE_NAME_SUCCESS',
          response: response,
          fullname: updateusername,
        });
      } else {
        dispatch({type: 'CHANGE_NAME_FAILED'});
      }
    });
  };
}

export function sendFCMToken(fcmToken, osType, uniqueId, forced) {
  let formdata = new FormData();
  formdata.append('osType', osType);
  formdata.append('fcmToken', fcmToken);
  formdata.append('deviceId', uniqueId);
  formdata.append('appId', 1);
  if (!(forced || getFCMToken(store.getState()) != fcmToken)) {
    return {type: 'SEND_FCM_TOKEN'};
  }

  return function (dispatch) {
    Api('post', NOTIFICATION, formdata).then(async response => {
      if (response.status === true) {
        dispatch({
          type: 'SEND_FCM_TOKEN_SUCCESS',
          response: response,
          fcmToken: fcmToken,
          uniqueId: uniqueId,
        });
      } else {
        dispatch({type: 'SEND_FCM_TOKEN_FAILED'});
      }
    });
  };
}

export function postChangeLanguage(body) {
  let formdata = new FormData();
  formdata.append('language', body.language);
  formdata.append('appid', 1);
  return function (dispatch) {
    dispatch({type: 'CHANGE_LANGUAGE'});
    Api('post', CHANGELANGUAGE, formdata).then(response => {
      if (response.status == true) {
        dispatch({type: 'CHANGE_LANGUAGE_SUCCESS', locale: response.language});
      } else {
        dispatch({type: 'CHANGE_LANGUAGE_FAILED', response: response});
      }
    });
  };
}
export function postNotificationToggle(data) {
  let formdata = new FormData();
  formdata.append('notification', data.status);
  formdata.append('appid', 1);
  return function (dispatch) {
    dispatch({type: 'USER_NOTIFICATION'});
    Api('post', USER_NOTIFICATION_STATUS, formdata).then(response => {
      if (response.status == true) {
        dispatch({type: 'USER_NOTIFICATION_SUCCESS', status: true});
      } else {
        dispatch({type: 'USER_NOTIFICATION_FAILED'});
      }
    });
  };
}

export function resetFirstLogin(data) {
  return {
    type: 'CHANGE_FIRST_LOGIN',
    locale: data.locale,
    isFirstLogin: data.isFirstLogin,
  };
}
export function changeUserCurrentTrip(trip) {
  return {type: 'CHANGE_USER_CURRENT_TRIP', trip: trip};
}

export function resetUser() {
  return {type: 'LOGIN_RESET'};
}

export function promoSubscription(user) {
  return {type: 'PROMOSUBSCRIPTION_SUCCESS', user: user};
}

export function changeUserSession(session) {
  return {type: 'CHANGE_USER_SESSION', session: session};
}

export function changeSubcribtion(subscrition_type) {
  return {type: 'CHANGE_USER_SUBCRIBTION', subscrition_type: subscrition_type};
}

export function updateUserSubscrition(isPremium) {
  return {type: 'CHANGE_USER_SUBSCRIPTION', isPremium: isPremium};
}

export function updateSubscrition(email) {
  return async function (dispatch) {
    let ios_pass = 'cac55a76ec174f6586e96f32e34bb75f';
    let result = await RNIap.initConnection();
    dispatch({type: 'USER_SUBSCRIBE'});
    const availableItems = await RNIap.getSubscriptions(SubscribeItems);
    // const clearing = await RNIap.clearProductsIOS();
    const purchases = await RNIap.getAvailablePurchases();
    if (Platform.OS == 'ios') {
      const receiptBody = {
        'receipt-data': purchases[purchases.length - 1].transactionReceipt,
        password: ios_pass,
      };
      const valllid = await validateReceiptIos(receiptBody, false)
        .then(receipt => {
          //check test receipt
          if (receipt?.status === 21007) {
            return validateReceiptIos(receiptBody, true);
          } else {
            return receipt;
          }
        })
        .then(receipt => {
          const renewalHistory = receipt?.latest_receipt_info;
          const expiration =
            renewalHistory[renewalHistory.length - 1].expires_date_ms;
          let subscrition_type = 0;
          if (expiration > Date.now()) {
            if (purchases[0].productId == SubscribeItems[0]) {
              subscrition_type = 1;
            } else if (purchases[0].productId == SubscribeItems[1]) {
              subscrition_type = 2;
            }
            dispatch({type: 'USER_SUBSCRIBE_SUCCESS'});
          } else {
            dispatch({type: 'USER_SUBSCRIBE_FAILED'});
          }
        })
        .catch(error => {
          console.error(error);
          dispatch({type: 'USER_SUBSCRIBE_FAILED'});
        });
    } else {
      let subscrition_type = 0;
      if (purchases && purchases.length > 0) {
        if (purchases[0].productId == SubscribeItems[0]) {
          subscrition_type = 1;
        } else if (purchases[0].productId == SubscribeItems[1]) {
          subscrition_type = 2;
        }
        dispatch({type: 'USER_SUBSCRIBE_SUCCESS'});
      } else {
        dispatch({type: 'USER_SUBSCRIBE_FAILED'});
      }
    }
    let formdata = new FormData();
    formdata.append('action', 'add');
    formdata.append('appId', 1);
    formdata.append('transactionId', purchases && purchases[0].transactionId);
    formdata.append(
      'transactionDate',
      purchases && purchases[0].transactionDate,
    );
    formdata.append('subscriptionId', purchases && purchases[0].productId);
    Api('post', PROMO_COUNTER, formdata).then(response => {
    });
  };
}

export function addSubscrition(subscrition_type) {
  return {type: 'USER_SUBSCRIBE_SUCCESS'};
}

export function updateWalkThrough(isShow) {
  return {type: 'UPDATE_WALK_THROUGH', show: isShow};
}

export function fetchResetLoaders() {
  return {type: 'RESET_LOADERS'};
}

export function changeEmail(user) {
  return {type: 'CHANGE_EMAIL_SUCCESS', user: user};
}

export function rememberUser(user) {
  return {type: 'UPDATE_REMEMBER_USER', user: user};
}
