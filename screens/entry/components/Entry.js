import React, { Component } from "react";
import { StyleSheet, View, Platform } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { NavigationActions, StackActions } from "react-navigation";
import { connect } from "react-redux";
import firebase from "react-native-firebase";
import DeviceInfo from "react-native-device-info";
import {
  sendFCMToken,
  updateSubscrition,
  fetchResetLoaders,
  updateUserSubscrition
} from "../../login/actions";
import RNIap, {
  purchaseUpdatedListener,
  acknowledgePurchaseAndroid,
  finishTransaction,
  finishTransactionIOS,
  consumePurchaseAndroid
} from "react-native-iap";
import { fetchLatestAds } from "../../home/actions";
import { copilot } from "react-native-copilot";
import Api from "../../../common/api";
import { PROMO_COUNTER } from "../../../common/endpoints";

class App extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      fcmToken: null,
      uniqueId: null
    };
  }

  // async configureFCM() {

  //     firebase.messaging().hasPermission()
  //         .then(enabled => {
  //             if (!enabled) {

  //                 firebase.messaging().requestPermission()
  //                     .then(() => {
  //                       return true
  //                     })
  //                     .catch(error => {
  //                       return false
  //                     })
  //             }
  //         })

  //     const fcmToken = await firebase.messaging().getToken();
  //     // if (fcmToken) {
  //     //     let uniqueId = await DeviceInfo.getUniqueId()
  //     //     let osType = Platform.OS == 'ios' ? 1 : 2

  //     //     //4rd parameter->forcefully updated
  //     //     this.props.dispatch(sendFCMToken(fcmToken, osType, uniqueId, false))
  //     // }
  // }

  _checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      console.log("haha");
      const fcmToken = await firebase.messaging().getToken();
      console.log("fcmToken", fcmToken);
      let uniqueId = await DeviceInfo.getUniqueId();
      let osType = Platform.OS == "ios" ? 1 : 2;
      this.props.dispatch(sendFCMToken(fcmToken, osType, uniqueId, false));
      //     //     let osType = Platform.OS == 'ios' ? 1 : 2
    } else this._getPermission();
  };

  _getPermission = async () => {
    console.log("qqqq");
    firebase
      .messaging()
      .requestPermission()
      .then(() => {
        this._checkPermission();
      })
      .catch(error => {
        // User has rejected permissions
      });
  };

  gotoScreen(screen, params) {
    this.props.navigation.navigate(screen, params);
  }

  fetchSubscription() {
    let formdata = new FormData();
    formdata.append("action", "");
    formdata.append("appId", 1);
    Api("post", PROMO_COUNTER, formdata).then(response => {
      if (response && response.statusCode) {
        console.log("count", response.isPremium);
        this.props.dispatch(updateUserSubscrition(response.isPremium));
      }
    });
  }

  async componentDidMount() {
    SplashScreen.hide();
    if (this.props.user) {
      this.fetchSubscription();
    }
    this.props.dispatch(fetchResetLoaders());
    this.props.dispatch(fetchLatestAds());
    this._checkPermission();
    let email = this.props.user ? this.props.user.email : null;
    this.props.dispatch(updateSubscrition(email));
    if (Platform.OS === "android") {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases && purchases[0]) {
        if (!purchases[0].isAcknowledgedAndroid) {
          const ackResult = await acknowledgePurchaseAndroid(
            purchases[0].purchaseToken
          );
        }
      }
    }
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    {
      Platform.OS === "ios" && firebase.notifications().setBadge(0);
    }
    if (notificationOpen) {
      // App was opened by a notification
      // Get the action triggered by the notification being opened
      const notification = notificationOpen.notification;
      notification.data.bookid
        ? this.props.navigation.navigate("Detailbuy", {
            bookId: notification.data.bookid,
            fromNotification: true
          })
        : this.props.navigation.navigate("HomePage");
      // Get information about the notification that was opened
    } else {
      let route = "OnBoard";
      if (!this.props.isFirstLogin) route = "HomePage";
      const resetAction = StackActions.reset({
        key: null,
        index: 0,
        actions: [NavigationActions.navigate({ routeName: route })],
        params: { onBoardProps: this.props }
      });
      this.props.navigation.dispatch(resetAction);
    }
  }

  render() {
    return <View />;
  }
}

const mapStateToProps = state => {
  return {
    isFirstLogin: state.userLogin.isFirstLogin,
    user: state.userLogin.user,
  };
};
export default connect(mapStateToProps)(copilot()(App));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  }
});
