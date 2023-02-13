import React, { useEffect, useState } from 'react'
import { StyleSheet, Dimensions, View, Alert } from "react-native";
import { WebView } from 'react-native-webview';
import moment from 'moment-timezone';
import { store } from '../../../common/store'
import CryptoJS from 'crypto-js';
import { UIActivityIndicator } from 'react-native-indicators';
import { PRIMARY_COLOR } from './../../../assets/color'


var time = moment().tz("Asia/Dubai").format('YYYY:MM:DD-HH:mm:ss');
var sharedsecret = `F'5sQ\\5ESn`
// var sharedsecret = 'n+Gs"37vQE'
const { height, width } = Dimensions.get('screen')

const App = ({ navigation }) => {

    const [webLoad, setwebLoad] = useState(true)

    const sessionToken = store.getState().userLogin.user.sessionToken

    var responseFailURL = `https://alwaraq.net/payment/orderBookFinish.php?returnUrl=https://alwaraq.net&orderId=${navigation.getParam('orderId')}&productType=${navigation.getParam('productType')}&sessiontoken=${sessionToken}&refCode=${navigation.getParam('refCode')}&appId=1&transactionStatus=0`
    var responseSuccessURL = `https://alwaraq.net/payment/orderBookFinish.php?returnUrl=https://alwaraq.net&orderId=${navigation.getParam('orderId')}&productType=${navigation.getParam('productType')}&sessiontoken=${sessionToken}&refCode=${navigation.getParam('refCode')}&appId=1&transactionStatus=1`

    var messageSignatureContent = ["false",
        "true",
        navigation.getParam('totalPrice'),
        "combinedpage",
        "784",
        "false",
        "HMACSHA256",
        "en_US",
        responseFailURL,
        responseSuccessURL,
        "811189812",
        "Asia/Dubai",
        time,
        "sale"]

    var paymentParameters = {
        assignToken: "false",
        authenticateTransaction: "true",
        chargetotal: 13.00,
        // chargetotal: navigation.getParam('totalPrice'),
        checkoutoption: "combinedpage",
        currency: "784",
        full_bypass: "false",
        hash_algorithm: "HMACSHA256",
        language: "en_US",
        responseFailURL: responseFailURL,
        responseSuccessURL: responseSuccessURL,
        storename: "811189812",
        timezone: "Asia/Dubai",
        txndatetime: time,
        txntype: "sale",
    }

    const _onURLChanged = (e) => {
        if (e.url.slice(0, 21) === 'https://alwaraq.net/?') {
            // Linking.openURL(e.url)
            if (e.url.includes('transactionStatus=0')) {
                navigation.navigate('Detailbuy')
                Alert.alert(
                    "cancelled ",
                    "Your Payment is cancelled",
                    [

                        { text: "OK" }
                    ]
                );
            }
            else if (e.url.includes('transactionStatus=1')) {
                navigation.navigate('Detailbuy')
                Alert.alert(
                    "Success ",
                    "Your Payment Completed Successfully. Enjoy your book",
                    [

                        { text: "OK" }
                    ]
                );
            } else if (e.url.includes('transactionStatus=-1')) {
                navigation.navigate('Detailbuy')
                Alert.alert(
                    "Declined ",
                    "Your Payment Declined. Try again",
                    [

                        { text: "OK" }
                    ]
                );
            }
        }

    }

    const onLoadStart = () => {
        if (!webLoad) {
            setwebLoad(true)
        }
    }

    const onLoadEnd = () => {
        if (webLoad) {
            setwebLoad(false)
        }
    }


    const messageSignature = CryptoJS.HmacSHA256(messageSignatureContent.join("|"), sharedsecret);
    const messageSignatureBase64 = CryptoJS.enc.Base64.stringify(messageSignature);
    
    var testContent = `
        <form id="paymentForm" method="post" action="https://test.ipg-online.com/connect/gateway/processing">
            <input type="hidden" name="sharedsecret" value=${sharedsecret}/>
            <input type="hidden" name="hash_algorithm" value="HMACSHA256" />
            <input type="hidden" name="checkoutoption" value="combinedpage" />
            <input type="hidden" name="language" value="en_US" />
            <input type="hidden" name="hashExtended" value="${messageSignatureBase64}" />
            <input type="hidden" name="storename" value="811187409" />
            <input type="hidden" name="full_bypass" value="false" />
            <input type="hidden" name="paymentMethod" value="" />
            <input type="hidden" name="timezone" value="Asia/Dubai" />
            <input type="hidden" name="txndatetime" value="${time}" />
            <input type="hidden" name="txntype" value="sale" />
            <input type="hidden" name="chargetotal" value="${navigation.getParam('totalPrice')}" />
            <input type="hidden" name="authenticateTransaction" value="true" />
            <input type="hidden" name="currency" value="784" />
            <input type="hidden" name="referencedSchemeTransactionId" value="" />
            <input type="hidden" name="unscheduledCredentialOnFileType" value="" />
            <input type="hidden" name="responseFailURL" size="60" value="${responseFailURL}" />
            <input type="hidden" name="responseSuccessURL" size="60" value="${responseSuccessURL}" />
            <input type="hidden" name="assignToken" value="false" />
            <input type="hidden" name="hosteddataid" size="60" value="" />
            <h1 style="font-size:48px;color:#333;margin-top:30px;font-family:Arial; text-align:center;">Click here to proceed with payment</h1>
            <input type="submit" id="submit" value="Continue" style="width : 100%; font-size: 55px; " />
        </form>
                `

    var htmlContent = `
                <form id="paymentForm" method="post" action="https://www.ipg-online.com/connect/gateway/processing">
                    <input type="hidden" name="sharedsecret" value=${sharedsecret}/>
                    <input type="hidden" name="hash_algorithm" value="HMACSHA256" />
                    <input type="hidden" name="checkoutoption" value="combinedpage" />
                    <input type="hidden" name="language" value="en_US" />
                    <input type="hidden" name="hashExtended" value="${messageSignatureBase64}" />
                    <input type="hidden" name="storename" value="811189812" />
                    <input type="hidden" name="full_bypass" value="false" />
                    <input type="hidden" name="paymentMethod" value="" />
                    <input type="hidden" name="timezone" value="Asia/Dubai" />
                    <input type="hidden" name="txndatetime" value="${time}" />
                    <input type="hidden" name="txntype" value="sale" />
                    <input type="hidden" name="chargetotal" value="${navigation.getParam('totalPrice')}" />
                    <input type="hidden" name="authenticateTransaction" value="true" />
                    <input type="hidden" name="currency" value="784" />
                    <input type="hidden" name="referencedSchemeTransactionId" value="" />
                    <input type="hidden" name="unscheduledCredentialOnFileType" value="" />
                    <input type="hidden" name="responseFailURL" size="60" value="${responseFailURL}" />
                    <input type="hidden" name="responseSuccessURL" size="60" value="${responseSuccessURL}" />
                    <input type="hidden" name="assignToken" value="false" />
                    <input type="hidden" name="hosteddataid" size="60" value="" />
                    <h1 style="font-size:48px;color:#333;margin-top:30px;font-family:Arial; text-align:center;">Click here to proceed with payment</h1>
                    <input type="submit" id="submit" value="Continue" style="width : 100%; font-size: 55px; " />
                </form>
                        `



    useEffect(() => {
        console.log('htmlContent',htmlContent)
    }, [])
    return (
        <View style={styles.container}>
            <WebView
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                // onError={this.onError}
                onLoadStart={onLoadStart}
                onLoadEnd={onLoadEnd}
                mixedContentMode="compatibility"
                onNavigationStateChange={(e) => _onURLChanged(e)}
                showsHorizontalScrollIndicator={false}
                source={{ html: htmlContent }} />
            {webLoad &&
                <View
                    style={styles.activityIndicatorContainer}>
                    <UIActivityIndicator
                        color={PRIMARY_COLOR}
                        size={30}
                        style={styles.activityIndicator}
                    />
                </View>}
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    activityIndicatorContainer: {
        position: 'absolute',
        height: height * .7,
        width: width,
        zIndex: 10,
        alignSelf: 'center',
        paddingHorizontal: 5
    },
});

export default App;