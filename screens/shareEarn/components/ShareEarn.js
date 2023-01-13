import React, { Component } from 'react'
import { View, Text, StyleSheet, Clipboard, FlatList, ImageBackground, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions, I18nManager } from 'react-native'
import { PRIMARY_COLOR } from '../../../assets/color'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD } from '../../../assets/fonts'
import Images from '../../../assets/images'
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import Login from '../../login'
import { APP_INFO, SHARE_EARN, WALLET } from '../../../common/endpoints'
import Api from '../../../common/api'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
// import { fetchFavourites, resetFavourites, fetchAddFavourites } from '../actions'
import AntDesign from "react-native-vector-icons/AntDesign"
import AutoHeightWebView from 'react-native-autoheight-webview'
import ReadMore from 'react-native-read-more-text'
import Share from 'react-native-share'
import RNFetchBlob from 'rn-fetch-blob'
import Subscribe from '../../subscribe'
import { HeaderBackButton } from 'react-navigation-stack';
import { BallIndicator, BarIndicator, MaterialIndicator } from 'react-native-indicators';

const { height, width } = Dimensions.get('screen')
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 100;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};

class App extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerLeft: (<HeaderBackButton tintColor={PRIMARY_COLOR} onPress={() => params.this.props.navigation.goBack()} />),
            headerTitle: (
                <View style={styles.header}>
                    <Image style={styles.logo} source={Images.headerName} resizeMode='contain' />
                </View>),
            headerTitleStyle: {
            },
            headerStyle: {
                borderBottomWidth: 0,
                elevation: 0,
                height:60,
            },
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            languageId: this.props.locale == 'ar' ? 1 : 2,
            appInfo: [],
            data: [],
            base64: null,
            isLoading: true
        }
        this.fetchData = this.fetchData.bind(this)
        this.getBase64FromUri = this.getBase64FromUri.bind(this)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            this: this,
        })
        let formData = new FormData()
        formData.append('language', this.props.locale == 'ar' ? 1 : 2);
        formData.append('appid', 1);
        Api('post', WALLET, formData).then((response) => {
            if (response) {
                this.fetchData()
                this.setState({ data: response, isLoading: false })
            }
            // this.props.dispatch(fetchAppInfo(response.appInfo))
        })
    }

    getBase64FromUri(uri) {
        RNFetchBlob.fetch('GET', uri)
            .then((res) => {
                let status = res.info().status;
                if (status == 200) {
                    // the conversion is done in native code
                    let base64Str = 'data:image/png;base64,' + res.base64()
                    this.setState({ base64: base64Str })
                    // the following conversions are done in js, it's SYNC
                    let text = res.text()
                    let json = res.json()
                } else {
                    // handle other status codes
                }
            })
            // Something went wrong:
            .catch((errorMessage, statusCode) => {
            })
    }

    share() {
        var appInfo = this.state.appInfo
        var appStoreLink = appInfo.appStoreLink ? appInfo.appStoreLink : ''
        var googleStoreLink = appInfo.googleStoreLink ? appInfo.googleStoreLink : ''
        var websitelink = appInfo.websitelink ? appInfo.websitelink : ''
        var name = appInfo.name ? appInfo.name : ''
        var footer = '\n' + '\n' + 'From Alwaraq Project. ' + '\n' + 'By Electronic Village...' + '\n'
        var refCode = this.props.user && this.props.user.refCode
        var link = 'Discounted Subscription :' + '\n' + 'com.alwaraq://RefCode/' + refCode + '\n' + '\n' + 'Enter my Referral Code is ' + refCode + ' to get discounts'
        var subbody = appInfo.description
        subbody = subbody.replace(/<style([\s\S]*?)<\/style>/gi, '');
        subbody = subbody.replace(/<script([\s\S]*?)<\/script>/gi, '');
        subbody = subbody.replace(/<\/div>/ig, '\n');
        subbody = subbody.replace(/<\/li>/ig, '\n');
        subbody = subbody.replace(/<li>/ig, '  *  ');
        subbody = subbody.replace(/<\/ul>/ig, '\n');
        subbody = subbody.replace(/<\/p>/ig, '\n');
        subbody = subbody.replace(/<br\s*[\/]?>/gi, "\n");
        subbody = subbody.replace(/<[^>]+>/ig, '');
        subbody = subbody.replace(/&nbsp;/ig, '');
        subbody = name + '\n\n' + subbody + '\n\n' + 'App Store: ' + appStoreLink + '\n\n' + 'Play Store: ' + googleStoreLink + '\n\n' + 'Web Site: ' + websitelink + '\n\n' + link + footer
        Clipboard.setString(subbody)
        var shareOptions = {
            title: appInfo && appInfo.name,
            subject: appInfo && appInfo.name,
            url: this.state.base64,
            message: subbody
            // message: this.state.data && this.state.data.name + '\n\n' + this.state.data.description + '\n' + 'By Alwaraq Team '
        };
        Share.open(shareOptions)
    }

    fetchData() {
        Api('get', APP_INFO, { appId: 1, language: this.state.languageId }).then((response) => {
            
            if (response) {
                this.setState({ appInfo: response.appInfo })
                if (response.appInfo && response.appInfo.applicationIcon) {
                    this.getBase64FromUri(response.appInfo.applicationIcon)
                }
                // this.props.dispatch(fetchAppInfo(response.appInfo))
            }
        })
    }

    render() {
        var data = this.state.data
        return (
            <SafeAreaView style={styles.container}>
                {!this.state.isLoading ?
                    <ScrollView
                        scrollEventThrottle={1}
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (isCloseToBottom(nativeEvent)) {
                                // this.onLoad()
                            }
                        }} showsVerticalScrollIndicator={false}>
                        <ImageBackground resizeMethod='scale' style={styles.card} source={Images.Wallet}>
                            <View style={{ justifyContent: 'center', flex: 1, marginLeft: 20 }}>
                                <Text style={styles.balanceText}>{I18n.t("Wallet_Money")}</Text>
                                <Text style={styles.moneyText}>{data.wallet}<Text style={styles.balanceText}>{' USD'}</Text></Text>
                            </View>
                            <View style={styles.redeemContainer}>
                                <Text style={styles.withdraw}>{I18n.t("Redeem")}</Text>
                            </View>
                        </ImageBackground>
                        {this.state.appInfo && this.state.appInfo.length != 0 &&
                            <TouchableOpacity style={styles.google} onPress={() => this.share()}>
                                <Text style={styles.social}>{I18n.t("Share_Now")}</Text>
                            </TouchableOpacity>}
                        <Text style={styles.title}>{data.title}</Text>
                        {data && data.description && data.description.length != 0 &&
                            <View style={styles.webViewContainer}>
                                <AutoHeightWebView
                                    style={styles.autoWebView}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    // scalesPageToFit={true}
                                    scrollEnabled={false}
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
                                    source={{ html: data && data.description }}
                                />
                            </View>}
                    </ScrollView> :
                    <BarIndicator style={styles.loaderContainer} color={PRIMARY_COLOR} size={34} />}
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
        user: state.userLogin.user,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
    },
    cardGrid: {
        paddingHorizontal: 5,
        borderRadius: 5,
        marginVertical: 5,
        elevation: .5,
        borderWidth: .1,
        borderColor: '#707070',
        justifyContent: 'center',
        // shadowColor: '#000',
        shadowOpacity: .2,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: '#FFFFFF',
    },

    card: {
        height: height * .25,
        width: width,
        marginBottom: 4,
        backgroundColor: '#9c9c9c',
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    titleContainer: {
        backgroundColor: '#FFFFFF'
    },
    logo: {
        marginVertical: 5,
        height: 30
    },
    cardGridView: {
    },
    textContainer: {
    },
    nameText: {
        fontSize: 20,
        fontFamily: FONT_SEMIBOLD,
        flexShrink: 1
    },
    iconContainer: {
        justifyContent: 'center',
    },
    iconContain: {
        height: height / 1.5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    authorText: {
        fontSize: 12,
        opacity: .6,
        fontSize: 13,
        width: '85%',
        fontFamily: FONT_REGULAR
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    ratingTextContainer: {
        flexDirection: 'row'
    },
    ratingText: {
        marginLeft: 10,
        fontFamily: FONT_SEMIBOLD,
        fontSize: 15
    },
    ratingTexts: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 15,
        color: '#605F5F'
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        color: '#272727',
        marginTop: 5,
        fontFamily: FONT_BOLD
    },
    emptyContainer: {
        backgroundColor: PRIMARY_COLOR,
        height: 3,
        width: 62,
        marginBottom: 10
    },
    loaderContain: {
        width: '100%',
        height: width / 3,
        borderRadius: 13,
        marginVertical: 5
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD,
    },
    autoWebView: {
        width: width - 40,
    },
    webViewContainer: {
        marginHorizontal: 15,
        flex: 1
    },
    show: {
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: FONT_BOLD,
        color: PRIMARY_COLOR
    },
    description: {
        textAlign: 'justify',
        fontSize: 18,
        fontFamily: FONT_REGULAR
    },
    social: {
        fontFamily: FONT_REGULAR,
        fontSize: 16,
        color: 'white',
        textAlign: 'left'
    },
    google: {
        paddingVertical: 10,
        paddingHorizontal: 40,
        backgroundColor: PRIMARY_COLOR,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15
    },
    balanceText: {
        fontFamily: FONT_BOLD,
        fontSize: 16,
        color: '#000',
        textAlign: 'left'
    },
    moneyText: {
        fontFamily: FONT_BOLD,
        fontSize: 42,
        color: '#000',
        textAlign: 'left',
    },
    withdraw: {
        fontFamily: FONT_BOLD,
        paddingHorizontal: 15,
        fontSize: 16,
        color: PRIMARY_COLOR,
        textAlign: 'left',
        paddingVertical: 10,
    },
    redeemContainer: {
        justifyContent: 'center',
        width: 120,
        alignSelf: 'center',
        marginVertical: 10,
        alignItems: 'center',
        borderRadius: 60,
        backgroundColor: '#fff',
        borderWidth: .5
    },
})


