import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, Dimensions, FlatList, Button, TouchableOpacity, ImageBackground, Image, SafeAreaView, StatusBar, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, AnimatedRegion, Animated, Marker, } from 'react-native-maps'
import { connect } from 'react-redux'
import Images from '../../../assets/images'
import { MaterialIndicator } from 'react-native-indicators'
import LinearGradient from 'react-native-linear-gradient'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_PRIMARY, FONT_ARG_REGULAR, FONT_SEMIBOLD, FONT_MEDIUM, FONT_LIGHT, FONT_REGULAR, FONT_BOLD } from '../../../assets/fonts'
import images from '../../../assets/images';
// import ReadMore from 'react-native-read-more-text'
import Api from '../../../common/api'
import { MAP, DOCUMENT_INFOS } from '../../../common/endpoints'
import Modal from "react-native-modal"
import EntypolIcons from 'react-native-vector-icons/Entypo'
import FontistoIcons from 'react-native-vector-icons/Fontisto'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import Share from 'react-native-share'
import Icon from 'react-native-vector-icons/Ionicons'
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
        super(props);
        this.state = {
            handleTextReady: false,
            swipeablePanelActive: false,
            selectedLocation: '',
            feed: [],
            isLoading: true,
            page: 1,
            bookResponse: null,
            isLastPage: false,
            isBookLoading: false,
            data: this.props.navigation.getParam('data', null),
            // region: {
            //     latitude: 37.78825,
            //     longitude: 38.78825,
            //     latitudeDelta: 0.51922,
            //     longitudeDelta: 0.51922,
            // }
        };
        this.fitToMarkersToMap = this.fitToMarkersToMap.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.getLocation = this.getLocation.bind(this)
        this.onLoad = this.onLoad.bind(this)
        this.loader = this.loader.bind(this)
        this.markerSelect = this.markerSelect.bind(this)
        console.log('this.props.nav', this.props.navigation.getParam('data', null))
    }

    componentDidMount() {
        this.props.navigation.setParams({
            this: this,
        })
        if (!this.props.navigation.getParam('data')) {
            Api('get', MAP).then(async (response) => {
                if (response) {
                    console.log('MAP', response)
                    this.setState({ feed: response && response.locations, isLoading: false })
                    console.log('response.locations', response.locations)
                }
            })
        }
        else {
            this.setState({ feed: this.props.navigation.getParam('data'), isLoading: false })
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.feed != this.state.feed) {
            setTimeout(() => {
                this.fitToMarkersToMap(this.state.feed)
            }, 200);
        }
        if (prevState.selectedLocation != this.state.selectedLocation) {
            this.onLoad()
        }
    }

    fitToMarkersToMap(location) {
        console.log('response.dsfgh', location)
        if (location && location.length > 0) {
            if (location.length == 1) {
                console.log('ccc', location[0])
                if (this.props.navigation.getParam('data')) {
                    var region = {
                        latitude: location[0].latitude,
                        longitude: location[0].longitude,
                        latitudeDelta: 0.51922,
                        longitudeDelta: 0.51922,
                    }
                }
                else {
                    var region = {
                        ...location[0].location,
                        latitudeDelta: 0.51922,
                        longitudeDelta: 0.51922,
                    }
                }
                this.map.animateToRegion(region, 1000)
                return 0;
            }
            this.map.fitToSuppliedMarkers(location.map((trip, index) => index.toString()), true);

        }
    }

    openPanel = (item) => {
        console.log('vvvzasdw', item)
        let region = {
            latitude: this.state.selectedLocation.latitude,
            longitude: this.state.selectedLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0922,
        }
        this.setState({ swipeablePanelActive: true });
        // this.setState({ region: region });
        // this.onLoad(item)
    };


    onLoad() {
        console.log('qqqqqq')
        if (!this.state.isBookLoading && !this.state.isLastPage) {
            this.setState({ isBookLoading: true });
            Api('get', DOCUMENT_INFOS, { latitude: this.state.selectedLocation.latitude, longitude: this.state.selectedLocation.longitude, page: this.state.page }).then(async (response) => {
                if (response) {
                    this.setState({ bookResponse: this.state.bookResponse ? this.state.bookResponse.concat(response.books) : response.books, isBookLoading: false, page: this.state.page + 1, isLastPage: response && response.isLastPage })
                }
            })
        }
    }

    loader() {
        return (
            <View style={styles.scrollContainer}>
                <Placeholder
                    Animation={Shine}
                    Left={props => (<PlaceholderMedia style={styles.loaderLeft} />)}
                    Right={props => (<PlaceholderMedia style={styles.loaderRight} />)}>
                    <PlaceholderMedia style={styles.loaderContain} />
                </Placeholder>
            </View>
        )
    }

    renderModal = () => (
        <View style={styles.content1}>
            <View style={[styles.modalClose, { paddingHorizontal: 15 }]}>
                <TouchableOpacity style={styles.closeIcon} onPress={() => this.closePanel()}>
                    <Icon name='md-close-circle' size={30} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>
            <ScrollView
                scrollEventThrottle={1}
                onMomentumScrollEnd={({ nativeEvent }) => {
                    if (isCloseToBottom(nativeEvent)) {
                        this.onLoad()
                    }
                }}
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}>
                <FlatList
                    style={styles.flatlistStyle}
                    showsVerticalScrollIndicator={false}
                    data={this.state.bookResponse}
                    scrollEnabled={false}
                    numColumns={2}
                    // onEndReached={()=>this.openPanel()}
                    renderItem={this.renderItem}
                    extraData={this.state}
                    keyExtractor={(item, index) => index.toString()}
                />
                {this.state.isBookLoading && !this.state.bookResponse &&
                    <View>
                        {this.loader()}
                    </View>}
                {!this.state.isLastPage && this.state.isBookLoading && this.state.bookResponse &&
                    <MaterialIndicator color={PRIMARY_COLOR} size={20} />}
            </ScrollView>
        </View>
    );

    closePanel = () => {
        this.setState({ swipeablePanelActive: false });
        setTimeout(() => {
        }, 1000);
    };

    renderItem({ item }) {
        return (
            <TouchableOpacity onPress={e => { this.setState({ swipeablePanelActive: false }, () => this.props.navigation.navigate('Detailbuy', { data: item, fromPopular: true })) }} style={styles.containerContent1}>
                <View style={styles.renderItemImg}>
                    <Image style={[styles.card1, { width: width / 2.6 }]} source={{ uri: item.coverImage }}></Image>
                </View>
                <View style={styles.renderItemText1}>
                    <Text numberOfLines={1} style={styles.categoryNameText}>{item.name}</Text>
                    {/* <Text style={styles.statusText}>{item.author}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }

    getLocation() {
        let location = {
            latitude: 1,
            longitude: 1
        }
        this.state.feed && this.state.feed.map((item) => {
            return location = {
                latitude: item.latitude,
                longitude: item.longitude
            }
        })
        return location
    }

    markerSelect(item) {
        if (!this.props.navigation.getParam('data')) {
            this.setState({ selectedLocation: item, isLastPage: false, page: 1, bookResponse: [] })
            this.openPanel(item)
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='default' translucent={false} />
                {this.state.isLoading &&
                    <View style={styles.loading}>
                        <MaterialIndicator color={PRIMARY_COLOR} size={24} />
                        <Text style={styles.loadingText}>Loading . . .</Text>
                    </View>}
                <MapView
                    style={styles.map}
                    fitToElements={true}
                    ref={ref => { this.map = ref; }}
                    region={this.state.region}
                    onRegionChange={this.getLocation}
                >
                    {this.state.feed && this.state.feed.length > 0 && this.state.feed.map(((item, index) =>
                        <Marker
                            coordinate={{
                                latitude: item.latitude,
                                longitude: item.longitude,
                            }}
                            title={item.totalBooks ?'Available Books :' + item.totalBooks: item.query}
                            // title={'Available Books :' + item.totalBooks}
                            key={index.toString()}
                            identifier={index.toString()}
                            onPress={() => this.markerSelect(item)}
                        />
                        // console.log('map',item)
                    ))
                    }
                </MapView>
                <Modal
                    isVisible={this.state.swipeablePanelActive}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    hasBackdrop={true}
                    backdropColor='black'
                    useNativeDriver={true}
                    backdropOpacity={.5}
                    onBackButtonPress={() => this.setState({ swipeablePanelActive: false })}
                    onBackdropPress={() => this.setState({ swipeablePanelActive: false })}
                    style={styles.modal}>
                    <View style={styles.modalContainer}>
                        {this.renderModal()}
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    return {
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject
    },
    back: {
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        top: Platform.OS !== 'ios' ? 20 : 50,
        left: 15,
        zIndex: 5
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff00'
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
    textInput: {
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: SECONDARY_COLOR,
        paddingLeft: 15,
        paddingTop: 0,
        paddingBottom: 0,
        justifyContent: 'center',
        textAlign: 'left',
    },
    card: {
        width: width * 1,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        overflow: 'hidden',
    },
    imageStyle: {
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        overflow: 'hidden',
    },
    linear: {
        width: '100%',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15
    },
    profileContainer: {
        padding: 15,
        flexDirection: 'row'
    },
    textContent: {
        flex: 4
    },
    close: {
        flex: 1,
        alignItems: 'flex-end'
    },
    cardHeader: {
    },
    profie: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    profileImage: {
        height: 40,
        width: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFFFFF'
    },
    name: {
        paddingLeft: 10
    },
    textName: {
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        color: '#FFFFFF',
        lineHeight: 17
    },
    time: {
        fontSize: 12,
        fontFamily: FONT_LIGHT,
        color: '#FFFFFF',
    },
    tripName: {
        fontSize: 24,
        fontFamily: FONT_REGULAR,
        color: '#FFFFFF',
        paddingBottom: 5,
    },
    listContainer: {
        flexWrap: 'wrap',
        paddingTop: 15,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF'
    },
    content: {
        paddingBottom: 15,
        paddingLeft: 2
    },
    cardList: {
        flexDirection: 'row',
        paddingBottom: 10,
    },
    image: {
        width: 60,
        height: 40,
        borderRadius: 8
    },
    textContainer: {
        paddingLeft: 15,
        flex: 1,
    },
    articleName: {
        fontFamily: FONT_MEDIUM,
        fontSize: 18,
        color: '#4C4C4C',
        lineHeight: 20
    },
    title: {
        fontFamily: FONT_BOLD,
        fontSize: 16,
        color: '#4C4C4C',
        lineHeight: 20
    },
    date: {
        fontFamily: FONT_REGULAR,
        fontSize: 12,
        color: '#ABABAB',
    },
    description: {
        fontFamily: FONT_REGULAR,
        fontSize: 16,
        color: '#303030',
        lineHeight: 20,
    },
    loading: {
        position: 'absolute',
        top: height * .15,
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 4,
        paddingHorizontal: 10,
        borderRadius: 25,
        paddingVertical: 10,
        width: '50%'
    },
    noArticles: {
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        textAlign: 'center'
    },
    show: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 14,
        fontFamily: FONT_BOLD,
        color: PRIMARY_COLOR
    },
    linkButton: {
        height: 35,
        width: 35,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "black",
        shadowOffset: { height: 1 },
        shadowOpacity: 0.3,
        marginRight: 15
    },
    shareButton: {
        height: 35,
        width: 35,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "black",
        shadowOffset: { height: 1 },
        shadowOpacity: 0.3,
    },
    bottomModal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    content1: {
        flex: 1,
        height: .7,
        width: width * .9,
        padding: 10,
        borderRadius: 20,
    },
    modalClose: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
    },
    bottomModal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: width * .9,
        height: height * .6,
        shadowOpacity: .1,
        borderRadius: 20,
        backgroundColor: '#ffffff'
    },
    closeIcon: {
        flex: 1,
        alignItems: 'flex-end'
    },
    renderItemContainer: {
        marginTop: 5,
        marginBottom: 10,
        borderWidth: .1,
        padding: 15,
        shadowOpacity: .1,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        backgroundColor: '#FFF'
    },
    renderItemSubContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    nameText: {
        textAlign: 'right',
        flex: 1
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
    renderItemImg: {
        flex: 2,
        justifyContent: 'center'
    },
    card1: {
        marginTop: -5,
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        // width: width / 2.6,
        height: width / 3.8,
    },
    renderItemText1: {
        justifyContent: 'flex-end',
        padding: 2,
        flex: 1,
    },
    categoryNameText: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16
    },
    loaderLeft: {
        borderRadius: 13,
        margin: width / 50,
        width: width / 2.6,
        height: width / 2.6,
        // marginLeft: 10, 
        marginVertical: 10
    },
    loaderRight: {
        width: 0,
        height: 0
    },
    loaderContain: {
        margin: width / 50,
        width: width / 2.6,
        height: width / 2.6,
        marginHorizontal: 10,
        borderRadius: 13,
        marginVertical: 10
    },
    scrollContainer: {
        backgroundColor: '#fff'
    },
    loadingText: {
        fontSize: 18,
        fontFamily: FONT_LIGHT,
        textAlign: 'center',
        zIndex: 5
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