import React, { Component } from 'react'
import { StyleSheet, Clipboard, View, Linking, TouchableOpacity, Text, Dimensions, FlatList, Image, TextInput, ScrollView, SafeAreaView, Platform, ImageBackground } from 'react-native'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import { APP_INFO, ARTICLE } from '../../../common/endpoints'
import Videoplay from '../../../components/videoPlay'
import Modal from 'react-native-modal'
import { fetchLike, fetchCommentModal } from '../actions'
import I18n from '../../../i18n'
import Share from 'react-native-share'
import CommentModal from '../../../components/CommentModal'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Entypo from 'react-native-vector-icons/Entypo'
import RNFetchBlob from 'rn-fetch-blob'
import AutoHeightWebView from 'react-native-autoheight-webview'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
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
            articles: [],
            isVisible: false,
            isThumbnail: true,
            base64: null,
            isLoading: true,
            isModalVisible: false
        }
        this.renderRelatedArticles = this.renderRelatedArticles.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.addLike = this.addLike.bind(this)
        this.goToLogin = this.goToLogin.bind(this)
        this.share = this.share.bind(this)
        this.getBase64FromUri = this.getBase64FromUri.bind(this)
    }

    fetchData() {
        Api('get', ARTICLE, { articleid: this.state.data && this.state.data.id, language: this.props.locale == 'ar' ? 1 : 2 }).then((response) => {
            
            if (response) {
                this.setState({ articles: response.articles && response.articles[0], isLoading: false })
                if (response.articles && response.articles[0] && response.articles[0].videoURL) {
                    this.vimeoPlay(response.articles[0].videoURL)
                    this.getBase64FromUri()
                }
            }
            else {
                this.setState({ isLoading: false })
            }
        })
    }

    getBase64FromUri(uri) {
        RNFetchBlob.fetch('GET', this.state.articles && this.state.articles.publicationIcon)
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
        if (this.state.articles) {
            var articles = this.state.articles
            var fbURL = articles.fbURL ? articles.fbURL : ''
            var name = articles.name ? articles.name : ''
            var footer = 'By Electronic Village... '
            var subbody = articles.body
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
            subbody = name + '\n\n' + subbody + '\n\n' + fbURL + '\n\n' + footer
            Clipboard.setString(subbody)
            var shareOptions = {
                title: articles && articles.name,
                subject: articles && articles.name,
                url: this.state.base64,
                message: subbody
                // message: this.state.data && this.state.data.name + '\n\n' + this.state.data.description + '\n' + 'By Alwaraq Team '
            };
            Share.open(shareOptions)
        }
    }

    addLike(initialFetch) {
        // if (!this.props.isLikeLoading) {
        //     let formdata = new FormData()
        //     formdata.append('articleId', this.state.articles.id)
        //     // if (!initialFetch) {
        //     //     formdata.append('action', this.props.isLiked ? 'delete' : 'add')
        //     // }
        //     this.props.dispatch(fetchLike(formdata))
        // }
    }

    componentDidMount() {
        this.addLike(true)
        this.fetchData()
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.data != this.state.data) {
            this.fetchData()
        }
    }

    renderRelatedArticles({ item, index }) {
        return (
            <TouchableOpacity style={[styles.articleContainer, { borderWidth: Platform.OS == 'ios' ? 0 : .3 }]} onPress={() => this.setState({ data: item })}>
                <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.card} resizeMode='stretch' source={item.publicationIcon ? { uri: item.publicationIcon } : Images.default}
                        imageStyle={styles.imageStyle}>
                    </Image>
                </LinearGradient>
                <View style={styles.cardFooter}>
                    <Text style={[styles.title, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
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
        else if (item != '' && item != null) {
            videoLink = item
            return videoLink
        }
        else {
            videoLink = ''
            return videoLink
        }
    }

    goToLogin(isModalVisible) {
        this.setState({ isModalVisible: isModalVisible })
        // setTimeout(() => {
        //     this.setState({ isModalVisible: isModalVisible })
        // }, 550)
    }

    render() {
        var articles = this.state.articles
        return (
            <SafeAreaView style={styles.SafeAreaViewContainer}>
                {!this.state.isLoading ?
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        {articles && articles.fbURL &&
                            <TouchableOpacity onPress={() => Linking.openURL(articles.fbURL)} style={styles.facebookContainer}>
                                <FontAwesome name='facebook' size={30} color='#fff' />
                            </TouchableOpacity>}
                        <TouchableOpacity onPress={() => this.share()} style={styles.shareContainer}>
                            <MaterialCommunityIcons style={styles.shareIcon} name='share-variant' size={24} color='#FFFFFF' />
                        </TouchableOpacity>
                        <ImageBackground blurRadius={100} resizeMode='stretch' style={styles.adsImg} source={articles ? { uri: articles.publicationIcon } : Images.default}>
                            <LinearGradient style={styles.imgContainer} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                                <Image style={styles.imgContainer} resizeMode='contain' source={articles ? { uri: articles.publicationIcon } : Images.default} />
                            </LinearGradient>
                        </ImageBackground>
                        <View style={styles.container}>
                            <Text style={[styles.titleShared, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{articles && articles.name}</Text>
                            <View style={[styles.videoPlayerContainer, { borderWidth: Platform.OS == 'ios' ? 0 : .3 }]}>
                                {(articles && articles.videoURL !== '' && !this.state.isThumbnail) ?
                                    <View style={styles.videoPlayContainer}>
                                        <Videoplay navigation={this.props.navigation} videoLink={videoLink} />
                                    </View> :
                                    <TouchableOpacity style={styles.videoImageContainer} onPress={() => this.setState({ isThumbnail: false })}>
                                        <ImageBackground blurRadius={100} resizeMode='stretch' style={styles.videoThumbnailStyle} source={articles ? { uri: articles.publicationIcon } : Images.default}>
                                            <Image style={styles.videoThumbnailStyle} resizeMode={'contain'} source={articles ? { uri: articles.publicationIcon } : Images.default} />
                                        </ImageBackground>
                                        <FontAwesome5 style={styles.videoThumbnailIcon} name='play' size={40} color={PRIMARY_COLOR} />
                                    </TouchableOpacity>}
                            </View>
                            <AutoHeightWebView
                                style={styles.autoWebView}
                                javaScriptEnabled={true}
                                scrollEnabled={false}
                                domStorageEnabled={true}
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
                                source={{ html: articles && articles.body }}
                            />
                            {/* <View style={styles.likeCommentContainer}>
                                <TouchableOpacity onPress={this.props.user ? () => this.addLike() : () => this.setState({ isModalVisible: true })} style={styles.likeContainer}>
                                    <Text style={styles.likeCountText}>{this.props.totalLikes ? this.props.totalLikes : 0}</Text>
                                    <AntDesign name={this.props.isLiked ? 'like1' : 'like2'} size={22} color={this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'} />
                                    <Text style={[styles.commentText, { color: this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c' }]}>Like</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.props.dispatch(fetchCommentModal(true))} style={styles.likeContainer}>
                                    <MaterialCommunityIcons name='comment-outline' size={22} color='#9c9c9c' />
                                    <Text style={styles.commentText}>Comments</Text>
                                </TouchableOpacity>
                            </View> */}
                            {/* {this.state.articles &&
                                <CommentModal goToLogin={this.goToLogin} modalAction={this.props.modalAction} articles={this.state.articles} />} */}

                            <Text style={[styles.relatedBooks, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]}>Related Articles</Text>
                            <View style={[styles.emptyContainer, { alignSelf: this.props.locale == 'ar' ? 'flex-end' : 'flex-start' }]} />
                            <View style={{ backgroundColor: '#fff' }}>
                                <FlatList
                                    horizontal={true}
                                    style={styles.flatlistStyle}
                                    showsHorizontalScrollIndicator={false}
                                    data={articles && articles.relatedarticles}
                                    renderItem={this.renderRelatedArticles}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index}
                                />
                            </View>
                        </View>
                    </ScrollView> :
                    <View style={styles.barIndicator}>
                        <BarIndicator color={PRIMARY_COLOR} size={34} />
                    </View>}
                <Modal
                    isVisible={this.state.isModalVisible}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    useNativeDriver={true}
                    animationOutTiming={300}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    onBackdropPress={() => this.setState({ isModalVisible: false })}
                    style={styles.modal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalHeaderText}>Login to continue</Text>
                            <Text style={styles.modalText}>Registering with the app will enable the user to access the content from any of their  devices. Once logged in, the user can participate in all the interactive features of the app like giving their likes, comments...etc</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.buttonCancel} onPress={() => this.setState({ isModalVisible: false })}>
                                <Text style={styles.cancel}>{I18n.t("CANCEL")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Login') && this.setState({ isModalVisible: false })} style={styles.button}>
                                <Text style={styles.subscribe}>{I18n.t("Login")}</Text>
                            </TouchableOpacity>
                        </View>
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
        user: state.userLogin.user,
        locale: state.userLogin.locale,
        // totalLikes: state.commentboard.totalLikes,
        // isLiked: state.commentboard.isLiked,
        // modalAction: state.commentboard.modalAction,
        // isLikeLoading: state.commentboard.isLikeLoading,
    }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    SafeAreaViewContainer: {
        flex: 1,
    },
    imgContainer: {
        height: height * .30,
        width: '100%'
    },
    container: {
        flex: 1,
        margin: 10,
        marginHorizontal: 20,
    },
    titleShared: {
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
        width: '100%',
        marginTop: 15
    },
    card: {
        height: 140,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // height: height * .25,
        // width: width * .8,
    },
    cardFooter: {
        margin: 5,
        flex: 1,
        justifyContent: 'center'
    },
    articleContainer: {
        marginHorizontal: 10,
        marginVertical: 2,
        backgroundColor: '#fff',
        shadowOpacity: .2,
        shadowOffset: { width: 1, height: 0 },
        height: 200,
        width: 200,
        borderColor: '#9c9c9c',
        borderRadius: 20,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    relatedBooks: {
        fontSize: 18,
        fontFamily: FONT_MEDIUM,
        marginTop: 10
    },
    emptyContainer: {
        backgroundColor: PRIMARY_COLOR,
        height: 3,
        width: 100,
        marginBottom: 10,
    },
    autoWebView: {
        width: width - 40,
    },
    videoPlayContainer: {
        flex: 1,
        backgroundColor: '#EDEDED',
        borderRadius: 20,
    },
    videoPlayerContainer: {
        padding: 15,
        height: height * .25,
        borderRadius: 20,
        shadowOpacity: .2,
        backgroundColor: '#fff',
        borderColor: '#9c9c9c',
        marginVertical: 10,
        shadowOffset: { width: 1, height: 0 },
    },
    videoImageContainer: {
        flex: 1,
        backgroundColor: '#EDEDED',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    videoThumbnailStyle: {
        height: '100%',
        width: '100%',
        borderRadius: 20,
    },
    videoThumbnailIcon: {
        position: 'absolute'
    },
    back: {
        height: 50,
        width: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
        marginTop: 35,
        position: 'absolute',
        zIndex: 10
    },
    barIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: height * .75
    },
    likeCommentContainer: {
        height: 50,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EDEDED',
    },
    likeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    likeCountText: {
        fontSize: 16,
        color: '#9c9c9c',
        fontFamily: FONT_REGULAR,
        marginRight: 10
    },
    commentText: {
        fontSize: 16,
        color: '#9c9c9c',
        fontFamily: FONT_REGULAR,
        marginLeft: 5
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
    modalText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: FONT_MEDIUM,
        color: TITLE_COLOR,
        opacity: .9
    },
    modalHeaderText: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 5,
        fontFamily: FONT_MEDIUM,
        color: TITLE_COLOR,
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    cancel: {
        paddingRight: 25,
        fontSize: 14,
        color: TITLE_COLOR,
        fontFamily: FONT_SEMIBOLD,
    },
    subscribe: {
        color: PRIMARY_COLOR,
        fontSize: 14,
        fontFamily: FONT_SEMIBOLD
    },
    buttonCancel: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#DDDDDD'
    },
    button: {
        flex: 1,
        padding: 15,
        alignItems: 'center'
    },
    fb: {
        // height:50,
        // width:50,
        // borderRadius:25,
        // backgroundColor:'red',
        // position: 'absolute',
        // bottom: 80,
        // right: 40
    },
    facebookContainer: {
        backgroundColor: '#3b5998',
        borderRadius: 25,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        top: height * .30 - 25,
        right: 80,
        zIndex: 10
    },
    shareContainer: {
        backgroundColor: '#246FD1',
        borderRadius: 25,
        position: 'absolute',
        height: 50,
        width: 50,
        // justifyContent: 'center',
        // alignItems: 'center',
        top: height * .30 - 25,
        right: 20,
        zIndex: 10
    },
    shareIcon: {
        // backgroundColor: '#246FD1',
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12
    },
    adsImg: {
        height: height * .30,
        width: width
    },
})