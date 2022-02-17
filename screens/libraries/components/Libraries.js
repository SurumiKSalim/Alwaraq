import React, { Component } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, Image, SafeAreaView, ScrollView } from 'react-native'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import Demo from './../../../mockData/librariesData'
import Images from '../../../assets/images'
import I18n from '../../../i18n'
import { WebView } from 'react-native-webview';
import { connect } from 'react-redux'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { MaterialIndicator } from 'react-native-indicators'
import Modal from "react-native-modal"
import VideoPlayer from 'react-native-video-controls'
import Audio from "../../audio";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import AudioPlay from '../../../components/audioPlay'
import { fetchModules, resetModules, resetModulesList, fetchModulesList, } from '../actions'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"


const { height, width } = Dimensions.get('screen')
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 100;
    return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
};

var base64 = require('base-64');
var utf8 = require('utf8');

class Libraries extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            children: [],
        }
        this.renderItem = this.renderItem.bind(this)
        this.renderChildItem = this.renderChildItem.bind(this)
        this.selection = this.selection.bind(this)
        this.renderModalContent = this.renderModalContent.bind(this)
    }

    selection(item) {
        if (item.children && item.children.length > 0) {
            this.setState({ modalVisible: true, children: item.children })
        }
        else {
            this.setState({ modalVisible: false })
            this.props.navigation.navigate('BookList', { data: item, fromLibrary: true })
        }
    }

    renderItem({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.selection(item)} style={styles.containerContent}>
                <View style={styles.renderItemImg}>
                    <Image style={styles.card} source={{ uri: item.picture }}></Image>
                </View>
                <View style={styles.renderItemText}>
                    <Text style={styles.categoryNameText} numberOfLines={2} ellipsizeMode={"middle"} >{item.subjectName}</Text>
                    {/* <Text style={styles.statusText}>{item.status}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }

    renderChildItem({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.selection(item)} style={styles.containerContent1}>
                <View style={styles.renderItemImg}>
                    <Image style={styles.card} source={{ uri: item.picture }}></Image>
                </View>
                <View style={styles.renderItemText}>
                    <Text style={styles.categoryNameText}>{item.subjectName}</Text>
                    {/* <Text style={styles.statusText}>{item.status}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }

    renderModalContent = () => (
        <View style={styles.content}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <FlatList
                    style={styles.FlatListStyle}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    data={this.state.children}
                    renderItem={this.renderChildItem}
                    extraData={this.state}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                />
            </ScrollView>
        </View>
    );

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    data={this.props.categorySubjucts}
                    renderItem={this.renderItem}
                    extraData={this.state}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Modal
                    isVisible={this.state.modalVisible}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    hasBackdrop={true}
                    backdropColor='black'
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    backdropOpacity={.5}
                    onBackButtonPress={() => this.setState({ modalVisible: false })}
                    onBackdropPress={() => this.setState({ modalVisible: false })}
                    style={styles.modal}>
                    <View style={styles.modalStyle}>
                        {this.renderModalContent()}
                    </View>
                </Modal>
            </SafeAreaView>
        )
    }
}

class Modules extends React.Component {


    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            info: false,
            selectedItem: [],
            article: false,
            sound: false,
            moduleId: null,
            onLoadLoader: false
        }
        this.renderItem = this.renderItem.bind(this)
        this.renderChildItem = this.renderChildItem.bind(this)
        this.selection = this.selection.bind(this)
        this.renderModalContent = this.renderModalContent.bind(this)
        this.goBack = this.goBack.bind(this)
        this.loader = this.loader.bind(this)
        this.audioPlay = this.audioPlay.bind(this)
        this.onLoad = this.onLoad.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(resetModules())
        this.props.dispatch(fetchModules())
    }

    selection(item, info, article) {
        if (!article) {
            this.props.dispatch(resetModulesList())
            this.props.dispatch(fetchModulesList(item.moduleId))
        }
        this.setState({ modalVisible: true, info: info, selectedItem: item, article: article, moduleId: item.moduleId })
    }

    renderItem({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.selection(item, false, false)} style={styles.containerContent}>
                <View style={styles.renderItemImg}>
                    <Image style={[styles.card1, { width: width / 2.3 }]} source={{ uri: `data:image/jpeg;base64,${item.picture}` }}></Image>
                </View>
                {/* <View style={styles.renderItemText1}> */}
                <Text numberOfLines={1} style={styles.categoryNameText}>{item.moduleName}</Text>
                {/* <Text style={styles.statusText}>{item.status}</Text> */}
                {/* </View> */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity onPress={() => this.selection(item, false, false)} style={styles.infoContainer}>
                        <MaterialCommunityIcons name='microsoft-xbox-controller-menu' color={PRIMARY_COLOR} size={23} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.selection(item, true, false)} style={styles.infoContainer}>
                        <MaterialIcons name='info-outline' color={PRIMARY_COLOR} size={25} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    renderChildItem({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.selection(item, false, true)} style={styles.containerContent1}>
                <View style={styles.renderItemImg}>
                    <Image style={[styles.card1, { width: width / 2.6 }]} source={{ uri: `data:image/jpeg;base64,${item.coverImage}` }}></Image>
                </View>
                <View style={styles.renderItemText1}>
                    <Text numberOfLines={1} ellipsizeMode={"middle"} style={styles.categoryNameText}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    goBack() {
        this.setState({ article: false })
    }

    loader() {
        return (
            <View style={styles.loaderContainer}>
                <Placeholder
                    Animation={Shine}
                    Left={props => (<PlaceholderMedia style={[styles.loaderLeft, { width: this.state.modalVisible ? width / 2.6 : width / 2.3, height: this.state.modalVisible ? width / 2.6 : width / 2.3 }]} />)}
                    Right={props => (<PlaceholderMedia style={styles.loaderRight} />)}>
                    <PlaceholderMedia style={[styles.loaderContain, { width: this.state.modalVisible ? width / 2.6 : width / 2.3, height: this.state.modalVisible ? width / 2.6 : width / 2.3 }]} />
                </Placeholder>
            </View>
        )
    }

    audioPlay() {
        this.setState({ sound: !this.state.sound })
    }

    onLoad() {
        this.setState({ onLoadLoader: true })
        if (!this.props.isLastPage)
            this.props.dispatch(fetchModulesList(this.state.moduleId))
    }

    renderModalContent = () => (
        <View style={styles.content}>
            {!this.state.info && !this.state.article && (!this.props.isModuleListLoading || this.state.onLoadLoader) &&
                <ScrollView style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={1}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {
                            this.onLoad()
                        }
                    }}>
                    <FlatList
                        style={styles.FlatListStyle}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={this.props.moduleList}
                        // onEndReached={this.onLoad}
                        // onEndReachedThreshold={.5}
                        // scrollEventThrottle={1}
                        renderItem={this.renderChildItem}
                        extraData={this.state}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </ScrollView>}
            {this.props.isModuleListLoading && !this.state.info && !this.state.onLoadLoader &&
                <View>
                    {this.loader()}
                </View>}
            {!this.props.isLastPage && this.props.isModuleListLoading && this.state.onLoadLoader &&
                <MaterialIndicator color={PRIMARY_COLOR} size={20} />}
            {this.state.info && !this.state.article &&
                <View showsVerticalScrollIndicator={false} style={styles.fullFlux}>
                    <View style={styles.renderModalImg}>
                        <Image style={styles.cardModal} resizeMode='stretch' source={{ uri: `data:image/jpeg;base64,${this.state.selectedItem.picture}` }}></Image>
                    </View>
                    <View style={styles.renderItemText}>
                        <Text style={styles.modalNameText}>{this.state.selectedItem.moduleName}</Text>
                        <View style={styles.fullFlux}>
                            <WebView
                                showsVerticalScrollIndicator={false}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                onError={this.onError}
                                onLoadStart={this.onLoadStart}
                                onLoadEnd={this.onLoadEnd}
                                mixedContentMode="compatibility"
                                style={styles.fullFlux}
                                showsHorizontalScrollIndicator={false}
                                source={{ html: this.state.selectedItem && this.state.selectedItem.description }} />
                        </View>
                    </View>
                        <View style={{height: 25,justifyContent:'space-around',alignItems:'center',flexDirection:'row',position:'absolute',bottom:0,left:0,right:0}}>
                            <MaterialCommunityIcons onPress={() => this.selection(this.state.selectedItem, false, false)} name='microsoft-xbox-controller-menu' color={PRIMARY_COLOR} size={23} />
                            <MaterialCommunityIcons onPress={() => this.setState({ modalVisible: false, onLoadLoader: false })} name='close-circle' color={PRIMARY_COLOR} size={23} />
                        </View>
                </View>}
            {this.state.article &&
                <View style={styles.fullFlux}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => this.goBack()}>
                            <MaterialIcons name='arrow-back' color={PRIMARY_COLOR} size={25} />
                        </TouchableOpacity>
                        {this.state.selectedItem.isAudioAvailable != 0 &&
                            <TouchableOpacity onPress={() => this.audioPlay()}>
                                {this.state.sound ? <FontAwesome5 name='volume-mute' size={24} color={PRIMARY_COLOR} /> :
                                    <FontAwesome5 name='volume-up' size={24} color={PRIMARY_COLOR} />}
                            </TouchableOpacity>}
                    </View>
                    <View showsVerticalScrollIndicator={false} style={styles.fullFlux}>
                        <View style={styles.renderModalImg}>
                            <Image style={styles.cardModal} resizeMode='stretch' source={{ uri: `data:image/jpeg;base64,${this.state.selectedItem.coverImage}` }}></Image>
                        </View>
                        <View style={styles.renderItemText}>
                            <Text style={styles.modalNameText}>{this.state.selectedItem.name}</Text>
                            {this.state.sound &&
                                <View style={styles.videoContainer}>
                                    <AudioPlay navigation={this.props.navigation} videoLink={this.state.selectedItem && this.state.selectedItem.audio} />
                                    {/* <VideoPlayer
                                        ref={ref => {
                                            this.player = ref;
                                        }}
                                        source={{ uri: this.state.selectedItem && this.state.selectedItem.audio }}
                                        navigator={this.props.navigator}
                                        toggleResizeModeOnFullscreen={false}
                                        audioOnly={true}
                                        disableFullscreen={true}
                                        resizeMode={'cover'}
                                        disableBack={true}
                                        onBack={() => this.setState({ isVideoVisible: false })}
                                    /> */}
                                </View>}
                            <View style={styles.fullFlux}>
                                <WebView
                                    showsVerticalScrollIndicator={false}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    onError={this.onError}
                                    onLoadStart={this.onLoadStart}
                                    onLoadEnd={this.onLoadEnd}
                                    mixedContentMode="compatibility"
                                    style={styles.fullFlux}
                                    showsHorizontalScrollIndicator={false}
                                    source={{ html: this.state.selectedItem && utf8.decode(base64.decode(this.state.selectedItem.description)) }} />
                            </View>
                        </View>
                    </View>
                </View>}
        </View>
    );

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {!this.props.isLoading ?
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={this.props.fromAudio ? this.props.audio : this.props.modules}
                        renderItem={this.renderItem}
                        extraData={this.state}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    /> :
                    <View>
                        {this.loader()}
                        {this.loader()}
                        {this.loader()}
                        {this.loader()}
                    </View>}
                <Modal
                    isVisible={this.state.modalVisible}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    hasBackdrop={true}
                    backdropColor='black'
                    useNativeDriver={true}
                    backdropOpacity={.5}
                    onBackButtonPress={() => this.setState({ modalVisible: false, onLoadLoader: false })}
                    onBackdropPress={() => this.setState({ modalVisible: false, onLoadLoader: false })}
                    style={styles.modal}>
                    <View style={styles.modalStyle}>
                        {this.renderModalContent()}
                    </View>
                </Modal>
            </SafeAreaView>
        )
    }
}


export class TabViewExample extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
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
            index: 0,
            routes: [
                { key: 'first', title: I18n.t("Libraries") },
                { key: 'second', title: I18n.t("Audio") },
                { key: 'third', title: I18n.t("Modules") },
            ],
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.locale != prevProps.locale) {
            this.setState({
                routes: [
                    { key: 'first', title: I18n.t("Libraries") },
                    { key: 'second', title: I18n.t("Audio") },
                    { key: 'third', title: I18n.t("Modules") },
                ]
            })
        }
    }

    render() {
        return (
            <TabView
                navigationState={this.state}
                renderScene={(route) => {
                    switch (route.route.key) {
                        case 'first':
                            return <Libraries navigation={this.props.navigation}
                                categorySubjucts={this.props.categorySubjucts} />
                        case 'second':
                            return <Audio navigation={this.props.navigation} fromLibrary={true} />
                        // audio={this.props.audio}
                        //     dispatch={this.props.dispatch}
                        //     moduleList={this.props.moduleList}
                        //     isLoading={this.props.isLoading}
                        //     isLastPage={this.props.isLastPage}
                        //     modules={this.props.modules}
                        //     fromAudio={true}
                        //     isModuleListLoading={this.props.isModuleListLoading} />
                        case 'third':
                            return <Modules navigation={this.props.navigation}
                                dispatch={this.props.dispatch}
                                moduleList={this.props.moduleList}
                                isLoading={this.props.isLoading}
                                audio={this.props.audio}
                                isLastPage={this.props.isLastPage}
                                fromAudio={false}
                                isModuleListLoading={this.props.isModuleListLoading}
                                modules={this.props.modules} />
                        default:
                            return null;
                    }
                }
                }
                renderTabBar={(props) => {
                    return (
                        <TabBar
                            {...props}
                            onTabPress={({ route }) => {
                                //console.log(props)
                            }}
                            activeColor="#272727"
                            inactiveColor="#c2c3c8"
                            indicatorStyle={styles.indicatorStyle}
                            style={styles.tabStyle}
                            renderLabel={({ route, focused, color }) => (
                                <Text style={[styles.titleText, { color }]}>
                                    {route.title}
                                </Text>
                            )}
                        />
                    )
                }}
                onIndexChange={index => this.setState({ index })}
                labelStyle={styles.labelStyle}
                initialLayout={{ width: Dimensions.get('window').width }}
            />
        );
    }
}
const mapStateToProps = (state) => {
    return {
        categorySubjucts: state.dashboard.categorySubjucts,
        audio: state.library.audio,
        modules: state.library.modules,
        locale: state.userLogin.locale,
        moduleList: state.library.moduleList,
        isLoading: state.library.isLoading,
        isLastPage: state.library.isLastPage,
        isModuleListLoading: state.library.isModuleListLoading,
    }
}

export default connect(mapStateToProps)(TabViewExample)


const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        margin: 10,
        marginBottom: 80
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    logo: {
        marginVertical: 5,
        height: 30
    },
    containerContent: {
        height: width / 2.3,
        margin: width / 50,
        width: width / 2.3,
        padding: 10,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 13,
        shadowOpacity: .1,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        borderWidth: .01,
        borderColor: '#fff',
    },
    containerContent1: {
        height: width / 2.6,
        margin: width / 52,
        width: width / 2.6,
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 13,
        backgroundColor: '#fff',
        shadowOpacity: .1,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        borderWidth: .01,
        borderColor: '#fff',
    },
    categoryNameText: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16,
        flexWrap: 'wrap',
        textAlign: 'center'
    },
    statusText: {
        fontFamily: FONT_MEDIUM,
        textAlign: 'center',
        fontSize: 12,
        color: PRIMARY_COLOR
    },
    title: {
        fontSize: 18,
        color: '#272727',
        fontFamily: FONT_BOLD
    },
    emptyContainer: {
        backgroundColor: PRIMARY_COLOR,
        height: 3,
        width: 62,
        marginBottom: 10
    },
    indicatorStyle: {
        backgroundColor: PRIMARY_COLOR,
        margin: -5,
        width: width / 5,
        marginLeft: width / 30,
        height: 3
    },
    tabStyle: {
        backgroundColor: '#fff',
        height: 35,
        justifyContent: 'flex-start',
        shadowOpacity: 0,
        elevation: 0,
        marginRight: '15%',
        marginLeft: 15,
    },
    labelStyle: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 50
    },
    renderItemImg: {
        flex: 2,
        justifyContent: 'center'
    },
    renderItemText: {
        justifyContent: 'flex-start',
        padding: 2,
    },
    renderItemText1: {
        padding: 2,
    },
    titleText: {
        flex: 1,
        fontSize: 18,
        marginBottom: 5,
        marginHorizontal: -15,
        fontFamily: FONT_BOLD
    },
    content: {
        flex: 1,
        height: .7,
        width: width * .9,
        padding: 10,
        borderRadius: 20,
        backgroundColor: '#fff'
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff00'
    },
    modalStyle: {
        width: width * .9,
        height: height * .6,
        shadowOpacity: .1,
        borderRadius: 20,
        backgroundColor: '#ffffff'
    },
    card: {
        width: width / 7,
        height: width / 7,
    },
    card1: {
        marginTop: -5,
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        // width: width / 2.6,
        height: width / 3.8,
    },
    renderModalImg: {
        width: '100%',
        height: 130,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardModal: {
        height: 100,
        width: 100,
    },
    modalNameText: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16,
        textAlign: 'center',
    },
    loaderLeft: {
        borderRadius: 13,
        margin: width / 50,
        // width:width / 2.3,
        // height:width / 2.3,
        // marginLeft: 10, 
        marginVertical: 10
    },
    loaderRight: {
        width: 0,
        height: 0
    },
    loaderContain: {
        margin: width / 50,
        // width:width / 2.3,
        // height:width / 2.3,
        marginHorizontal: 10,
        borderRadius: 13,
        marginVertical: 10
    },
    videoContainer: {
        height: 130,
        marginHorizontal: -15,
        marginBottom: 8
    },
    FlatListStyle: {
        borderRadius: 20
    },
    fullFlux: {
        flex: 1,
    },
    webViewStyle: {
        height: height / 3.5,
        marginBottom: 10
    },
    infoContainer: {
        alignItems: 'center',
        flex: 1
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    loaderContainer: {
        backgroundColor: '#fff'
    },
    scrollContainer: {
        borderColor: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    listIcon: {
        position: 'absolute',
    },
})




