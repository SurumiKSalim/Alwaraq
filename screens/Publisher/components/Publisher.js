import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, SafeAreaView, ScrollView, Dimensions, I18nManager, TextInput } from 'react-native'
import Demo from '../../../mockData/homeData'
import images from '../../../assets/images'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import Images from '../../../assets/images'
import { connect } from 'react-redux'
import { PRIMARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import I18n from '../../../i18n'
import Login from '../../login'
import { PUBLISHER } from '../../../common/endpoints'
import Entypo from "react-native-vector-icons/Entypo"
import Api from '../../../common/api'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import AntDesign from "react-native-vector-icons/AntDesign"
import { MaterialIndicator,BarIndicator } from 'react-native-indicators'
import ReadMore from 'react-native-read-more-text'
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Modal from "react-native-modal"
import Icon from 'react-native-vector-icons/Ionicons'
import { DrawerActions } from 'react-navigation-drawer';

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
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => params.navigation.toggleDrawer()}>
                    <Entypo name='menu' color={TITLE_COLOR} size={36} />
                </TouchableOpacity>
            ),
            headerTitle: (
                <View style={styles.header}>
                    <Image style={styles.logo} source={Images.headerName} resizeMode='contain' />
                </View>),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 15 }} onPress={() => params.this.searchToogle()}>
                    <FontAwesome name='search' color={TITLE_COLOR} size={30} />
                </TouchableOpacity>
            ),
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
            publisher: [],
            isLoading: true,
            isLastPage: true,
            searchVisible: false,
            searchText: '',
            page: 1,
            encoded: ''
        }
        this.renderItem = this.renderItem.bind(this)
        this.fetchData = this.fetchData.bind(this)
        this.onSearch = this.onSearch.bind(this)
        this.searchToogle = this.searchToogle.bind(this)
        this.renderModal = this.renderModal.bind(this)
        this.onLoad = this.onLoad.bind(this)
    }

    fetchData(searchText, refresh) {
        this.setState({ isLoading: true, publisher: this.state.publisher, encoded: this.state.encoded })
        Api('get', PUBLISHER, { language: this.props.locale == 'ar' ? 1 : 2, searchtext: searchText ? searchText : this.state.encoded, page: this.state.page }).then((response) => {
            console.log('APP_INFO', response)
            if (response) {
                this.setState({ publisher: this.state.publisher.concat(response.publishers), isLastPage: response.isLastPage, isLoading: false, page: parseInt(this.state.page) + 1 })
            }
        })
    }

    async resetData(isSearch) {
        if (isSearch) {
            this.onSearch()
        }
        else {
            await this.setState({ publisher: [], page: 1, encoded: '' })
            this.fetchData()
        }
    }

    searchToogle() {
        if(!this.state.searchVisible ){
            this.setState({ searchText: null})
        }
        this.setState({ searchVisible: !this.state.searchVisible })
        this.props.navigation.setParams({
            this: this,
        })
    }

    async onSearch() {
        if (this.state.searchText?.length>0) {
            await this.setState({ publisher: [], page: 1, encoded: '' })
            this.setState({ publisher: [] })
            this.searchToogle();
            var base64 = require('base-64');
            var utf8 = require('utf8');
            var text = this.state.searchText;
            var bytes = utf8.encode(text);
            var encoded = base64.encode(bytes);
            this.setState({ publisher: [], encoded: encoded })
            this.fetchData(encoded, true)
        }
    }

    componentDidMount() {
        this.resetData()
        // this.props.navigation.dispatch(DrawerActions.closeDrawer());
        this.props.navigation.setParams({
            this: this,
            navigation:this.props.navigation
        })
        // I18nManager.forceRTL(true);
    }

    componentDidUpdate(prevProps) {
        if (this.props.locale != prevProps.locale) {
            this.resetData()
        }
    }


    loader() {
        return (
            <View>
                <Placeholder
                    Animation={Shine}>
                    {/* Left={props => (<PlaceholderMedia style={styles.loaderLeft} />)}
                    Right={props => (<PlaceholderMedia style={styles.loaderRight} />)}> */}
                    <PlaceholderMedia style={styles.loaderContain} />
                </Placeholder>
            </View>
        )
    }

    onLoad() {
        if (!this.state.isLastPage)
            this.fetchData()
    }

    _renderTruncatedFooter = (handlePress) => {
        return (
            <Text style={styles.show} onPress={handlePress}>
                {I18n.t("Read_More")}
            </Text>
        );
    }

    _renderRevealedFooter = (handlePress) => {
        return (
            <Text style={styles.show} onPress={handlePress}>
                SHOW LESS
            </Text>
        );
    }

    renderModal = () => (
        <SafeAreaView style={styles.content}>
            <View style={styles.renderModalContent}></View>
            <View style={styles.flexContainer}>
                <View style={[styles.textInputContainer, { height: 40 }]}>
                    <TextInput style={styles.searchText}
                        placeholder={I18n.t("Search")}
                        ref={ref => this.textInputRef = ref}
                        placeholderTextColor={'#9c9c9c'}
                        bufferDelay={5}
                        onChangeText={(text) => this.setState({ searchText: text })}
                    />
                    <View>
                        <TouchableOpacity style={styles.buyContainer} onPress={() => this.resetData(true)}>
                            <Text style={styles.buyText}>{I18n.t("Search")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.upIconStyle}>
                    <TouchableOpacity onPress={() => this.searchToogle()}>
                        <Icon name='ios-arrow-up' size={30} color={PRIMARY_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );


    renderItem({ item, index }) {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Author', { publisherId: item && item.publisherId })} style={styles.cardGrid}>
                <View style={{ marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                    <Image style={styles.card} source={{ uri: item && item.picture }}></Image>
                    <Text style={styles.nameText} numberOfLines={2}>{item && item.publisherName}</Text>
                </View>
                <ReadMore
                    numberOfLines={2}
                    renderTruncatedFooter={this._renderTruncatedFooter}
                    renderRevealedFooter={this._renderRevealedFooter}
                    onReady={this._handleTextReady}>
                    <Text style={[styles.description, { writingDirection: this.props.locale == 'ar' ? 'rtl' : 'auto' }]}>{item && item.description}</Text>
                </ReadMore>
                <Modal
                    isVisible={this.state.searchVisible}
                    animationIn={'slideInDown'}
                    animationOut={'slideOutUp'}
                    onSwipeComplete={() => this.close()}
                    hasBackdrop={true}
                    backdropOpacity={.02}
                    backdropTransitionOutTiming={300}
                    backdropColor={'black'}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    animationInTiming={1000}
                    animationOutTiming={800}
                    style={styles.bottomModal}
                >
                    <View style={styles.modal}>
                        {this.renderModal()}
                    </View>
                </Modal>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]}>{I18n.t("Publishers_Distributors")}</Text>
                    <View style={[styles.emptyContainer, { alignSelf: this.props.locale == 'ar' ? 'flex-end' : 'flex-start' }]} />
                </View>
                <ScrollView
                    scrollEventThrottle={1}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {
                            this.onLoad()
                        }
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoading}
                            onRefresh={() => this.resetData()}
                            colors={["#F47424"]}
                        />
                    } showsVerticalScrollIndicator={false}>
                    {this.state.publisher.length != 0 &&
                        <FlatList
                            style={{ marginBottom: 60 }}
                            showsVerticalScrollIndicator={false}
                            data={this.state.publisher}
                            renderItem={this.renderItem}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />}

                    {this.state.isLoading && this.state.publisher && this.state.publisher.length == 0 &&
                    <BarIndicator style={styles.loaderContainer} color={PRIMARY_COLOR} size={34} />}
                    {!this.state.isLastPage && this.state.publisher && this.state.publisher.length > 0 &&
                        <View style={styles.indicatorContainer}>
                            <MaterialIndicator color={PRIMARY_COLOR} size={20} />
                        </View>}
                    {this.state.publisher && this.state.publisher.length == 0 && !this.state.isLoading &&
                        <View style={styles.iconContain}>
                            <AntDesign name='frown' color={'#ECECEC'} size={50} />
                            <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                        </View>}
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        marginHorizontal: 15,
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
        shadowOpacity: .2,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: '#FFFFFF',
    },

    card: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginBottom: 4,
        marginVertical: 10,
        marginHorizontal: 5,
        backgroundColor: '#9c9c9c'
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
        textAlign: 'left',
        fontSize: 18,
        color: '#272727',
        fontFamily: FONT_BOLD
    },
    emptyContainer: {
        backgroundColor: PRIMARY_COLOR,
        height: 3,
        width: 140,
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
    bottomModal: {
        marginBottom: 0,
        justifyContent: 'flex-start',
    },
    modal: {
        marginHorizontal: -25,
        marginTop: -25,
        backgroundColor: '#fff',
        borderBottomRightRadius: 45,
        borderBottomLeftRadius: 45,
        marginTop: -50,
        height: 170
    },
    content: {
        marginHorizontal: 15,
        paddingTop: 35,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        borderColor: '#DDDDDD',
        flex: 1,
        justifyContent: 'flex-end'
    },
    textInputContainer: {
        elevation: 1,
        margin: 10,
        justifyContent: 'space-around',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: .15,
    },
    buyContainer: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
        alignSelf: 'flex-end',
        shadowOpacity: .2,
    },
    buyText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONT_MEDIUM,
        paddingHorizontal: 4
    },
    upIconStyle: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchText: {
        fontSize: 18,
        fontFamily: FONT_REGULAR,
        color: TITLE_COLOR,
        backgroundColor: '#fff',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: .15,
        // elevation: 1,
        flex: .9,
        height: 35,
        paddingHorizontal: 10,
        paddingVertical: 2
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: width - 30,
        height:height*.6, 
    },
})


