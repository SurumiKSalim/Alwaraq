import React, {Component} from 'react';
import {
  View,
  Linking,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import Demo from '../../../mockData/homeData';
import images from '../../../assets/images';
import {PRIMARY_COLOR} from '../../../assets/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_LIGHT,
} from '../../../assets/fonts';
import Images from '../../../assets/images';
import {connect} from 'react-redux';
import ModalDropdown from 'react-native-modal-dropdown';
import I18n from '../../../i18n';
import Api from '../../../common/api';
import {BUY_NOW, SHOPPING_CART} from '../../../common/endpoints';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {fetchCountryList, fetchShippingInfos} from '../actions';
import Fontisto from 'react-native-vector-icons/Fontisto';
import {act} from 'react-test-renderer';
import LinearGradient from 'react-native-linear-gradient';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';

const SECONDARY_COLOR = '#3E525E';
var categoryList = [
  {label: 'Buy_Ebook', key: 'price', value: 1},
  {label: 'Buy_Audio_Book', key: 'price', value: 4},
  {label: 'Buy_Hard_Cover', key: 'hardcoverprice', value: 2},
  {label: 'Buy_Ebook_Hard_Cover', key: 'hardcoverAndPdfPrice', value: 3},
];
var Qty = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
var cartText = 'Add to cart';
const {height, width} = Dimensions.get('screen');
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: (
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={Images.headerName}
            resizeMode="contain"
          />
        </View>
      ),
      headerRight: (
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() => params.this.props.navigation.navigate('Cart')}>
            <Ionicons
              name="cart-outline"
              style={styles.iconContainer}
              size={26}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>
        </View>
      ),
      headerTitleStyle: {},
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 60,
      },
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.navigation.getParam('data', null),
      buyDetails: [],
      buyOption: 1,
      prePurchaseUrl: '',
      index: this.props.navigation.getParam('index', 0),
      promoCode: null,
      paymentMethods: 1,
      paymentLink: '',
      errors: {},
      isLoading: false,
      quantity: 1,
      orderId: null,
      orderReference: null,
      secureUrlPayment: null,
    };
    this.fetchData = this.fetchData.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.addressView = this.addressView.bind(this);
    this.priceView = this.priceView.bind(this);
    this.isvaildData = this.isvaildData.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.buyNow = this.buyNow.bind(this);
    this.purchase = this.purchase.bind(this);
    this._dropdownOnSelect = this._dropdownOnSelect.bind(this);
    // this.onLoad = this.onLoad.bind(this)
  }

  fetchData(action, shippingId) {
    let formdata = new FormData();
    formdata.append('language', this.props.locale == 'ar' ? 1 : 2);
    formdata.append('appId', 1);
    if (shippingId) {
      formdata.append('shippingId', shippingId);
    }
    formdata.append('action', action);
    this.props.dispatch(fetchShippingInfos(formdata));
  }

  purchase() {
    let formData = new FormData();
    formData.append('productId', this.state.data && this.state.data.bookid);
    formData.append('unique', Date.now());
    formData.append('returnUrl', 'https://alwaraq.net/home');
    formData.append(
      'amount',
      this.state.buyDetails && this.state.buyDetails.totalPrice,
    );
    formData.append('productName', this.state.data && this.state.data.name);
    formData.append('orderId', this.state.orderId);
    Api('post', this.state.prePurchaseUrl, formData).then(response => {
      this.setState({isLoading: false});
      if (response.statusCode === 200) {
        this.setState({
          orderReference: response.orderReference,
          secureUrlPayment: response.secureUrlPayment,
        });
        this.buyNow('orderUpdate');
      }
    });
  }

  buyNow(action) {
    let totalPrice = this.state.buyDetails && this.state.buyDetails.totalPrice;
    this.setState({isLoading: true});
    let data = this.state.data;
    let shippingId =
      this.props.shipping &&
      this.props.shipping[0] &&
      this.props.shipping[0].shippingId;
    if (this.props.shipping && this.props.shipping[this.state.index]) {
      shippingId =
        this.props.shipping &&
        this.props.shipping[this.state.index] &&
        this.props.shipping[this.state.index].shippingId;
    }
    if (data) {
      let formData = new FormData();
      formData.append('action', action ? action : 'buyNow');
      formData.append('productId', data.bookid);
      formData.append('productType', parseInt(this.state.buyOption));
      formData.append('quantity', parseInt(this.state.quantity));
      formData.append('refCode', this.state.promoCode);
      formData.append('orderId', this.state.orderId);
      formData.append('orderReference', this.state.orderReference);
      formData.append('language', this.props.locale == 'ar' ? 1 : 2);
      formData.append(
        'shippingId',
        this.state.buyOption == 1 ? null : shippingId,
      );

      Api('post', BUY_NOW, formData).then(response => {
        this.setState({isLoading: false});
        if (response.statusCode === 200) {
          if (action == 'orderNow') {
            this.setState({orderId: response.orderId});
            this.purchase();
          } else if (action == 'orderUpdate') {
            this.props.navigation.navigate('PaymentWebView', {
              secureUrlPayment: this.state.secureUrlPayment,
              orderId: this.state.orderId,
              productType: this.state.buyOption,
              totalPrice: totalPrice,
              refCode: this.state.promoCode,
            });
          } else {
            setTimeout(() => {
              this.setState({
                buyModel: true,
                buyDetails: response,
                paymentMethods:
                  response &&
                  response.paymentMethods &&
                  response.paymentMethods[0] &&
                  response.paymentMethods[0].id,
                prePurchaseUrl:
                  response &&
                  response.paymentMethods &&
                  response.paymentMethods[0] &&
                  response.paymentMethods[0].link,
              });
            }, 500);
          }
        }
      });
    }
  }

  componentDidUpdate(pervProps, prevStates) {
    if (prevStates.buyOption != this.state.buyOption) {
      this.buyNow();
    }
    if (prevStates.quantity != this.state.quantity) {
      this.buyNow();
    }
    if (pervProps.shipping != this.props.shipping) {
      this.buyNow();
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
    });
    const {navigation} = this.props;
    this.fetchData();
    this.buyNow();
    this.focusListener = navigation.addListener('didFocus', () => {
      this.setState({index: this.props.navigation.getParam('index', 0)});
    });
    // I18nManager.forceRTL(true);
  }

  addressView(item, index) {
    return (
      <TouchableOpacity style={styles.cardGrid}>
        <Text style={styles.nameText1}>{I18n.t('Shipping_Address')}</Text>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.addText}>{item.shippingAddress1}</Text>
        <Text style={styles.addText}>{item.shippingAddress2}</Text>
        <Text style={styles.addText}>Country:{item.country}</Text>
        <Text style={styles.addText}>Email Id:{item.email}</Text>
        <Text style={styles.addText}>Mobile No:{item.mobile}</Text>
        <Text style={styles.addText}>Telephone No:{item.telephone}</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('AddressManager', {
                fromPurchase: true,
              })
            }
            style={styles.remove}>
            <Text style={styles.removeText}>{I18n.t('Change_Address')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.fetchData('delete', item.shippingId)}
            style={styles.remove}>
            <Text style={styles.removeText}>{I18n.t('Remove')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  priceView() {
    var data = this.state.data;
    var buyDetails = this.state.buyDetails;
    let price =
      this.state.buyOption == 1
        ? parseFloat(data.price)
        : parseFloat(data.hardcoverprice);
    return (
      <TouchableOpacity style={styles.cardGrid}>
        <Text style={styles.nameText}>{I18n.t('Price_Detail')}</Text>
        <View style={styles.priceContainer}>
          <View style={styles.priceSubContainer}>
            <Text style={styles.addText}>{I18n.t('Price')} </Text>
            <Text style={[styles.addText, {textAlign: 'right'}]}>
              ${this.format_money(parseInt(this.state.quantity) * price)}{' '}
            </Text>
          </View>
          <View style={styles.priceSubContainer}>
            <Text style={styles.addText}>{I18n.t('Discount')}</Text>
            <Text
              style={[styles.addText, {textAlign: 'right', color: 'green'}]}>
              -${this.format_money(buyDetails?.discountPrice)}
            </Text>
          </View>
          <View style={styles.priceSubContainer}>
            <Text style={styles.addText}>{I18n.t('Delivery_Charge')}</Text>
            <Text style={[styles.addText, {textAlign: 'right'}]}>
              +${this.format_money(buyDetails?.shippingCost)}
            </Text>
          </View>
          <View style={styles.priceSubContainer}>
            <Text style={styles.addText}>{I18n.t('Tax')}</Text>
            <Text style={[styles.addText, {textAlign: 'right'}]}>
              +${this.format_money(buyDetails?.tax)}
            </Text>
          </View>
          <View style={styles.priceSubContainer}>
            <Text style={styles.addText}>{I18n.t('Amount_payable')}</Text>
            <Text style={[styles.addText, {textAlign: 'right'}]}>
              ${this.format_money(buyDetails?.totalPrice)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  addToCart() {
    cartText = 'Adding to cart';
    this.setState({isLoading: true});
    let quantity = parseInt(this.state.quantity);
    let formdata = new FormData();
    formdata.append('action', 'add');
    formdata.append('productId', this.state.data?.bookid);
    formdata.append('productType', parseInt(this.state.buyOption));
    formdata.append('language', this.state.locale == 'ar' ? 1 : 2);
    formdata.append('quantity', quantity);
    formdata.append('appId', 1);
    Api('post', SHOPPING_CART, formdata).then(async response => {
      if (response?.statusCode == 200) {
        cartText = 'Add to cart';
        Alert.alert('Added to cart', 'Product is updated in cart', [
          {
            text: 'View Cart',
            onPress: () => this.props.navigation.navigate('Cart'),
            style: 'cancel',
          },
          {text: 'OK'},
        ]);
      } else {
        Alert.alert(
          'Sorry. Something Went wrzzzng',
          'Try again after sometime',
          [{text: 'OK'}],
        );
      }
      this.setState({isLoading: false});
    });
  }

  addCartView() {
    return (
      <TouchableOpacity
        onPress={() => this.addToCart()}
        style={styles.cartView}>
        <Text style={styles.cartText}>{cartText}</Text>
      </TouchableOpacity>
    );
  }

  isvaildData() {
    // if (this.state.buyOption == '' || this.state.buyOption == null) {
    //     this.setState({ errors: { ...this.state.errors, buyOptionError: true } })
    //     return false;
    // }
    if (
      this.state.buyOption != 1 &&
      this.props.shipping &&
      this.props.shipping.length == 0
    ) {
      this.setState({errors: {...this.state.errors, addressError: true}});
      return false;
    }
    if (this.state.buyOption == 0) {
      this.setState({errors: {...this.state.errors, radioError: true}});
      return false;
    }
    return true;
  }

  onSubmit() {
    this.setState({errors: {}}, () => {
      if (!this.isvaildData()) {
        return 0;
      } else {
        if (this.state.paymentMethods == 1) {
          this.buyNow('orderNow');
        } else if (this.state.paymentMethods == 2) {
          Alert.alert(
            'Coming Soon',
            'Sorry! This feature will be available soon.',
            '',
            [{text: 'OK'}],
            {cancelable: false},
          );
        } else if (this.state.paymentLink) {
          Linking.openURL(this.state.paymentLink);
        }
      }
    });
  }

  changeVisibility(state) {
    this.setState({
      isVisibleA: false,
      isVisibleB: false,
      ...state,
    });
  }

  _dropdownOnSelect(idx, value) {
    this.setState({quantity: value});
  }

  format_money(amount) {
    return (Math.round(amount * 100) / 100)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    var data = this.state.data;
    let price =
      data.price != 0
        ? data.price
        : data.hardcoverprice != 0
        ? data.hardcoverprice
        : data.hardcoverAndPdfPrice;
    var buyDetails = this.state.buyDetails;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={{zIndex: 20}}
          scrollEventThrottle={1}
          showsVerticalScrollIndicator={false}>
          <View style={{flexDirection: 'row'}}>
            <LinearGradient
              style={styles.card}
              colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
              <Image
                style={styles.card}
                source={
                  data && data.coverImage
                    ? {uri: data.coverImage}
                    : Images.default
                }
              />
            </LinearGradient>
            <View style={{marginLeft: 8}}>
              <Text style={styles.nameText}>{data && data.name}</Text>
              <Text numberOfLines={1} style={styles.authorNameText}>
                {data && data.author}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 20,
            }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: width - 190,
                }}>
                <Text numberOfLines={1} style={styles.addText}>
                  {I18n.t('Price')}
                </Text>
                <Text numberOfLines={1} style={styles.addText}>
                  : $ {price}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: width - 190,
                }}>
                <Text numberOfLines={1} style={styles.addText}>
                  {I18n.t('weight')}
                </Text>
                <Text numberOfLines={1} style={styles.addText}>
                  : {data.weightkgs == 0 ? 'N/A' : data.weightkgs + ' Kg'}
                </Text>
              </View>
            </View>
            <ModalDropdown
              options={Qty}
              scrollEnabled={true}
              style={styles.drop}
              dropdownStyle={styles.dropdown}
              dropdownTextStyle={styles.dropDownText}
              dropdownTextHighlightStyle={styles.highlighted}
              onSelect={(idx, value) => this._dropdownOnSelect(idx, value)}>
              <View style={styles.category}>
                <Text style={styles.input}>
                  {I18n.t('Qty')} : {this.state.quantity}
                </Text>
                <AntDesign name="down" size={24} color="#707070" />
              </View>
            </ModalDropdown>
          </View>
          {data &&
            categoryList.map(item => {
              if (data && data[item.key] != 0) {
                return (
                  <TouchableOpacity
                    onPress={() => this.setState({buyOption: item.value})}
                    style={styles.typeContainer}>
                    <Text style={styles.highlighted2}>
                      {I18n.t(item.label)} {data && data[item.key]}
                    </Text>
                    <Fontisto
                      name={
                        this.state.buyOption == item.value
                          ? 'radio-btn-active'
                          : 'radio-btn-passive'
                      }
                      size={20}
                      color={PRIMARY_COLOR}
                    />
                  </TouchableOpacity>
                );
              } else {
                return null;
              }
            })}
          {this.state.errors.radioError &&
            this.state.errors.radioError == true && (
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>Selection Required</Text>
              </View>
            )}
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.searchText}
              placeholder={I18n.t('Apply_Discount_Code')}
              ref={ref => (this.textInputRef = ref)}
              placeholderTextColor={'#9c9c9c'}
              bufferDelay={5}
              onChangeText={text => this.setState({promoCode: text})}
            />
            <View>
              <TouchableOpacity
                onPress={() => this.buyNow()}
                style={styles.buyContainer}>
                <Text style={styles.buyText}>{I18n.t('Apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.buyOption != 1 && this.state.buyOption != 4 && (
            <View>
              {this.props.shipping && this.props.shipping.length != 0 ? (
                this.addressView(
                  this.props.shipping[this.state.index]
                    ? this.props.shipping[this.state.index]
                    : this.props.shipping[0],
                )
              ) : (
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('AddressManager', {
                      addressEditor: 0,
                    })
                  }
                  style={styles.addContainer}>
                  <Text style={styles.addContainerText}>
                    {I18n.t('Add_a_Address')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {this.state.errors.addressError &&
            this.state.errors.addressError == true && (
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>
                  {I18n.t('Address_Required')}
                </Text>
              </View>
            )}
          {this.priceView()}
          {buyDetails &&
            buyDetails.paymentMethods &&
            buyDetails.paymentMethods.map(item => {
              return (
                <View>
                  <Text style={styles.highlighted3}>{item.description}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({
                        paymentMethods: item.id,
                        paymentLink: item.link,
                        prePurchaseUrl: item.link,
                      })
                    }
                    style={[styles.typeContainer, {marginTop: 4}]}>
                    <Text style={styles.highlighted2}>{item.name}</Text>
                    <Fontisto
                      name={
                        this.state.paymentMethods == item.id
                          ? 'radio-btn-active'
                          : 'radio-btn-passive'
                      }
                      size={20}
                      color={PRIMARY_COLOR}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          <View style={{marginBottom: 20}} />
        </ScrollView>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.price}>
              ${' '}
              {this.state.buyDetails?.totalPrice
                ? this.format_money(this.state.buyDetails.totalPrice)
                : this.format_money(price)}
            </Text>
            <Text style={styles.aedPrice}>
              AED {this.format_money(this.state.buyDetails?.totalPriceAED)}
            </Text>
          </View>
          {this.addCartView()}
          <TouchableOpacity
            onPress={() => this.onSubmit()}
            style={styles.continue}>
            <Text style={styles.submit}>{I18n.t('Continue')}</Text>
          </TouchableOpacity>
        </View>
        {(this.props.isLoading || this.state.isLoading) && (
          <BarIndicator
            style={styles.loaderContainer}
            color={PRIMARY_COLOR}
            size={34}
          />
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    locale: state.userLogin.locale,
    country: state.address.country,
    shipping: state.address.shipping,
    isLoading: state.address.isLoading,
    isCountryLoading: state.address.isCountryLoading,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerRightContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  addContainer: {
    backgroundColor: '#ededed',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addContainerText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: FONT_REGULAR,
    fontSize: 18,
  },
  addContainerText2: {
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: FONT_REGULAR,
    fontSize: 18,
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: SECONDARY_COLOR,
    padding: 0,
    margin: 0,
  },
  // dropDownText: {
  //     paddingVertical: 7,
  //     fontSize: 16,
  //     fontFamily: FONT_SEMIBOLD,
  //     color: SECONDARY_COLOR,
  //     opacity: .9,
  // },
  dropDownContainer: {
    backgroundColor: '#ededed',
    borderColor: SECONDARY_COLOR,
    marginVertical: 8,
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  nameText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
  },
  qtyText: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
  },
  nameText1: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
  },
  addText: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    flex: 1,
  },
  cardGrid: {
    borderWidth: 0.5,
    padding: 10,
    borderColor: '#9c9c9c',
    shadowOpacity: 0.1,
    borderRadius: 4,
    shadowOffset: {width: 1, height: 1},
    backgroundColor: '#fff',
    marginTop: 5,
    marginBottom: 10,
  },
  remove: {
    borderWidth: 0.5,
    alignItems: 'center',
    padding: 5,
    borderColor: '#9c9c9c',
    borderRadius: 4,
    backgroundColor: '#ededed',
    marginVertical: 5,
    alignSelf: 'flex-end',
  },
  removeText: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
  },
  defaultText: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
    color: PRIMARY_COLOR,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTextContainer: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    color: 'red',
  },
  authorNameText: {
    fontSize: 15,
    fontFamily: FONT_REGULAR,
    opacity: 0.6,
    width: '80%',
  },
  searchText: {
    fontSize: 18,
    fontFamily: FONT_REGULAR,
    color: SECONDARY_COLOR,
    backgroundColor: '#fff',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: .15,
    // elevation: 1,
    flex: 0.9,
    height: 35,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  buyContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    shadowOpacity: 0.2,
  },
  textInputContainer: {
    marginBottom: 10,
    marginTop: 15,
    margin: 2,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.05,
    borderWidth: 0.5,
    borderColor: SECONDARY_COLOR,
    height: 45,
  },
  buyText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  priceContainer: {
    borderTopWidth: 0.5,
    borderColor: SECONDARY_COLOR,
  },
  priceSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bottomBar: {
    height: 60,
    backgroundColor: '#fff',
    marginHorizontal: -15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.1,
    elevation: 1,
  },
  submit: {
    width: '80%',
    backgroundColor: PRIMARY_COLOR,
    textAlign: 'center',
    color: '#fff',
    fontFamily: FONT_MEDIUM,
    paddingVertical: 15,
    borderRadius: 8,
  },
  continue: {
    height: 45,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  price: {
    fontFamily: FONT_BOLD,
    fontSize: 18,
    marginHorizontal: 15,
  },
  aedPrice: {
    fontFamily: FONT_LIGHT,
    fontSize: 12,
    marginHorizontal: 15,
  },
  qtyContainer: {
    backgroundColor: '#ededed',
    flexDirection: 'row',
    width: 180,
    alignSelf: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 5,
  },
  dropdown: {
    right: 15,
    height: 120,
  },
  dropDownText: {
    marginVertical: 5,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    color: SECONDARY_COLOR,
    opacity: 0.9,
    textAlign: 'center',
  },
  drop: {
    width: 120,
    marginVertical: 5,
    backgroundColor: '#ededed',
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderWidth: 0.5,
    borderColor: '#9c9c9c',
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 15,
  },
  highlighted: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    color: SECONDARY_COLOR,
  },
  highlighted2: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    color: SECONDARY_COLOR,
  },
  highlighted3: {
    paddingTop: 10,
    // paddingLeft: 10,
    fontSize: 14,
    fontFamily: FONT_LIGHT,
    color: SECONDARY_COLOR,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ededed',
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: '#9c9c9c',
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width - 30,
    zIndex: 20,
  },
  cartView: {
    height: 45,
    borderColor: PRIMARY_COLOR,
    marginVertical: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cartText: {
    color: PRIMARY_COLOR,
    fontSize: 14,
    fontFamily: FONT_REGULAR,
    paddingHorizontal: 6,
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: 7,
  },
});
