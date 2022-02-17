import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions, FlatList, Text, Image, ScrollView, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import Images from '../../../assets/images'
import AntDesign from "react-native-vector-icons/AntDesign"
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR } from '../../../assets/color'
import { PERIOD_LIST, AUTHORS_LIST, DOCUMENT_INFOS } from '../../../common/endpoints'
import Api from '../../../common/api'
import LinearGradient from 'react-native-linear-gradient'
import { TabView, TabBar } from 'react-native-tab-view';
import { MaterialIndicator } from 'react-native-indicators'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import { HeaderBackButton } from 'react-navigation-stack';

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
            books: [],
            page:1,
            isLastBookPage:false,
            bookIsLoading:true,
            data:this.props.navigation.getParam('data')
        }
        this.fetchBook = this.fetchBook.bind(this)
        this.renderBookItem = this.renderBookItem.bind(this)
        this.bookLoader = this.bookLoader.bind(this)
    }


    componentDidMount(){
        this.props.navigation.setParams({
            this: this,
        })
        this.fetchBook(true)
    }

    fetchBook(reset) {
        Api('get', DOCUMENT_INFOS, { authorId: this.state.data&&this.state.data.authorId,publisherId:this.props.navigation.getParam('publisherId'), page: reset ? 1 : this.state.page }).then(async (response) => {
            if (response) {
                this.setState({
                    books: this.state.books.concat(response.books),
                    fromOnLoad: true,
                    isLastBookPage: response.isLastPage,
                    bookIsLoading: false,
                    page: reset ? 2 : this.state.page + 1
                })
            }
        })
    }

    renderBookItem({ item, index }) {
        return (
            <TouchableOpacity style={styles.cardGrid} onPress={() => this.props.navigation.navigate('Detailbuy', { data: item })}>
                <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.card} source={item.coverImage ? { uri: item.coverImage } : Images.default}></Image>
                </LinearGradient>
                <Text style={[styles.nameText, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]} ellipsizeMode={"middle"} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.prizeContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                    <Text style={[styles.authorText, { textAlign: this.props.locale == 'ar' ? 'right' : 'left' }]} numberOfLines={1}>{item.author}</Text>
                    <TouchableOpacity style={[styles.prizeTextContainer, { width: I18n.locale == 'ar' ? 80 : 70 }]}
                        onPress={() => item.inapp_free == 0 ? this.props.navigation.navigate('Detailbuy', { data: item, fromPopular: true }) : this.props.navigation.navigate('Subscribe')}>
                        <Text style={styles.prizeText}>{item.inapp_free == 0 ? I18n.t("Free") : I18n.t("PREMIUM")}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }


    bookLoader() {
        return (
            <View>
                <Placeholder
                    Animation={Shine}
                    Left={props => (<PlaceholderMedia style={styles.loaderLeft1} />)}
                    Right={props => (<PlaceholderMedia style={styles.loaderRight1} />)}>
                    <PlaceholderMedia style={styles.loaderContain1} />
                </Placeholder>
            </View>
        )
    }

    onLoad() {
        if (!this.state.bookIsLoading && !this.state.isLastBookPage) {
            this.fetchBook()
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View>
                    <ScrollView showsVerticalScrollIndicator={false}
                        scrollEventThrottle={1}
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (isCloseToBottom(nativeEvent)) {
                                this.onLoad()
                            }
                        }}>
                        <FlatList
                            style={styles.flatList}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            data={this.state.books}
                            numColumns={2}
                            scrollEnabled={false}
                            renderItem={this.renderBookItem }
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        {!this.state.isLastBookPage &&this.state.books&&this.state.books.length>0&&
                        <View style={styles.indicatorContainer}>
                                    <MaterialIndicator color={PRIMARY_COLOR} size={20} />
                            </View>}
                        {(this.state.bookIsLoading||this.props.isLoading)&&
                        <View style={styles.loaderContainerStyle1}>
                            {this.bookLoader()}
                            {this.bookLoader()}
                            {this.bookLoader()}
                            {this.bookLoader()}
                        </View>}
                        {!this.state.bookIsLoading && this.state.books && this.state.books.length === 0 &&
                            <View style={styles.errorTextContainer}>
                                <AntDesign name='frown' color={'#ECECEC'} size={50} />
                                <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                            </View>}
                    </ScrollView>
                </View>
            </SafeAreaView>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        searchList: state.searchpage.searchList,
        isLoading: state.searchpage.isLoading,
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        margin: 10
    },
    nameText: {
        fontSize: 17,
        fontFamily: FONT_SEMIBOLD,
        flexShrink: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        width: '100%',
        marginBottom: 6
    },
    renderContainer: {
        padding: 8,
        width: 100,
        flexDirection: 'row',
        marginVertical: 6,
        borderWidth: .1,
        shadowOpacity: .2,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        borderRightWidth: .3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    title: {
        textAlign: 'left',
        fontSize: 18,
        color: '#272727',
        fontFamily: FONT_BOLD
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD,
    },
    iconContainer: {
        height: height / 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    indicatorStyle: {
        backgroundColor: PRIMARY_COLOR,
        margin: -5,
        width: width / 5.5,
        marginLeft: width / 20,
        height: 3,
        zIndex: 1
    },
    tabStyle: {
        height: 35,
        justifyContent: 'flex-start',
        shadowOpacity: 0,
        elevation: 0,
        backgroundColor: '#fff',
        marginRight: '40%'
    },
    titleText: {
        flex: 1,
        fontSize: 18,
        marginBottom: 5,
        textAlign: 'left',
        width: '100%',
        fontFamily: FONT_SEMIBOLD,
        justifyContent: 'flex-start',
    },
    labelStyle: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 50
    },
    cardGrid: {
        flex: 1 / 2,
        paddingHorizontal: 5,
    },
    card: {
        height: height / 4,
        width: '100%',
        borderRadius: 13,
        marginBottom: 4,
    },
    authorText: {
        fontSize: 12,
        opacity: .6,
        fontSize: 13,
        textAlign: 'right',
        fontFamily: FONT_REGULAR,
        flex: 1,
    },
    prizeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        alignItems: 'flex-end',
        marginTop: -4,
    },
    loaderLeft: {
        width: 70,
        height: 30,
        marginLeft: 5,
        marginRight: 5
    },
    loaderRight: {
        width: 70,
        height: 30,
        marginRight: 5
    },
    loaderContain: {
        height: 30,
        width: 70,
        marginRight: 5
    },
    loaderLeft1: {
        borderRadius: 13,
        width: width / 2 - 20,
        height: height / 4,
        marginLeft: 5, marginBottom: 30
    },
    loaderRight1: {
        width: 0,
        height: 0
    },
    loaderContain1: {
        width: width / 2 - 20,
        height: height / 4,
        marginHorizontal: 10,
        borderRadius: 13,
        marginBottom: 30
    },
    prizeTextContainer: {
        padding: 3,
        borderRadius: 20,
        backgroundColor: '#F4E7E7',
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5
    },
    prizeText: {
        color: PRIMARY_COLOR,
        fontSize: 12,
        fontFamily: FONT_SEMIBOLD,
    },
    loaderContainerStyle: {
        flexDirection: 'row',
        marginVertical: 10
    },
    loaderContainerStyle1: {
        marginVertical: 15
    },
    indicatorContainer: {
        height: 30,
        marginBottom: 60
    },
    whiteContainer: {
        backgroundColor: '#fff',
    },
    flatList: {
        marginTop: 10
    },
    logo: {
        marginVertical: 5,
        height: 30
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    errorTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 1.5,
    },
})