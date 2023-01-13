import React, {Component} from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Text,
  StatusBar,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {SafeAreaView} from 'react-navigation';
import Images from '../../../assets/images';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import {
  FONT_PRIMARY,
  FONT_MEDIUM,
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_BOLD,
} from '../../../assets/fonts';
import RNIap, {
  purchaseUpdatedListener,
  purchaseErrorListener,
  acknowledgePurchaseAndroid,
} from 'react-native-iap';
import {connect} from 'react-redux';
import {addSubscrition} from './../../login/actions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {PREMIUM_SUBSCRIPTION, PROMO_COUNTER} from '../../../common/endpoints';
import I18n from '../../../i18n';
import Api from '../../../common/api';
import Modal from 'react-native-modal';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';

const {height, width} = Dimensions.get('screen');
var SubscribeItems = [];
// Platform.select({
//     ios: ['org.evillage.AlwaraqMonthly', 'org.evillage.AlwaraqYearly'],
//     android: ['org.evillage.alwaraq_monthly', 'org.evillage.alwaraq_yearly']
// });
//  Platform.select({
//     ios: ['org.evillage.AlwaraqMonthly', 'org.evillage.AlwaraqYearly'],
//     android: ['org.evillage.alwaraq_monthly', 'org.evillage.alwaraq_yearly']
// });

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

class App extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 60,
      },
      headerTitle: (
        <View style={styles.headerTitleContainer}>
          <Image
            source={Images.logo}
            resizeMode="contain"
            style={styles.logoContainer}
          />
        </View>
      ),
      headerRight: <View style={styles.headerRightContainer} />,
      headerLeft: <View style={styles.headerRightContainer} />,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isSubscribing: false,
      subscritionType: 0,
      products: null,
      paymentMethods: [],
      subscriptionForms: [],
      indicator: 0,
      index: 0,
      refCode: this.props.navigation.getParam('Ref', ''),
      promocode: this.props.navigation.getParam('Promo', ''),
      SubscribeItems: [],
      isLoading: true,
    };
    this.getSubscriptionsAmount = this.getSubscriptionsAmount.bind(this);
    this.restorePurchase = this.restorePurchase.bind(this);
    this.dataFetch = this.dataFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.productDetails = this.productDetails.bind(this);
    this.addPromo = this.addPromo.bind(this);
    this.paymentMethod = this.paymentMethod.bind(this);
    this.defaultPayment = this.defaultPayment.bind(this);
    this.thirdPartyPayment = this.thirdPartyPayment.bind(this);
  }

  dataFetch() {
    let formdata = new FormData();
    formdata.append('appId', 1);
    formdata.append('discountCode', this.state.promocode);
    formdata.append('refCode', this.state.refCode);
    this.setState({isLoading: true});
    Api('post', PREMIUM_SUBSCRIPTION, formdata).then(response => {
      this.setState({isLoading: false});
      if (response && response.statusCode === 200) {
        // const products = await RNIap.getSubscriptions(result);
        this.setState({SubscribeItems: response.info});
        SubscribeItems =
          Platform.OS == 'ios'
            ? response.info.map(({iosProductId}) => iosProductId)
            : response.info.map(({androidProductId}) => androidProductId);
        this.productDetails(SubscribeItems);
      }
    });
    this.addPromo();
  }

  productDetails = async SubscribeItems => {
    const products = await RNIap.getSubscriptions(SubscribeItems);
    this.setState({products: products});
  };

  async componentDidMount() {
    try {
      SplashScreen.hide();
      const result = await RNIap.initConnection();
      await this.dataFetch();
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases && purchases.length > 0) {
        this.setState({isSubcribeMemember: true});
      }
    } catch (err) {
      console.warn(err); // standardized err.code and err.message available
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
      this.setState({isSubscribing: false});
      this.props.dispatch(addSubscrition(this.state.subscritionType));
      this.props.navigation.goBack();
      const receipt = purchase.transactionReceipt;
      if (receipt) {
        this.addPromo(purchase);
        try {
          if (Platform.OS === 'android') {
            SubscribeItems = await acknowledgePurchaseAndroid(
              purchase.purchaseToken,
            );
          }
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }
      }
    });

    purchaseErrorSubscription = purchaseErrorListener(error => {
      this.setState({isSubscribing: false});
    });
  }

  componentWillUnmount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }

  addPromo(purchase) {
    let formdata = new FormData();
    formdata.append('action', purchase ? 'add' : '');
    formdata.append('appId', 1);
    if (purchase) {
      formdata.append('transactionId', purchase.transactionId);
      formdata.append('transactionDate', purchase.transactionDate);
      formdata.append('subscriptionId', purchase.productId);
    }
    Api('post', PROMO_COUNTER, formdata).then(response => {
      this.setState({subscriptionForms: response.paymentMethods});
    });
  }

  buySubscribeItem = async sku => {
    try {
      this.setState({isSubscribing: true});
      const purchase = await RNIap.requestSubscription(sku);
      //Success
    } catch (err) {
      this.setState({isSubscribing: false});
    }
  };

  getSubscriptionsAmount(index) {
    let amount =
      this.state.products &&
      this.state.products.length > 0 &&
      this.state.products[index].localizedPrice;
    return amount;
  }

  restorePurchase = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases.length > 0) {
        this.props.dispatch(addSubscrition());
        Alert.alert(
          '',
          'Restore Successful',
          [{text: 'OK', onPress: () => this.props.navigation.goBack()}],
          {cancelable: false},
        );
      }
    } catch (err) {
      console.warn(err); // standardized err.code and err.message available
      Alert.alert('No Subscription Found !');
    }
  };

  defaultPayment(index) {
    this.setState({subscritionType: index + 1, isVisible: false}, () =>
      this.buySubscribeItem(SubscribeItems[index]),
    );
  }

  thirdPartyPayment(index, mode) {
    let paymentMethodId =
      this.state.subscriptionForms &&
      this.state.subscriptionForms[1] &&
      this.state.subscriptionForms[1].paymentMethodId;
    let name =
      this.state.subscriptionForms &&
      this.state.subscriptionForms[1] &&
      this.state.subscriptionForms[1].name;
    this.setState({isVisible: false});
    if (this.props.user) {
      if (mode === 'etisalat') {
        this.props.navigation.navigate('EtisalatPayment', {
          products: this.state.products,
          index: index,
          SubscribeItems: this.state.SubscribeItems,
          paymentMethodId: paymentMethodId,
          title: name,
        });
      } else {
        setTimeout(() => {
          Alert.alert(
            'Coming Soon',
            'Sorry! This feature will be available soon.',
            [
              {
                text: 'Ok',
                // onPress: () => this.props.navigation.navigate('Profile'),
                style: 'cancel',
              },
            ],
            {
              cancelable: true,
              //   onDismiss: () =>
              //     Alert.alert(
              //       "This alert was dismissed by tapping outside of the alert dialog."
              //     ),
            },
          );
        }, 500);
      }
    } else {
      setTimeout(() => {
        Alert.alert(
          'Login Required',
          'Please Login to continue',
          [
            {
              text: 'cancel',
              // onPress: () => this.props.navigation.navigate('Profile'),
              style: 'cancel',
            },
            {
              text: 'Login',
              onPress: () => this.props.navigation.navigate('Profile'),
              style: 'cancel',
            },
          ],
          {
            cancelable: true,
            //   onDismiss: () =>
            //     Alert.alert(
            //       "This alert was dismissed by tapping outside of the alert dialog."
            //     ),
          },
        );
      }, 500);
    }
  }

  paymentMethod(index) {
    if (Platform.OS === 'ios') {
      this.defaultPayment(index);
    } else {
      this.setState({isVisible: true, index: index});
    }
  }

  renderModalPassword = () => (
    <View style={styles.contents}>
      <View>
        <Text style={styles.modalTitle}>Payment Method</Text>
        <TouchableOpacity
          onPress={() => this.defaultPayment(this.state.index)}
          style={styles.modalSelectionContent1}>
          <Text
            style={[
              styles.modalText,
              {color: !this.props.isSocialLogin ? TITLE_COLOR : '#D7DBDD'},
            ]}>
            Play Store
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.thirdPartyPayment(this.state.index, 'card')}
          style={styles.modalSelectionContent1}>
          <Text style={styles.modalText}>
            {this.state.subscriptionForms
              ? this.state.subscriptionForms &&
                this.state.subscriptionForms[0] &&
                this.state.subscriptionForms[0].name
              : 'Alwaraq Payment Gateway'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.thirdPartyPayment(this.state.index, 'etisalat')}
          style={styles.modalSelectionContent1}>
          <Text style={styles.modalText}>
            {this.state.subscriptionForms
              ? this.state.subscriptionForms &&
                this.state.subscriptionForms[1] &&
                this.state.subscriptionForms[1].name
              : 'Etisalat Payment Gateway'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => this.setState({isVisible: false})}
        style={styles.modalSelectionContent1}>
        <Text style={styles.modalText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  renderItem({item, index}) {
    let products = this.state.products;
    return (
      <View style={styles.month}>
        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.textMonth}>
              {products && products[index] && products[index].title}
            </Text>
          </View>
          <View>
            <Text style={styles.amount}>
              {this.getSubscriptionsAmount(index)}
            </Text>
            {/* <Text style={styles.per}>{I18n.t("per_month")}</Text> */}
          </View>
          <View style={styles.validityInfo}>
            <Text style={styles.access}>
              {products && products[index] && products[index].description}
            </Text>
            {/* <Text style={styles.billed}>{this.getSubscriptionsAmount(index)} {I18n.t("billed_for_one_month")}</Text> */}
          </View>
          <TouchableOpacity
            style={styles.subscribButton1}
            onPress={() => this.paymentMethod(index)}>
            <Text style={styles.premiumButton}>
              {this.state.isSubscribing ? 'Please Wait..' : I18n.t('SUBSCRIBE')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.closeContainer}>
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={() => this.props.navigation.goBack()}>
            <AntDesign name="closecircleo" size={30} color="black" />
          </TouchableOpacity>
        </View>
        {!this.state.isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Image source={Images.subscribe} style={styles.img} />
              <Text style={styles.subHeader}>{I18n.t('Choose_the_Plan')}</Text>
              <Text style={styles.subHeader}>
                {I18n.t('Downgrade_or_upgrade_at_any_time')}
              </Text>
              {/* <Text style={styles.subHeader}>{this.state.refCode},{this.state.promocode}</Text> */}
            </View>
            <FlatList
              style={styles.flatlistStyle}
              showsVerticalScrollIndicator={false}
              data={this.state.SubscribeItems}
              renderItem={this.renderItem}
              extraData={this.state}
              keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.restoreContainer}>
              <Text style={styles.restoreInfoContainer}>
                if you are already subscribed
              </Text>
              <TouchableOpacity
                style={styles.Restore}
                onPress={() => this.restorePurchase()}>
                <Text style={styles.textRestore}>Restore</Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' && (
              <View
                showsVerticalScrollIndicator={false}
                style={styles.termContainer}>
                <View>
                  <Text style={styles.termsText}>iTunes Terms</Text>
                  <Text style={styles.termTexts}>
                    Payment will be charged to iTunes Account at confirmation of
                    purchase. Subscription automatically renews unless
                    auto-renew is turned off at least 24-hours before the end of
                    the current period.Account will be charged for renewal
                    within 24-hours prior to the end of the current period.
                    Subscription may be managed and auto-renewal may be turned
                    off by going to the iTunes Account settings after purchase.
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        'https://www.electronicvillage.org/mohammedsuwaidi.php?pageid=26&languageid=2',
                      )
                    }>
                    <Text style={styles.linkText}>
                      Privacy Policy and Terms of use
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {this.state.isVisible && (
              <Modal
                isVisible={this.state.isVisible}
                // onSwipeComplete={() => this.setState({ visibleModal: null })}
                hasBackdrop={true}
                backdropOpacity={0.02}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                backdropTransitionOutTiming={0}
                animationInTiming={1000}
                onBackButtonPress={() => this.setState({isVisible: false})}
                onBackdropPress={() => this.setState({isVisible: false})}
                animationOutTiming={1000}
                style={styles.bottomModal}>
                <View style={styles.KeyboardViewContainer}>
                  {this.renderModalPassword()}
                </View>
              </Modal>
            )}
          </ScrollView>
        ) : (
          <BarIndicator
            style={{backgroundColor: 'transparent'}}
            color={PRIMARY_COLOR}
            size={34}
          />
        )}
      </SafeAreaView>
    );
  }

  componentWillUnmount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
  }
}

function mapStatetoProps(state) {
  return {
    popularDocumentList: state.dashboard.popularDocumentList,
    user: state.userLogin.user,
  };
}

export default connect(mapStatetoProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1.2,
    backgroundColor: '#fff',
  },
  wrap: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    alignItems: 'center',
    // backgroundColor:'#fff'
  },
  content: {
    height: 250,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 24,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    paddingBottom: 5,
    lineHeight: 26,
  },
  subHeader: {
    fontSize: 16,
    fontFamily: FONT_REGULAR,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  wrapper: {
    // marginLeft: '5%',
    // backgroundColor:'red',
    width: '100%',
    flex: 4,
  },
  swiper: {
    justifyContent: 'space-around',
  },
  pagination: {
    position: 'absolute',
    bottom: -10,
  },
  month: {
    flex: 1,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: {height: 1},
    shadowOpacity: 0.3,
    borderRadius: 6,
    backgroundColor: '#fff',
    margin: 15,
  },
  imageContainer: {
    flex: 3,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    overflow: 'hidden',
  },
  img: {
    height: 180,
    width: 180,
    resizeMode: 'stretch',
  },
  contentContainer: {
    flex: 6,
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-evenly',
  },
  textMonth: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: FONT_PRIMARY,
    color: TITLE_COLOR,
    marginBottom: 5,
  },
  amount: {
    fontSize: 19,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    // lineHeight: 5,
    paddingTop: 5,
  },
  per: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONT_PRIMARY,
    color: TITLE_COLOR,
    paddingBottom: 5,
    lineHeight: 0,
  },
  access: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  billed: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: FONT_PRIMARY,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  explanation: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONT_PRIMARY,
    color: PRIMARY_COLOR,
    marginTop: 10,
    marginBottom: 10,
  },
  promo: {
    // width: 25,
    backgroundColor: '#5ba661',
    padding: 10,
    paddingHorizontal: 8,
    borderRadius: 15,
    // borderTopRightRadius: 15,
    // borderBottomRightRadius: 15,
    marginBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    width: '100%',
    alignItems: 'center',
  },
  closeContain: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  emptyView: {
    height: 10,
  },
  buy: {
    width: '75%',
    backgroundColor: '#FFC300',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 10,
  },
  Restore: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 20,
    width: 170,
    marginTop: 10,
    marginBottom: 5,
  },
  textPromo: {
    fontSize: 14,
    color: TITLE_COLOR,
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1,
  },
  textBuy: {
    fontSize: 17,
    color: TITLE_COLOR,
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1,
  },
  textRestore: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    letterSpacing: 1.5,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    height: 42,
  },
  headerRightContainer: {
    paddingRight: 15,
    paddingLeft: 15,
  },
  closeContainer: {
    marginRight: 28,
  },
  closeIconContainer: {
    alignItems: 'flex-end',
  },
  validityInfo: {
    marginTop: 15,
  },
  restoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  restoreInfoContainer: {
    textAlign: 'center',
    width: '100%',
    color: '#514F4F',
    fontFamily: FONT_REGULAR,
  },
  termsText: {
    textAlign: 'center',
    paddingBottom: 5,
    fontFamily: FONT_BOLD,
  },
  termContainer: {
    // height: '10%',
    flex: 1,
    marginTop: 25,
  },
  termTexts: {
    textAlign: 'center',
    fontFamily: FONT_REGULAR,
    paddingBottom: 5,
  },
  linkText: {
    textAlign: 'center',
    fontFamily: FONT_REGULAR,
    color: 'blue',
    textDecorationLine: 'underline',
    paddingBottom: 5,
  },
  modal: {
    marginVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '70%',
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  promoInputView: {
    flexDirection: 'row',
    backgroundColor: '#daf5e1',
    height: 40,
    width: '80%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'space-between',
    // marginBottom:10
  },
  promocodeInput: {
    // backgroundColor: '#daf5e1',
    // backgroundColor: '#5ba661',
    height: 40,
    width: '80%',
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 15,
    // borderRadius: 15,
    paddingLeft: 10,
    paddingRight: 1,
    textAlign: 'left',
  },
  subscribButton1: {
    height: 40,
    width: '80%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFC300',
    marginTop: 10,
  },
  subscribButton2: {
    height: 40,
    width: '80%',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  premiumButton: {
    padding: 5,
  },
  bottomModal: {
    marginBottom: 0,
    justifyContent: 'flex-end',
  },
  KeyboardViewContainer: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderTopRightRadius: 45,
    borderTopLeftRadius: 45,
    height: 300,
  },
  contents: {
    padding: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalSelectionContent1: {
    borderTopWidth: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#D7DBDD',
    paddingVertical: 5,
    height: 55,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 18,
    padding: 8,
    fontFamily: FONT_REGULAR,
    color: TITLE_COLOR,
  },
  modalTitle: {
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    paddingBottom: 15,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
  },
});
