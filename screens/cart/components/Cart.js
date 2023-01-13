import React, {useEffect, useState, useCallback} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Text,
  View,
  TextInput,
} from 'react-native';
import CartList from '../../../components/CartList';
import Api from '../../../common/api';
import {connect} from 'react-redux';
import {CART_LIST, SHOPPING_CART, BUY_NOW} from '../../../common/endpoints';
import {
  BG_GRAY_COLOR,
  PRIMARY_COLOR,
  TEXT_GRAY_COLOR,
  WHITE_COLOR,
  SECONDARY_COLOR,
} from './../../../assets/color';
import {MaterialIndicator, BarIndicator} from 'react-native-indicators';
import {
  fetchCountryList,
  fetchShippingInfos,
} from '../../AddressManager/actions';
import _ from 'lodash';
import I18n from '../../../i18n';
import {FONT_MEDIUM, FONT_SEMIBOLD, FONT_REGULAR} from '../../../assets/fonts';

const {width, height} = Dimensions.get('window');

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

export const PriceSubView = ({textLabel, children}) => (
  <View style={styles.priceSubContainer}>
    <Text style={styles.addText}>{textLabel}</Text>
    <Text>:</Text>
    <Text style={[styles.addText, {textAlign: 'right'}]}>{children}</Text>
  </View>
);

const App = ({locale, shipping, dispatch, navigation}) => {
  const [data, setData] = useState(null);
  const [priceData, setPrice] = useState(null);
  const [promoCode, setPromoCode] = useState(null);
  const [enablePurchase, setFlag] = useState(false);
  const [isUpdateLoading, setUpdateLoading] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isLastPage, setLastPage] = useState(false);
  const [index, setIndex] = useState(navigation.getParam('index', 0));
  const [page, setPage] = React.useState(1);
  const [counter, setCount] = useState(0);

  const handler = useCallback(
    _.debounce((quantity, item) => onChange(quantity, item, 'add'), 1500),
    [],
  );

  useEffect(() => {
    fetchInfo();
    confirmCart('confirmCart');
    const unsubscribe = navigation.addListener('didFocus', () => {
      resetData();
    });
    return () => {
      unsubscribe.remove();
    };
  }, [navigation]);

  const fetchData = refresh => {
    setLoading(true);
    let formdata = new FormData();
    formdata.append('language', 2);
    formdata.append('appId', 1);
    formdata.append('page', 1);
    Api('post', CART_LIST, formdata).then(response => {
      if (response) {
        if (refresh) {
          setData(response.items);
        } else {
          setData(data.concat(response.items));
        }
        setPage(refresh ? 2 : page + 1);
        setLastPage(response.isLastPage);
      }
      setLoading(false);
    });
  };

  const confirmCart = (action, amount) => {
    let shippingId = shipping && shipping[0] && shipping[0].shippingId;
    if (shipping && shipping[index]) {
      shippingId = shipping && shipping[index] && shipping[index].shippingId;
    }
    setUpdateLoading(true);
    setFlag(false);
    let formdata = new FormData();
    formdata.append('action', action);
    formdata.append('shippingId', shippingId);
    formdata.append('discountCode', promoCode);
    formdata.append('amount', amount ? amount : 0);
    formdata.append('tax', 0);
    formdata.append('appId', 1);
    Api('post', BUY_NOW, formdata).then(async response => {
      setUpdateLoading(false);
      if (response) {
        if (action == 'confirmCart') {
          setPrice(response);
          setFlag(true);
        } else {
          navigation.navigate('PaymentWebView', {
            orderId: response.orderId,
            totalPrice: amount,
            refCode: promoCode,
          });
        }
      }
    });
  };

  const fetchInfo = (action, shippingId) => {
    let formdata = new FormData();
    formdata.append('language', locale == 'ar' ? 1 : 2);
    formdata.append('appId', 1);
    if (shippingId) {
      formdata.append('shippingId', shippingId);
    }
    formdata.append('action', action);
    dispatch(fetchShippingInfos(formdata));
  };

  const onChange = (quantity, item, action) => {
    setUpdateLoading(true);
    setFlag(false);
    let formdata = new FormData();
    formdata.append('action', action ? action : 'add');
    formdata.append('productId', item?.productId);
    formdata.append('language', locale == 'ar' ? 1 : 2);
    formdata.append('quantity', quantity);
    formdata.append('appId', 1);
    Api('post', SHOPPING_CART, formdata).then(async response => {
      setUpdateLoading(false);
      if (response && response.statusCode == 200) {
        if (action == 'delete') {
          let resultArray = _.without(data, item);
          setData(resultArray);
        }
        confirmCart('confirmCart');
      }
      setLoading(false);
    });
  };

  const addItem = (index, action) => {
    let oldObject = data[index];
    let quantity = oldObject.quantity ? oldObject.quantity : 0;
    if (action == 'add') {
      if (quantity < 90) {
        quantity++;
      }
    } else {
      if (quantity > 0) {
        quantity--;
      }
    }
    let newObject = {...oldObject, quantity: quantity};
    let temp = data;
    temp[index] = newObject;
    setData(temp);
    setCount(counter + 1);
    setFlag(false);
    handler(quantity, newObject);
  };

  const onDelete = index => {
    let oldObject = data[index];
    let quantity = oldObject.quantity ? oldObject.quantity : 0;
    onChange(quantity, oldObject, 'delete');
  };

  const addressView = (item, index) => {
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
              navigation.navigate('AddressManager', {fromPurchase: true})
            }
            style={styles.remove}>
            <Text style={styles.removeText}>{I18n.t('Change_Address')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => fetchInfo('delete', item.shippingId)}
            style={styles.remove}>
            <Text style={styles.removeText}>{I18n.t('Remove')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const priceView = () => {
    let total = 0;
    return (
      <TouchableOpacity style={styles.cardGrid}>
        <Text style={styles.nameText}>{I18n.t('Price_Detail')}</Text>
        <View style={styles.priceContainer}>
          <PriceSubView textLabel="ProductPrice">
            USD {priceData?.productPrice}
          </PriceSubView>
          <PriceSubView textLabel="ShippingCost">
            + USD {priceData?.shippingCost}
          </PriceSubView>
          <PriceSubView textLabel={I18n.t('Tax')}>
            + USD {priceData?.tax}
          </PriceSubView>
          <PriceSubView textLabel={I18n.t('Discount')}>- USD 0</PriceSubView>
          <PriceSubView textLabel="Total">
            USD {priceData?.totalPriceUSD}
            {'\n'}
            <Text style={styles.addSubText}>
              (AED {priceData?.totalPriceAed})
            </Text>
          </PriceSubView>
        </View>
      </TouchableOpacity>
    );
  };

  const resetData = () => {
    setData([]);
    fetchData(true);
  };

  const couponView = () => (
    <View style={styles.textInputContainer}>
      <TextInput
        style={styles.searchText}
        placeholder={I18n.t('Apply_Discount_Code')}
        placeholderTextColor={'#9c9c9c'}
        bufferDelay={5}
        onChangeText={text => setPromoCode(text)}
      />
      <View>
        <TouchableOpacity style={styles.buyContainer}>
          <Text style={styles.buyText}>{I18n.t('Apply')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        onMomentumScrollEnd={({nativeEvent}) => {
          if (isCloseToBottom(nativeEvent)) {
            if (!isLastPage && !isLoading) {
              fetchData();
            }
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => resetData()}
            colors={['#F47424']}
          />
        }>
        <CartList
          data={data}
          addItem={addItem}
          onDelete={onDelete}
          action={'CuisinesDetails'}
          isLoading={isLoading}
          counter={counter}
        />
        {data && data.length > 0 && (
          <View style={styles.dataContainer}>
            {couponView()}
            {shipping && shipping.length != 0 ? (
              addressView(shipping[index] ? shipping[index] : shipping[0])
            ) : (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('AddressManager', {addressEditor: 0})
                }
                style={styles.addContainer}>
                <Text style={styles.addContainerText}>
                  {I18n.t('Add_a_Address')}
                </Text>
              </TouchableOpacity>
            )}
            {priceView()}
          </View>
        )}
        {isUpdateLoading && (
          <BarIndicator style={styles.loader} color={PRIMARY_COLOR} size={34} />
        )}
        {!isLastPage && <MaterialIndicator color={PRIMARY_COLOR} size={25} />}
      </ScrollView>
      {data && data.length > 0 && (
        <View style={styles.bottomTab}>
          <View style={styles.bottomTxtContainer}>
            {enablePurchase && (
              <Text style={styles.priceSubTxt}>
                Total : USD {priceData?.totalPriceUSD}
                {'\n'} (AED {priceData?.totalPriceAed} )
              </Text>
            )}
          </View>
          {enablePurchase ? (
            <TouchableOpacity
              onPress={() => confirmCart('orderCart', priceData?.totalPriceAed)}
              style={[styles.bottomButtom, {opacity: 1}]}>
              <Text style={styles.bottomTxt}>Place order</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.bottomButtom, {opacity: 0.5}]}>
              <Text style={styles.bottomTxt}>Place order</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const mapStateToProps = state => {
  return {
    locale: state.userLogin.locale,
    shipping: state.address.shipping,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  scroll: {
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  loader: {
    backgroundColor: 'transparent',
    position: 'absolute',
    alignSelf: 'center',
    height: '100%',
    width: width,
  },
  cardGrid: {
    padding: 10,
    shadowOpacity: 0.2,
    borderRadius: 4,
    elevation: 0.2,
    shadowOffset: {width: 1, height: 1},
    backgroundColor: '#fff',
    marginTop: 5,
    marginBottom: 10,
  },
  nameText: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontSize: 18,
  },
  priceContainer: {
    borderTopWidth: 0.2,
    marginTop: 10,
    borderColor: TEXT_GRAY_COLOR,
  },
  priceSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
  addSubText: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  dataContainer: {
    marginBottom: 50,
  },
  bottomTab: {
    backgroundColor: '#fff',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0.1,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  bottomTxtContainer: {
    flex: 1,
    marginLeft: 10,
  },
  priceSubTxt: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
  },
  bottomButtom: {
    backgroundColor: PRIMARY_COLOR,
    width: 170,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTxt: {
    color: '#fff',
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
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
  buyText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
});
