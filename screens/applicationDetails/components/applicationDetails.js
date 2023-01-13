import React, { Component } from 'react'
import { StyleSheet, View, Linking, TouchableOpacity,ImageBackground, Text, Dimensions, FlatList, Image, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import { APP_INFO } from '../../../common/endpoints'
import Modal from 'react-native-modal'
import Swiper from 'react-native-swiper'
import Videoplay from '../../../components/videoPlay'
import ImageZoom from 'react-native-image-pan-zoom';
import { HeaderBackButton } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AutoHeightWebView from 'react-native-autoheight-webview'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR,WHITE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_ITALIC, FONT_LIGHT_ITALIC, FONT_LIGHT, FONT_MEDIUM, FONT_REGULAR, FONT_BOLD_ITALIC, FONT_EXTRA_BOLD, FONT_EXTRA_BOLD_ITALIC, FONT_BOLD } from '../../../assets/fonts'
import {
    BallIndicator,
    BarIndicator,
} from 'react-native-indicators';

const { height, width } = Dimensions.get('screen')
var videoLink = ''

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            data: this.props.navigation.getParam('data', null),
            appInfo: [],
            isVisible: false,
            isThumbnail: true,
            isLoading: true,
        }
    }

    componentDidMount() {
        Api('get', APP_INFO, { appId: this.state.data && this.state.data.applicationid, language: this.props.locale == 'ar' ? 1 : 2 }).then((response) => {
            if (response) {
                this.setState({ appInfo: response.appInfo, isLoading: false })
                if (response.appInfo && response.appInfo.videoURL) {
                    this.vimeoPlay(response.appInfo.videoURL)
                }
            }
            else {
            }
        })
    }

    vimeoPlay(item) {
        if (item && item.includes('vimeo')) {
            if (item) {
                var url = item;
                var regExp = /https:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;
                var match = url.match(regExp);
                if (match) {
                    const VIMEO_ID = match[2]
                    fetch(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
                        .then(res => res.json())
                        .then(res =>
                            videoLink = res.request.files.hls.cdns[res.request.files.hls.default_cdn].url.trim(),
                        );
                    return videoLink
                }
                if (this.state.videoLink != videoLink) {
                    this.setState({ videoLink: videoLink, videoName: item.videoTitle })
                }
            }
        }
        else {
            videoLink = ''
            return videoLink
        }
    }

    render() {
        var appInfo = this.state.appInfo
        return (
            <SafeAreaView style={styles.SafeAreaViewContainer}>
                <View style={styles.headerContainer}>
                        <HeaderBackButton tintColor={PRIMARY_COLOR} onPress={() => this.props.navigation.goBack()} />
                        <Text style={styles.textHeader}>{appInfo && appInfo.name}</Text>
                        <View style={styles.emptyContainer}/>
                    </View>
                {!this.state.isLoading ?
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.imgContainer}>
                            <LinearGradient style={styles.cardGradient} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                                <Image style={styles.card} source={appInfo ? { uri: appInfo.applicationIcon } : Images.default} />
                            </LinearGradient>
                            <View style={styles.nameContainer}>
                                <Text style={[styles.textHeader,{color:TITLE_COLOR}]}>{appInfo && appInfo.name}</Text>
                                <Text style={styles.textSubHeader}>{appInfo && appInfo.tagline}</Text>
                            </View>
                        </View>
                        {((Platform.OS == 'ios' && appInfo && appInfo.appStoreLink != "" && appInfo.appStoreLink != null && appInfo.appStoreLink != undefined) ||
                            (Platform.OS != 'ios' && appInfo && appInfo.googleStoreLink != "" && appInfo.googleStoreLink != null && appInfo.googleStoreLink != undefined)) &&
                            <TouchableOpacity onPress={() => Linking.openURL(Platform.OS == 'ios' ? appInfo.appStoreLink : appInfo.googleStoreLink)} style={styles.installContainer}>
                                <Text style={styles.installText} textAlign='right'>Install</Text>
                            </TouchableOpacity>}
                        {appInfo && appInfo.websitelink &&
                            <TouchableOpacity style={styles.webLinkContainer} onPress={() => Linking.openURL(appInfo && appInfo.websitelink && 'http://' + appInfo.websitelink)} >
                                <MaterialCommunityIcons name='web' size={20} color={'#3E525E'} />
                                <Text style={styles.privacyPolicyText}>{appInfo && appInfo.websitelink}</Text>
                            </TouchableOpacity>}

                        <View style={styles.videoPlayerContainer}>
                            {(appInfo && appInfo.videoURL !== '' && !this.state.isThumbnail) ?
                                <View style={styles.videoPlayContainer}>
                                    <Videoplay navigation={this.props.navigation} videoLink={videoLink} />
                                </View> :
                                <TouchableOpacity style={styles.videoImageContainer} onPress={() => this.setState({ isThumbnail: false })}>
                                    <ImageBackground blurRadius={60} resizeMode='stretch' style={styles.videoThumbnailStyle} source={appInfo ? { uri: appInfo.applicationIcon } : Images.default}>
                                        <Image style={styles.videoThumbnailStyle} resizeMode={'contain'} source={appInfo ? { uri: appInfo.applicationIcon } : Images.default} />
                                    </ImageBackground>
                                    <FontAwesome5 style={styles.videoThumbnailIcon} name='play' size={40} color={PRIMARY_COLOR} />
                                </TouchableOpacity>}
                        </View>
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
                                customStyle={Platform.OS == 'ios' && `
                                * {
                                }
                                p {
                                  font-size: 20px;
                                }
                              `}
                                mixedContentMode="compatibility"
                                source={{ html: appInfo && appInfo.description }}
                            />
                        </View>
                        {/* <View style={styles.descriptionHeader}>
                        <Text style={styles.description}>{appInfo && appInfo.description}</Text>
                    </View> */}
                        {appInfo && appInfo.screenshots && appInfo.screenshots[0].length > 0 &&
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                                <TouchableOpacity onPress={() => this.setState({ isVisible: true })} style={styles.screenshotContainer}>
                                    <Image style={styles.screenshot} resizeMode='stretch' source={appInfo && appInfo.screenshots && appInfo.screenshots[0] ? { uri: appInfo.screenshots[0] } : Images.default} />
                                    <Image style={styles.screenshot} resizeMode='stretch' source={appInfo && appInfo.screenshots && appInfo.screenshots[1] ? { uri: appInfo.screenshots[1] } : Images.default} />
                                    <Image style={styles.screenshot} resizeMode='stretch' source={appInfo && appInfo.screenshots && appInfo.screenshots[2] ? { uri: appInfo.screenshots[2] } : Images.default} />
                                </TouchableOpacity>
                            </ScrollView>}
                    </ScrollView> :
                    <View style={styles.barIndicator}>
                        <BarIndicator color={PRIMARY_COLOR} size={34} />
                    </View>}
                <Modal
                    isVisible={this.state.isVisible}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    hasBackdrop={true}
                    backdropColor='black'
                    backdropOpacity={.9}
                    onBackButtonPress={() => this.setState({ isVisible: false })}
                    onBackdropPress={() => this.setState({ isVisible: false })}
                    style={styles.modal} >
                    <View style={styles.containerModal}>
                        <TouchableOpacity style={styles.close} onPress={() => this.setState({ isVisible: false })}>
                            <Icon name='ios-close-circle-outline' size={40} color='#FFFFFF' />
                        </TouchableOpacity>
                        <Swiper style={styles.swiper}>
                            {appInfo && appInfo.screenshots && appInfo.screenshots.map((item) => {
                                return (
                                    <View style={styles.imageZoomContainer}>
                                        <ImageZoom cropWidth={Dimensions.get('window').width}
                                            cropHeight={Dimensions.get('window').height}
                                            imageWidth={width * .9}
                                            maxOverflow={100}
                                            imageHeight={height}>
                                            <Image resizeMode='contain' source={{ uri: item }} style={styles.swipeImg} />
                                        </ImageZoom>
                                    </View>
                                )
                            })}
                        </Swiper>
                    </View>
                </Modal>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        applications: state.dashboard.applications,
        isLoading: state.dashboard.isLoading,
        locale: state.userLogin.locale,
    }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    SafeAreaViewContainer: {
        flex: 1,
        margin: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        alignItems: 'center',
        justifyContent:'space-between',
        marginBottom: 5,
    },
    imgContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row',
    },
    cardGradient: {
        height: 100,
        width: 100,
        borderRadius: 20,
        margin: 10
        // width: width * .8,
    },
    card: {
        height: 100,
        width: 100,
        borderRadius: 20,
        // width: width * .8,
    },
    textHeader: {
        fontSize: 22,
        fontFamily: FONT_BOLD,
        color: PRIMARY_COLOR,
        textAlign: 'justify',
    },
    emptyContainer:{
        height:50,
        width:50
    },
    nameContainer: {
        flex: 1,
        height: '100%',
        padding: 10,
        // flexDirection:'row-reverse'
    },
    textSubHeader: {
        fontSize: 14,
        fontFamily: FONT_SEMIBOLD,
        color: PRIMARY_COLOR,
        textAlign: 'justify',
        flexDirection: 'row-reverse'
    },
    installContainer: {
        backgroundColor: PRIMARY_COLOR,
        height: 40,
        marginTop: 5,
        borderRadius: 10,
        marginHorizontal: 10,
        justifyContent: 'center'
    },
    installText: {
        fontSize: 16,
        fontFamily: FONT_BOLD,
        color: '#ffffff',
        textAlign: 'center',
    },
    header: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textHeader2: {
        fontSize: 16,
        fontFamily: FONT_BOLD,
        color: TITLE_COLOR
    },
    description: {
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        color: TITLE_COLOR,
        textAlign: 'justify'
    },
    descriptionHeader: {
        flex: 1,
        backgroundColor: 'red',
        margin: 10,
        flexDirection: 'row-reverse'
    },
    autoWebView: {
        width: width - 40,
    },
    screenshotContainer: {
        flexDirection: 'row',
        margin: 10
    },
    screenshot: {
        height: 150,
        width: 100,
        marginRight: 20,
        // width: (width-40)/3,
        borderRadius: 20,
    },
    containerModal: {
        height: '80%',
        width: '100%'
    },
    close: {
        position: 'absolute',
        top: -50,
        right: 15,
        zIndex: 10
    },
    swiper: {
    },
    swipeImg: {
        height: '95%',
        width: '90%',
    },
    imageZoomContainer: {
        justifyContent: 'center'
    },
    privacyPolicyText: {
        textAlign: 'center',
        fontFamily: FONT_MEDIUM,
        color: '#3E525E',
        paddingVertical: 5,
        marginLeft: 5
    },
    webLinkContainer: {
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    webViewContainer: {
        margin: 10
    },
    videoPlayContainer: {
        flex: 1,
        backgroundColor: '#EDEDED',
        borderRadius: 20,
    },
    videoPlayerContainer: {
        padding: 15,
        marginHorizontal: 10,
        height: height * .25,
        borderRadius: 20,
        shadowOpacity: .2,
        elevation: 2,
        backgroundColor: '#fff',
        marginVertical: 10,
        shadowOffset: { width: 1, height: 0 },
    },
    videoImageContainer: {
        flex: 1,
        backgroundColor: '#EDEDED',
        justifyContent: 'center',
        alignItems: 'center'
    },
    videoThumbnailStyle: {
        height: '100%',
        width: '100%',
    },
    videoThumbnailIcon: {
        position: 'absolute'
    },
    barIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: height * .75
    }
})