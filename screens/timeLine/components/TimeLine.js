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

    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props)
        this.state = {
            period: [],
            selectedPeriod: this.props.navigation.getParam('data') ? this.props.navigation.getParam('data').periodId : 1,
            authors: [],
            books: [],
            page: 1,
            authorPage: 1,
            isLoading: true,
            bookIsLoading: true,
            authorsIsLoading: false,
            authorBook: false,
            isLastBookPage: false,
            isLastAuthorPage: false,
            fromAuthorBookList: false,
            fromOnLoad: false
        }
        this.renderItem = this.renderItem.bind(this)
        this.periodSelection = this.periodSelection.bind(this)
        this.fetchBook = this.fetchBook.bind(this)
        this.fetchAuthor = this.fetchAuthor.bind(this)
        this.renderBookItem = this.renderBookItem.bind(this)
        this.renderAuthorItem = this.renderAuthorItem.bind(this)
        this.loader = this.loader.bind(this)
        this.bookLoader = this.bookLoader.bind(this)
        this.authorSelection = this.authorSelection.bind(this)
        this.onLoad = this.onLoad.bind(this)
    }

    componentDidMount() {
        Api('get', PERIOD_LIST).then(async (response) => {
            if (response) {
                this.setState({ period: response && response.period, isLoading: false })
                if (response.period[0] && !this.props.navigation.getParam('data')) {
                    this.fetchBook(response.period[0].periodId)
                }
                if (!this.props.firstTab) {
                    this.fetchAuthor(response.period[0].periodId)
                }
                if (this.props.navigation.getParam('data') && this.props.navigation.getParam('data').periodId) {
                    this.fetchBook(this.props.navigation.getParam('data').periodId)
                }
            }
        })
    }

    fetchAuthor(period, reset) {
        this.setState({ year: period })
        Api('get', AUTHORS_LIST, { period: period, page: reset ? 1 : this.state.authorPage }).then(async (response) => {
            if (response) {
                this.setState({
                    authors: this.state.authors.concat(response.authors),
                    authorsIsLoading: false,
                    fromOnLoad: true,
                    isLastBookPage: response.isLastPage,
                    authorPage: reset ? 2 : this.state.authorPage + 1
                })
            }
        })
    }

    fetchBook(period, authorId, reset) {
        this.setState({ year: period, authorId: authorId })
        Api('get', DOCUMENT_INFOS, { period: period, authorId: authorId, page: reset ? 1 : this.state.page }).then(async (response) => {
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

    renderItem({ item, index }) {
        return (
            <View style={styles.whiteContainer}>
                <TouchableOpacity onPress={() => this.periodSelection(index + 1, item.periodId)}
                    style={[styles.renderContainer, { backgroundColor: this.state.selectedPeriod == item.periodId ? PRIMARY_COLOR : '#fff' }]}>
                    <Text style={{ color: this.state.selectedPeriod == item.periodId ? '#fff' : '#000' }}>{item.period}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderBookItem({ item, index }) {
        return (
            <TouchableOpacity style={styles.cardGrid} onPress={() => this.props.navigation.push('Detailbuy', { data: item })}>
                <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.card} source={item.coverImage ? { uri: item.coverImage } : Images.default}></Image>
                </LinearGradient>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                <View  style={[styles.prizeContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.authorText} numberOfLines={1}>{item.author}</Text>
                    <TouchableOpacity style={[styles.prizeTextContainer, { width: I18n.locale == 'ar' ? 80 : 70 }]}
                        onPress={() => item.inapp_free == 0 ? this.props.navigation.push('Detailbuy', { data: item, fromPopular: true }) : this.props.navigation.navigate('Subscribe')}>
                        <Text style={styles.prizeText}>{item.inapp_free == 0 ? I18n.t("Free") : I18n.t("PREMIUM")}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    renderAuthorItem({ item, index }) {
        return (
            <TouchableOpacity style={styles.cardGrid} onPress={() => this.authorSelection(item)}>
                <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.card} source={item.picture ? { uri: item.picture } : Images.default}></Image>
                </LinearGradient>
                <Text style={styles.nameText} numberOfLines={1}>{item.authorName}</Text>
                <View style={styles.prizeContainer}>
                </View>
            </TouchableOpacity>
        )
    }

    periodSelection(index, period) {
        if (this.state.selectedPeriod != index) {
            this.setState({ selectedPeriod: index, fromOnLoad: false, isLastBookPage: false, fromAuthorBookList: false })
            if (this.props.firstTab) {
                this.setState({ bookIsLoading: true, books: [] })
                this.fetchBook(period, null, true)
            }
            else {
                this.setState({ authorsIsLoading: true, authors: [] })
                this.fetchAuthor(period, true)
            }
        }
        if (!this.props.firstTab)
            this.setState({ authorBook: false })
    }

    authorSelection(item) {
        this.setState({ authorBook: true, fromOnLoad: false, isLastBookPage: false, books: [], fromAuthorBookList: true })
        this.fetchBook(null, item.authorId, true)
    }

    loader() {
        return (
            <View>
                <Placeholder
                    Animation={Shine}
                    Left={props => (<PlaceholderMedia style={styles.loaderLeft} />)}
                    Right={props => (<PlaceholderMedia style={styles.loaderRight} />)}>
                    <PlaceholderMedia style={styles.loaderContain} />
                </Placeholder>
            </View>
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
        if ((this.props.firstTab && !this.state.bookIsLoading && !this.state.isLastBookPage) ||
            (this.state.fromAuthorBookList && !this.state.bookIsLoading && !this.state.isLastBookPage)) {
            this.setState({ bookIsLoading: true })
            this.fetchBook(this.state.year, this.state.authorId)
        }
        if ((!this.props.firstTab && !this.state.authorsIsLoading && !this.state.isLastBookPage) &&
            !this.state.fromAuthorBookList) {
            this.setState({ authorsIsLoading: true })
            this.fetchAuthor(this.state.year)
        }
    }

    getItemLayout(data, index) {
        return (
          {
            length:100,
            offset: 100* index,
            index
          }    
        );
      }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View>
                    {!this.state.isLoading ?
                        <FlatList
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            data={this.state.period}
                            ref={ref => (this.flatList = ref)}
                            horizontal={true}
                            getItemLayout={(data, index) => this.getItemLayout(data, index)}
                            renderItem={this.renderItem}
                            initialScrollIndex={this.props.navigation.getParam('data') ? this.props.navigation.getParam('data').periodId-1 : 0}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        /> :
                        <View style={styles.loaderContainerStyle}>
                            {this.loader()}
                            {this.loader()}
                        </View>}
                    {(this.props.firstTab && (!this.state.bookIsLoading || this.state.fromOnLoad)) ||
                        (!this.props.firstTab && (!this.state.authorsIsLoading || this.state.fromOnLoad)) ?
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
                                data={(this.props.firstTab || this.state.authorBook) ? this.state.books : this.state.authors}
                                numColumns={2}
                                scrollEnabled={false}
                                renderItem={(this.props.firstTab || this.state.authorBook) ? this.renderBookItem : this.renderAuthorItem}
                                extraData={this.state}
                                keyExtractor={(item, index) => index.toString()}
                            />
                            <View style={styles.indicatorContainer}>
                                {!this.state.isLastBookPage &&
                                    <MaterialIndicator color={PRIMARY_COLOR} size={20} />}
                            </View>
                        </ScrollView> :
                        <View style={styles.loaderContainerStyle1}>
                            {this.bookLoader()}
                            {this.bookLoader()}
                            {this.bookLoader()}
                            {this.bookLoader()}
                        </View>}
                    {((this.props.firstTab && !this.state.bookIsLoading && this.state.books && this.state.books.length == 0) ||
                        (!this.props.firstTab && !this.state.authorsIsLoading && this.state.authors && this.state.authors.length == 0)) &&
                        <View style={styles.iconContainer}>
                            <AntDesign name='frown' color={'#ECECEC'} size={50} />
                            <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                        </View>}
                    {this.state.fromAuthorBookList && this.state.isLastBookPage && this.state.books && this.state.books.length == 0 &&
                        <View style={styles.iconContainer}>
                            <AntDesign name='frown' color={'#ECECEC'} size={50} />
                            <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                        </View>}
                </View>
            </SafeAreaView>
        )
    }
}


export class TabViewExample extends React.Component {
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
            value: 0,
            index: 0,
            routes: [
                { key: 'first', title: I18n.t("Book_List") },
                { key: 'second', title: I18n.t("Author_List") },
            ],
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.locale != prevProps.locale) {
            this.setState({
                routes: [
                    { key: 'first', title: I18n.t("Book_List") },
                    { key: 'second', title: I18n.t("Author_List") },
                ]
            })
        }
    }

    componentDidMount(){
        this.props.navigation.setParams({
            this: this,
        })
    }

    render() {
        return (
            <TabView
                navigationState={this.state}
                renderScene={(route) => {
                    switch (route.route.key) {
                        case 'first':
                            return <App navigation={this.props.navigation}
                                firstTab={true}
                                locale={this.props.locale}
                                dispatch={this.props.dispatch} />
                        case 'second':
                            return <App navigation={this.props.navigation}
                                firstTab={false}
                                locale={this.props.locale}
                                dispatch={this.props.dispatch} />
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
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(TabViewExample)

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
        textAlign: 'right'
    },
    renderContainer: {
        padding: 8,
        width:100,
        flexDirection: 'row',
        marginVertical: 6,
        borderWidth: .1,
        shadowOpacity: .2,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        borderRightWidth: .3,
        justifyContent:'center',
        alignItems:'center',
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
})