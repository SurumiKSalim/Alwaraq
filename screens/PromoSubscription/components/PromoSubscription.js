import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Image, Linking, Text, StatusBar, ScrollView, Platform, Alert, TextInput } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { SafeAreaView } from 'react-navigation'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import { PRIMARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_PRIMARY, FONT_MEDIUM, FONT_REGULAR, FONT_SEMIBOLD, FONT_BOLD } from '../../../assets/fonts'
import RNIap, { purchaseUpdatedListener, purchaseErrorListener, requestPurchaseWithOfferIOS,acknowledgePurchaseAndroid } from 'react-native-iap'
import { connect } from 'react-redux'
import Modal from "react-native-modal"
import { addSubscrition } from './../../login/actions'
import I18n from '../../../i18n'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { PRIVACY_POLICY, PROMO_CODE, PROMO_COUNTER, PREMIUM_SUBSCRIPTION } from '../../../common/endpoints'

// const SubscribeItems = Platform.select({
//     ios: ['org.evillage.MotanabbiYearlyDiscount'],
//     android: ['org.evillage.motanabbiyearlydiscounted']
// });

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

class App extends Component {

    static navigationOptions = {
        header: null
        // return {
        //     headerStyle: {
        //         borderBottomWidth: 0,
        //         elevation: 0
        //     },
        //     headerTitle: (
        //         <View style={styles.headerTitleContainer}>
        //             {/* <Text style={{ fontSize: 40, fontFamily: FONT_PRIMARY, color: PRIMARY_COLOR, fontWeight: 'bold', }}>Hawaya</Text> */}
        //         </View>
        //     ),
        //     headerRight: (
        //         <View style={styles.headerRightContainer} />
        //     ),
        //     headerLeft: (
        //         <View style={styles.headerRightContainer} />
        //     )
        // }
    }

    constructor(props) {
        super(props)
        this.state = {
            isSubscribing: false,
            subscritionType: 0,
            products: null,
            sku: null,
            index: 0,
            isVisiblePromo: false,
            refCode: this.props.navigation.getParam('Ref', ''),
            promocode: this.props.navigation.getParam('Promo', ''),
            promoValidate: false,
            approved: false,
            couponResponse: []
        }
        this.getSubscriptionsAmount = this.getSubscriptionsAmount.bind(this)
        this.addPromo = this.addPromo.bind(this)
        this.restorePurchase = this.restorePurchase.bind(this)
        this.goBack = this.goBack.bind(this)
        this.productDetails = this.productDetails.bind(this)
        console.log('id', this.props.navigation.getParam('Promo', null))
    }
    goBack() {
    }

    async componentDidMount() {
            console.log('sjnfghg22')
            this.promoVerification(this.state.promocode)
        SplashScreen.hide()
        // try {
        //     const result = await RNIap.initConnection();
        //     const products = await RNIap.getSubscriptions(SubscribeItems);
        //     this.setState({ products: products })
        //     console.log('products', products)

        //     const purchases = await RNIap.getAvailablePurchases();
        //     if (purchases && purchases.length > 0)
        //         this.setState({ isSubcribeMemember: true });


        // } catch (err) {
        //     console.warn('err', err); // standardized err.code and err.message available
        // }

        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
            this.setState({ isSubscribing: false })
            this.props.dispatch(addSubscrition())
            this.props.navigation.navigate('Home')
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                try {
                    // if (Platform.OS === 'ios') {
                    //   finishTransactionIOS(purchase.transactionId);
                    // } else 
                    if (Platform.OS === 'android') {
                      // If consumable (can be purchased again)
                    //   consumePurchaseAndroid(purchase.purchaseToken);
                      // If not consumable
                      acknowledgePurchaseAndroid(purchase.purchaseToken);
                    }
                    // const ackResult = await finishTransaction(purchase);
                } catch (ackErr) {
                    console.warn('ackErr', ackErr);
                }
            }
        })

        purchaseErrorSubscription = purchaseErrorListener((error) => {
            this.setState({ isSubscribing: false })
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

    addPromo(product) {
        let promocd = this.state.promocode
        let formdata = new FormData()
        formdata.append('action', 'add')
        formdata.append('appId', 1)
        formdata.append('discountCode', this.state.promocode)
        formdata.append('refCode', this.state.refCode)
        formdata.append('subscriptionId', product.subscriptionId)
        Api('post', PROMO_COUNTER, formdata)
            .then((response) => {
                console.log('count', response)
            })
    }

    promoVerification(promocd) {
        if (this.state.promocode == null || this.state.promocode == '') {
            this.setState({ promoValidate: true, promocode: null })
        }
        else {
            console.log('ksfhj')
            let formdata = new FormData()
            formdata.append('appId', 1)
            formdata.append('discountCode', this.state.promocode)
            formdata.append('refCode', this.state.refCode)
            Api('post', PREMIUM_SUBSCRIPTION, formdata)
                .then((response) => {
                    if (response.status == true) {
                        console.log('resp', response.info)
                        let sku = Platform.OS === 'ios' ? response.info[0].iosProductId : response.android_inapp_productId
                        let sku_year = Platform.OS === 'ios' ? response.info[1].iosProductId : response.android_inapp_productId
                        if (response.isCodeValid) {
                            console.log('222jgdfhghjaskhjfgvhjkkljdkh')
                            this.productDetails(sku, sku_year)
                            this.setState({ couponResponse: response, sku: [sku, sku_year], isVisiblePromo: false, approved: true })
                        }
                        else {
                            console.log('jgdfhghjaskhjfgvhjkkljdkh')
                            setTimeout(() => {
                                Alert.alert(
                                    '',
                                    'Invalid promo code',
                                    [
                                        { text: 'OK', onPress: () => this.props.navigation.goBack() },
                                    ],
                                    { cancelable: false }
                                )
                            }, 350)
                            // alert('Invalid promo code')
                        }
                    }
                    else
                        // alert('Promo is unavailable')
                        Alert.alert(
                            '',
                            'This PromoCode is unavailable',
                            [
                                { text: 'OK', onPress: () => this.props.navigation.goBack() },
                            ],
                            { cancelable: false }
                        )
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    productDetails = async (sku, sku_year) => {
        console.log('producr sku', [sku, sku_year])
        try {
            const result = await RNIap.initConnection();
            const products = await RNIap.getSubscriptions([sku, sku_year]);
            this.setState({ products: products })
            const purchases = await RNIap.getAvailablePurchases();
            if (purchases && purchases.length > 0)
                this.setState({ isSubcribeMemember: true });


        } catch (err) {
            console.warn('product err', err); // standardized err.code and err.message available
        }
    }

    buySubscribeItem = async (sku, index) => {
        if (this.props.user) {
            console.log('SKU', sku, this.state.couponResponse.info[index])
            try {
                this.setState({ isSubscribing: true })
                this.addPromo(this.state.couponResponse.info[index])
                const purchase = await RNIap.requestSubscription(sku);
                //Success
            } catch (err) {
                this.setState({ isSubscribing: false })
            }
        }
        else{
            Alert.alert(
                '',
                'Login is required for Discounted Subscription. Please login first then come back',
                [
                    { text: 'Login', onPress: () => this.props.navigation.navigate('Login') },
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                      },
                ],
                { cancelable: false }
            )
        }
    }

    getSubscriptionsAmount(index) {
        let amount = this.state.products && this.state.products.length > 0 && this.state.products[index] && this.state.products[index].localizedPrice
        return amount
    }

    restorePurchase = async () => {
        try {
            const purchases = await RNIap.getAvailablePurchases()
            if (purchases.length > 0) {
                this.props.dispatch(addSubscription())
                Alert.alert(
                    '',
                    'Restore Successful',
                    [
                        { text: 'OK', onPress: () => this.props.navigation.goBack() },
                    ],
                    { cancelable: false }
                )
            }
        } catch (err) {
            console.warn(err) // standardized err.code and err.message available
            Alert.alert('No Subscription Found !')
        }
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.closeContainer}>
                    <TouchableOpacity style={styles.closeIconContainer} onPress={() => this.props.navigation.goBack()}>
                        <AntDesign name='closecircleo' size={30} color='black' />
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Image source={Images.subscribe} style={styles.img} />
                        <Text style={styles.subHeader}>Get access with special price</Text>
        {/* <Text style={styles.subHeader}>{this.state.refCode},{this.state.promocode}</Text> */}
                    </View>
                    <View style={styles.wrapper}>
                        <View style={styles.month}>
                            <View style={styles.contentContainer}>
                                <View>
                                    <Text style={styles.textMonth}>1 Month</Text>
                                </View>
                                <View>
                                    <Text style={styles.amount}>{!this.state.approved && 'LOADING . . .'} {this.getSubscriptionsAmount(0)}{this.state.approved && I18n.t("per_month")}</Text>
                                </View>
                                <View style={styles.validityInfo}>
                                    <Text style={styles.access}>{I18n.t("Full_Access")}</Text>
                                    <Text style={styles.billed}>{this.getSubscriptionsAmount(0)} {I18n.t("billed_for_one_month")}</Text>
                                </View>
                                <View style={styles.promoInputContainer}>
                                    {this.state.promoValidate && <Text style={styles.errorText}>* please enterpromocode</Text>}
                                    {this.state.approved &&
                                        <TouchableOpacity style={styles.subscribButton1} onPress={() => this.buySubscribeItem(this.state.sku[0], 0)}>
                                            <Text style={styles.premiumButton}>{this.state.isSubscribing ? 'Please Wait..' : I18n.t("Get_Premium")}</Text>
                                        </TouchableOpacity>}
                                </View>
                            </View>
                        </View>

                        <View style={styles.month}>
                            <View style={styles.contentContainer}>
                                <View>
                                    <Text style={styles.textMonth}>1 YEAR</Text>
                                </View>
                                <View>
                                    <Text style={styles.amount}>{!this.state.approved && 'LOADING . . .'} {this.getSubscriptionsAmount(1)}{this.state.approved && I18n.t("per_year")}</Text>
                                </View>
                                <View style={styles.validityInfo}>
                                    <Text style={styles.access}>{I18n.t("Full_Access")}</Text>
                                    <Text style={styles.billed}>{this.getSubscriptionsAmount(1)} {I18n.t("billed_for_one_year")}</Text>
                                </View>
                                <View style={styles.promoInputContainer}>
                                    {this.state.promoValidate && <Text style={styles.errorText}>* please enterpromocode</Text>}
                                    {this.state.approved &&
                                        <TouchableOpacity style={styles.subscribButton1} onPress={() => this.buySubscribeItem(this.state.sku[1], 1)}>
                                            <Text style={styles.premiumButton}>{this.state.isSubscribing ? 'Please Wait..' : I18n.t("Get_Premium")}</Text>
                                        </TouchableOpacity>}
                                </View>
                            </View>
                        </View>
                    </View>

                    {Platform.OS === 'ios' &&
                        <View showsVerticalScrollIndicator={false} style={styles.termContainer}>
                            <View>
                                <Text style={styles.termsText}>iTunes Terms</Text>
                                <Text style={styles.termTexts}>
                                    Payment  will be charged to iTunes Account at confirmation of purchase. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.Account will be charged for renewal within 24-hours prior to the end of the current period. Subscription may be managed and auto-renewal may be turned off by going to the iTunes Account settings after purchase.
                            </Text>
                                <TouchableOpacity onPress={() => Linking.openURL("https://www.electronicvillage.org/mohammedsuwaidi.php?pageid=26&languageid=2")} >
                                    <Text style={styles.linkText}>Privacy Policy and Terms of use</Text>
                                </TouchableOpacity>
                            </View>
                        </View>}
                    <Modal
                        isVisible={this.state.isVisiblePromo}
                        hideModalContentWhileAnimating={true}
                        animationIn='zoomIn'
                        animationOut='zoomOut'
                        useNativeDriver={true}
                        hideModalContentWhileAnimating={true}
                        animationOutTiming={300}
                        animationInTiming={700}
                        onBackButtonPress={() => this.setState({ isVisiblePromo: false, promoValidate: false, promocode: null })}
                        onBackdropPress={() => this.setState({ isVisiblePromo: false, promoValidate: false, promocode: null })}
                        style={styles.modal}>
                        <View style={styles.modalContainer}>
                            <View style={styles.promoInputView}>
                                <TextInput placeholder={'Apply Promo Code'}
                                    value={this.state.promocode}
                                    onChangeText={(text) => this.setState({ promocode: text, promoValidate: false })}
                                    style={styles.promocodeInput} />
                                <TouchableOpacity
                                    onPress={() => this.setState({ promocode: null, promoValidate: false })}
                                    style={styles.closeContain} >
                                    <AntDesign name='closecircleo' size={30} color='black' />
                                </TouchableOpacity>
                            </View>
                            {this.state.promoValidate && <Text style={styles.errorText}>* please enter any promocode</Text>}
                            <View style={styles.emptyView} />

                            <TouchableOpacity style={styles.subscribButton2} onPress={() => this.promoVerification(this.state.promocode)}>
                                <Text style={styles.premiumButton}>{this.state.isSubscribing ? 'Please Wait..' : I18n.t("Promo_Premium")}</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </ScrollView>
            </SafeAreaView >
        )
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
    return { user: state.userLogin.user }

}

export default connect(mapStatetoProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1.2,
        backgroundColor: '#fff'
    },
    wrap: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 15,
        alignItems: 'center',
        // backgroundColor:'#fff'
    },
    content: {
        height: 200,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    header: {
        fontSize: 24,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
        paddingBottom: 5,
        lineHeight: 26
    },
    subHeader: {
        fontSize: 16,
        fontFamily: FONT_REGULAR,
        color: TITLE_COLOR,
        opacity: .9
    },
    wrapper: {
        // marginLeft: '5%',
        // backgroundColor:'red',
        width: '100%',
        flex: 4,
    },
    swiper: {
        justifyContent: 'space-around'
    },
    pagination: {
        position: 'absolute',
        bottom: -10
    },
    month: {
        flex: 1,
        elevation: 3,
        shadowColor: "black",
        shadowOffset: { height: 1 },
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
        overflow: 'hidden'
    },
    img: {
        height: 180,
        width: 180,
        resizeMode: 'stretch'
    },
    contentContainer: {
        flex: 6,
        alignItems: 'center',
        padding: 15,
        justifyContent: 'space-evenly'
    },
    textMonth: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: FONT_PRIMARY,
        color: TITLE_COLOR,
        marginBottom: 5
    },
    amount: {
        fontSize: 19,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
        // lineHeight: 5,
        paddingTop: 5
    },
    per: {
        fontSize: 12,
        textAlign: 'center',
        fontFamily: FONT_PRIMARY,
        color: TITLE_COLOR,
        paddingBottom: 5,
        lineHeight: 0
    },
    access: {
        fontSize: 14,
        color: PRIMARY_COLOR,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD
    },
    billed: {
        fontSize: 13,
        textAlign: 'center',
        fontFamily: FONT_PRIMARY,
        color: TITLE_COLOR,
        opacity: .9
    },
    explanation: {
        fontSize: 12,
        textAlign: 'center',
        fontFamily: FONT_PRIMARY,
        color: PRIMARY_COLOR,
        marginTop: 10,
        marginBottom: 10
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
        alignItems: 'center'
    },
    errorText: {
        width: '100%',
        alignItems: 'center'
    },
    closeContain: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5
    },
    emptyView: {
        height: 10
    },
    buy: {
        width: '75%',
        backgroundColor: '#FFC300',
        padding: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        marginTop: 10
    },
    Restore: {
        backgroundColor: PRIMARY_COLOR,
        padding: 10,
        borderRadius: 20,
        width: 170,
        marginTop: 10,
        marginBottom: 5
    },
    textPromo: {
        fontSize: 14,
        color: TITLE_COLOR,
        textAlign: 'center',
        fontFamily: FONT_MEDIUM,
        letterSpacing: 1
    },
    textBuy: {
        fontSize: 17,
        color: TITLE_COLOR,
        textAlign: 'center',
        fontFamily: FONT_MEDIUM,
        letterSpacing: 1
    },
    textRestore: {
        fontSize: 16,
        color: '#ffffff',
        textAlign: 'center',
        fontFamily: FONT_MEDIUM,
        letterSpacing: 1.5
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        height: 42
    },
    headerRightContainer: {
        paddingRight: 15,
        paddingLeft: 15
    },
    closeContainer: {
        marginRight: 28
    },
    closeIconContainer: {
        alignItems: 'flex-end'
    },
    validityInfo: {
        marginTop: 15
    },
    restoreContainer: {
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10
    },
    restoreInfoContainer: {
        textAlign: 'center',
        width: '100%',
        color: '#514F4F',
        fontFamily: FONT_REGULAR
    },
    termsText: {
        textAlign: 'center',
        paddingBottom: 5,
        fontFamily: FONT_BOLD
    },
    termContainer: {
        // height: '10%',
        flex: 1,
        marginTop: 25
    },
    termTexts: {
        textAlign: 'center',
        fontFamily: FONT_REGULAR,
        paddingBottom: 5
    },
    linkText: {
        textAlign: 'center',
        fontFamily: FONT_REGULAR,
        color: 'blue',
        textDecorationLine: 'underline',
        paddingBottom: 5
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
        borderRadius: 10
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
        backgroundColor: PRIMARY_COLOR,
        marginTop: 10,
        borderRadius: 15
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
        padding: 5
    },

})
