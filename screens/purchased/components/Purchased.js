import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native'
import { PRIMARY_COLOR } from '../../../assets/color'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD } from '../../../assets/fonts'
import Images from '../../../assets/images'
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import Api from '../../../common/api'
import {BOOK_BOUGHT_LIST} from '../../../common/endpoints'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import AntDesign from "react-native-vector-icons/AntDesign"
import { HeaderBackButton } from 'react-navigation-stack';

const { height, width } = Dimensions.get('screen')
// const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
//     const paddingToBottom = 100;
//     return layoutMeasurement.height + contentOffset.y >=
//         contentSize.height - paddingToBottom;
// };

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
            purchasedBooks:[],
            isLoading:true
        }
        this.renderItem = this.renderItem.bind(this)
        // this.onLoad = this.onLoad.bind(this)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            this: this,
        })
        Api('get', BOOK_BOUGHT_LIST).then(async (response) => {
            if (response) {
                this.setState({purchasedBooks:response.boughtBooks,isLoading:false})
            }
        })
    }

    loader() {
        return (
            <View>
                <Placeholder
                    Animation={Shine}>
                    <PlaceholderMedia style={styles.loaderContain} />
                </Placeholder>
            </View>
        )
    }

    // onLoad() {
    //     this.setState({ onLoadLoader: true })
    //     if (!this.props.isLastPage)
    //     this.props.dispatch(fetchFavourites())
    // }

    renderItem({ item, index }) {
        console.log('item',item)
        return (
            <TouchableOpacity onPress={() =>this.props.navigation.navigate('Detailbuy', { data: item })} style={[styles.cardGrid,{flexDirection:this.props.locale=='ar'?'row-reverse':'row'}]}>
                <View styl={styles.cardContainer}>
                    <Image style={styles.card} source={{ uri:item.coverImage}}></Image>
                </View>
                <View style={styles.cardGridView}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.nameText,{textAlign:this.props.locale=='ar'?'right':'left'}]} numberOfLines={2} >{item.name}</Text>
                    </View>
                    <Text style={[styles.authorText,{textAlign:this.props.locale=='ar'?'right':'left'}]} numberOfLines={2}>{item.author}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title,{textAlign:this.props.locale=='ar'?'right':'left'}]}>{I18n.t("PURCHASED_BOOKS")}</Text>
                    <View style={[styles.emptyContainer,{alignSelf:this.props.locale=='ar'?'flex-end':'flex-start'}]} />
                </View>
                <ScrollView 
                    scrollEventThrottle={1}
                    // onMomentumScrollEnd={({ nativeEvent }) => {
                    //     if (isCloseToBottom(nativeEvent)) {
                    //         this.onLoad()
                    //     }
                    // }}
                     showsVerticalScrollIndicator={false}>
                    {this.state.purchasedBooks.length == 0&&!this.state.isLoading &&
                        <View style={styles.iconContain}>
                            <AntDesign name='frown' color={'#ECECEC'} size={50} />
                            <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                        </View>}
                        {this.state.purchasedBooks.length != 0&&!this.state.isLoading&&
                        <FlatList
                            style={styles.flatlistStyle}
                            showsVerticalScrollIndicator={false}
                            data={this.state.purchasedBooks}
                            renderItem={this.renderItem}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />}
                    {this.state.isLoading &&
                        <View style={styles.loadersContain}>
                            {this.loader()}
                            {this.loader()}
                            {this.loader()}
                            {this.loader()}
                            {this.loader()}
                            {this.loader()}
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
        height: width / 3,
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
        height: width / 3.5,
        width: width / 3.5,
        borderRadius: 8,
        marginBottom: 4,
        marginVertical: 10,
        marginHorizontal: 5,
        backgroundColor:'#ededed'
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
        height:30
    },
    cardContainer: {
        flex: 1
    },
    cardGridView: {
        justifyContent: 'flex-start',
        flex: 3,
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    nameText: {
        fontSize: 17,
        fontFamily: FONT_SEMIBOLD,
        width: '95%',
    },
    iconContainer: {
        justifyContent: 'center',
    },
    iconContain:{ 
        height: height / 1.5, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    authorText: {
        fontSize: 12,
        opacity: .6,
        fontSize: 13,
        width: '95%',
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
        width: 142,
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


