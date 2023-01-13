import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, TextInput, Text, View, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { FONT_PRIMARY, FONT_MEDIUM, FONT_REGULAR, FONT_SEMIBOLD, FONT_BOLD } from '../../../assets/fonts'
import { PRIMARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { connect } from 'react-redux'
import Images from '../../../assets/images'
import I18n from '../../../i18n'
import Api from '../../../common/api'
import { updateUserSubscrition } from '../../login/actions'
import { ENCRYPTION, SIMBILLING, PROMO_COUNTER, ALWARAQ_PAGES } from '../../../common/endpoints'
import Animation from 'lottie-react-native';
import Modal from 'react-native-modal'
import anim from '../../../assets/animation/success.json';
import AutoHeightWebView from 'react-native-autoheight-webview'
import { HeaderBackButton } from 'react-navigation-stack';
import { BallIndicator, BarIndicator, MaterialIndicator } from 'react-native-indicators';


const { height, width } = Dimensions.get('screen')
const PACKAGE_ID = ["zF+ax1X0w8+4LOzqUdFzfg==", "a4oyyv0IHmx88+mS3U/nGQ=="]

const App = (props) => {

    const [products, setProducts] = useState(props.navigation.getParam('products')[props.navigation.getParam('index')])
    const [SubscribeItems, setSubscribeItems] = useState(props.navigation.getParam('SubscribeItems')[props.navigation.getParam('index')])
    const [index, setIndex] = useState(props.navigation.getParam('index'))
    const [contactNo, setContactNo] = useState(null)
    const [encryptNO, setEncryptNO] = useState(null)
    const [orderId, setOrderId] = useState(null)
    const [encryptOrderId, setEncryptOrderId] = useState(null)
    const [token, setToken] = useState(null)
    const [otp, setOtp] = useState(null)
    const [encryptOtp, setEncryptOtp] = useState(null)
    const [validateError, setValidate] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [isVisible, setModal] = useState(false)
    const [resultInfo, setInfo] = useState(true)
    const [terms, setTerms] = useState('')


    useEffect(() => {
        Api('get', ALWARAQ_PAGES, { language: props.locale == 'ar' ? 1 : 2 }).then((response) => {
            
            if (response) {
                setTerms(response.page && response.page.description)
            }
        })
    }, [])

    const simBill = (encryptdOrderId, encryptdNO, encryptdOtp) => {
        setLoading(true)
        setEncryptOrderId(encryptdOrderId ? encryptdOrderId : encryptOrderId)
        setEncryptOtp(encryptdOtp ? encryptdOtp : otp)
        let formData = new FormData()
        formData.append('action', encryptdOtp ? 'addPin' : 'addPhone');
        formData.append('msisdn', encryptdNO ? encryptdNO : encryptNO);
        formData.append('phoneNumber', contactNo);
        formData.append('packageId', PACKAGE_ID[index]);
        formData.append('txnid', encryptdOrderId ? encryptdOrderId : encryptOrderId);
        formData.append('pin', encryptdOtp ? encryptdOtp : otp);
        formData.append('token', token);
        Api('post', SIMBILLING, formData)
            .then((result) => {
                setLoading(false)
                if (result.statusCode === 200) {
                    if (result.result.substring(0, 7) == 'success') {
                        setLoading(true)
                        const formD = new FormData();
                        formD.append('action', 'orderStatusUpdate')
                        formD.append('orderId', orderId)
                        formD.append('transactionStatusId', '1')
                        formD.append('appId', '1')
                        formD.append('txnId', encryptOrderId)
                        Api('post', PROMO_COUNTER, formD)
                            .then((result) => {
                                setLoading(false)
                                if (result && result.statusCode == 200) {
                                    props.dispatch(updateUserSubscrition(result.isPremium))
                                    setInfo(I18n.t("Payment_success"))
                                    setModal(true)
                                }
                                else {
                                    setValidate("Something Went wrong")
                                }
                            })
                    } else if (result.result.includes("invalidpin")) {
                        setValidate(I18n.t("INVALIED_NO"))
                    }
                    else if (result.result == "") {
                        setValidate("Please check your phone number.!")
                    }
                    else if (result.result.includes("expiredpin")) {
                        setValidate("Pin Expired")
                    }
                    else if (result.result.includes("pin_sent")) {
                        setToken(result.result.substring(result.result.indexOf('|') + 1))
                        setValidate("")
                    }
                    else
                        setValidate("Something Went wrong")
                }
                else {
                    setInfo("Something Went wrong")
                    setModal(true)
                }
            })
    }

    const goBack = () => {
        setModal(false)
        props.navigation.navigate('Home')
    }

    const encoder = (item, index, encryptdNO) => {
        setLoading(true)
        Api('get', ENCRYPTION, { data: item }).then((response) => {
            if (response && response.statusCode == 200) {
                let result = response.result
                switch (index) {
                    case 1:
                        buyNow(result)
                        break;
                    case 2:
                        simBill(result, encryptdNO)
                        break;
                    case 3:
                        simBill(null, null, result)
                        break;
                    default:
                        setLoading(false)
                }
            }
            else setLoading(false)
        })
    }

    const buyNow = (encryptdNO) => {
        setLoading(true)
        setEncryptNO(encryptdNO)
        let formData = new FormData()
        formData.append('action', 'orderNow');
        formData.append('subscriptionId', SubscribeItems.subscriptionId);
        formData.append('appId', 1);
        formData.append('paymentMethodId', props.navigation.getParam('paymentMethodId') ? props.navigation.getParam('paymentMethodId') : 2);
        formData.append('credentials', contactNo);
        Api('post', PROMO_COUNTER, formData)
            .then((response) => {
                if (response.statusCode === 200) {
                    setLoading(false)
                    setOrderId(response.orderId)
                    encoder(response.orderId, 2, encryptdNO)
                    // this.setState({ orderId: response.orderId })
                }
                else setLoading(false)
            })
    }

    const onSubmit = () => {
        if (!isLoading) {
            if (contactNo != null && contactNo != '') {
                setLoading(true)
                setValidate('')
                encoder(contactNo, 1)
            }
            else
                setValidate('* Mobile Number Required')
        }
    }

    const onSubscribe = () => {
        if (!isLoading) {
            if (otp != null && otp != '') {
                setLoading(true)
                setValidate('')
                encoder(otp, 3)
            }
            else
                setValidate('* OTP Required')
        }
    }

    const reSend = () => {
        setOtp(null)
        simBill()
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <HeaderBackButton tintColor={PRIMARY_COLOR} onPress={() => props.navigation.goBack()} />
                <Text style={styles.headerTxt}>{props.navigation.getParam('title')}</Text>
                <View style={{ width: 45 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={Images.subscribe} style={styles.img} />
                <View style={styles.container}>
                    <Text style={styles.title}>{products.title}</Text>
                    <Text style={styles.amount}>{products.localizedPrice}</Text>
                    <Text style={styles.description}>{products.description}</Text>
                    <View style={styles.inputContainer}>
                        {token == null || token == 'Invalid_MSISDN' ?
                            <TextInput
                                placeholder={I18n.t("Mobile_Number")+' (971****)'}
                                placeholderTextColor={'#9c9c9c'}
                                value={contactNo}
                                keyboardType='number-pad'
                                onChangeText={(text) => setContactNo(text)}
                                style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} /> :
                            <TextInput
                                placeholder={'Enter OTP'}
                                placeholderTextColor={'#9c9c9c'}
                                value={otp}
                                keyboardType='number-pad'
                                onChangeText={(text) => setOtp(text)}
                                style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />}
                    </View>
                    {/* {token!=null&&token!='Invalid_MSISDN'&&
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder={'Enter OTP'}
                            placeholderTextColor={'#9c9c9c'}
                            value={otp}
                            keyboardType='number-pad'
                            onChangeText={(text) => setOtp(text)}
                            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />
                    </View>} */}
                    <Text style={{ color: 'red', fontFamily: FONT_REGULAR, textAlign: 'center' }}>{validateError}</Text>
                    {/* <Text style={{ color: 'red', fontFamily: FONT_REGULAR, textAlign: 'center' }}>{token == 'Invalid_MSISDN' ? I18n.t("INVALIED_NO") : ''}</Text> */}
                    <TouchableOpacity onPress={token != null ? () => onSubscribe() : () => onSubmit()} style={styles.button}>
                        <Text style={styles.buttonText}>{token != null && token != 'Invalid_MSISDN' ? I18n.t("SUBSCRIBE") : 'Subcribe through PIN Code'}</Text>
                    </TouchableOpacity>
                    {(validateError == 'Pin Expired'||validateError == I18n.t("INVALIED_NO")) &&
                        <TouchableOpacity onPress={() => reSend()} style={styles.button2}>
                            <Text style={[styles.buttonText, { color: '#9ACD32' }]}>Resend OTP</Text>
                        </TouchableOpacity>}
                    <Text style={styles.terms}>Terms & Conditions</Text>
                    {terms != '' &&
                        <View style={styles.webViewContainer}>
                            <AutoHeightWebView
                                style={styles.autoWebView}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                scrollEnabled={false}
                                // scalesPageToFit={true}
                                onShouldStartLoadWithRequest={event => {
                                    if (event.url.slice(0, 4) === 'http') {
                                        Linking.openURL(event.url)
                                        return false
                                    }
                                    return true
                                }}
                                customStyle={Platform.OS != 'ios' ? `
                                * {
                                }
                                p {
                                  font-size: 20px;
                                }
                              `: `
                              * {
                              }
                              p {
                                font-size: 20px;
                              }
                            `}
                                mixedContentMode="compatibility"
                                source={{ html: terms }}
                            />
                        </View>}
                    <Text style={[styles.terms2, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]}>{I18n.t("T_C_Click_here")}
                    <Text onPress={()=>props.navigation.navigate('TermsConditions')} style={[styles.terms1, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]}>{I18n.t("Click_here")}</Text></Text>
                </View>
            </ScrollView>
            {isLoading && <BarIndicator style={{ backgroundColor: 'transparent', position: 'absolute', alignSelf: 'center', top: height * .4 }} color={PRIMARY_COLOR} size={34} />}
            <Modal
                isVisible={isVisible} hideModalContentWhileAnimating={true}
                animationIn='zoomIn'
                animationOut='zoomOut'
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationOutTiming={300}
                onBackButtonPress={() => setModal(false)}
                onBackdropPress={() => setModal(false)}
                style={styles.modal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTextSuccess}>{resultInfo}</Text>
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.buttonCancel} onPress={() => goBack()}>
                            <Text style={styles.cancel}>{I18n.t("Ok")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    header: {
        width: width,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTxt: {
        fontSize: 18,
        color: TITLE_COLOR,
        fontFamily: FONT_SEMIBOLD
    },
    img: {
        height: height * .25,
        width: width,
        resizeMode: 'stretch'
    },
    container: {
        margin: 15,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: FONT_PRIMARY,
        color: TITLE_COLOR,
        marginBottom: 5
    },
    amount: {
        fontSize: 28,
        textAlign: 'center',
        fontFamily: FONT_BOLD,
        color: TITLE_COLOR,
        // lineHeight: 5,
        paddingTop: 5
    },
    description: {
        fontSize: 14,
        color: PRIMARY_COLOR,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD
    },
    inputContainer: {
        height: 50,
        borderWidth: 1,
        borderColor: TITLE_COLOR,
        borderRadius: 5,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 8,
        marginTop: 15
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
        padding: 0,
        margin: 0,
    },
    button: {
        height: 50,
        width: '80%',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9ACD32',
        marginTop: 10,
        alignSelf: 'center',
        borderRadius: 30
    },
    button2: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        alignSelf: 'center',
        borderRadius: 30
    },
    buttonText: {
        padding: 5,
        color: '#fff',
        fontFamily: FONT_SEMIBOLD,
        fontSize: 18
    },
    terms: {
        textAlign: 'center',
        marginTop: 20,
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16,
        textDecorationLine: 'underline'
    },
    terms1:{
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD,
        fontSize: 18,
        color:PRIMARY_COLOR,
    },
    terms2:{
        textAlign: 'center',
        marginTop: 20,
        fontFamily: FONT_REGULAR,
        fontSize: 16,
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        width: '80%',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD'
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buttonCancel: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#DDDDDD'
    },
    modalTextSuccess: {
        fontSize: 20,
        fontFamily: FONT_SEMIBOLD,
        color: 'green',
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 25,
        paddingBottom: 10
    },
    cancel: {
        marginTop: 10,
        backgroundColor: PRIMARY_COLOR,
        fontFamily: FONT_REGULAR,
        paddingHorizontal: 20,
        paddingVertical: 5,
        color: '#fff'
    },
    webViewContainer: {
    },
    autoWebView: {
        width: width - 30,
        marginTop: 10
    },
})

