import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, FlatList, Image, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import { fetchApplication, fetchDashboard, resetDashboard, resetApplication } from '../../home/actions'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import { NEWS_ARTICLE } from '../../../common/endpoints'
import { MaterialIndicator } from 'react-native-indicators'
import AntDesign from "react-native-vector-icons/AntDesign"
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_ITALIC, FONT_LIGHT_ITALIC, FONT_LIGHT, FONT_MEDIUM, FONT_REGULAR, FONT_BOLD_ITALIC, FONT_EXTRA_BOLD, FONT_EXTRA_BOLD_ITALIC, FONT_BOLD } from '../../../assets/fonts'
import {
    BallIndicator,
    BarIndicator,
} from 'react-native-indicators';

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
            headerTitle: (
                <Text style={styles.textHeader1}>{params.title}</Text>),
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            index: this.props.navigation.getParam('index'),
            articles: [],
            isLoading: true,
            firstLoading: true,
            page: 1,
            isLastPage: false
        }
        this.renderPublications = this.renderPublications.bind(this)
        this.dataFetch = this.dataFetch.bind(this)
    }

    dataFetch() {
        this.setState({ isLoading: true })
        var articlecategoryid = 21
        if (this.props.navigation.getParam('id')) {
            articlecategoryid = this.props.navigation.getParam('id')
        }
        Api('get', NEWS_ARTICLE, { page: this.state.page, language: this.props.locale == 'ar' ? 1 : 2 }).then((response) => {
            if (response) {
                this.setState({ articles: this.state.articles.concat(response.articles), isLoading: false, page: parseInt(this.state.page) + 1, isLastPage: response.isLastPage, firstLoading: false })
            }
            else {
                this.setState({ isLoading: false })
            }
        })
    }

    componentDidMount() {
        this.dataFetch()
    }

    renderPublications({ item }) {
        var subbody = item && item.subbody.replace(/<style([\s\S]*?)<\/style>/gi, '');
        subbody = subbody.replace(/<script([\s\S]*?)<\/script>/gi, '');
        subbody = subbody.replace(/<\/div>/ig, '\n');
        subbody = subbody.replace(/<\/li>/ig, '\n');
        subbody = subbody.replace(/<li>/ig, '  *  ');
        subbody = subbody.replace(/<\/ul>/ig, '\n');
        subbody = subbody.replace(/<\/p>/ig, '\n');
        subbody = subbody.replace(/<br\s*[\/]?>/gi, "\n");
        subbody = subbody.replace(/<[^>]+>/ig, '');
        subbody = subbody.replace(/&nbsp;/ig, '');
        return (
            <TouchableOpacity style={[styles.cardGrid,{borderWidth:Platform.OS == 'ios'?0:.3}]} onPress={() => this.props.navigation.navigate('PublicationsDetails', { data: item, searchtext: this.props.navigation.getParam('encoded') })}>
                <LinearGradient style={styles.cardShared} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.shareContainer} resizeMode='stretch' source={item ? { uri: item.publicationIcon } : Images.default}>
                    </Image>
                </LinearGradient>
                <View style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle} textAlign='right' numberOfLines={2}>{item.categoryname}</Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.titleShared} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.title1} numberOfLines={1}>{item.creationdate}</Text>
                </View>
                {/* {this.state.index == 3 ?
                    <Highlighter
                        highlightStyle={styles.highlightStyle}
                        searchWords={[item.searchtext]}
                        numColumns={2}
                        style={styles.title}
                        textToHighlight={subbody}
                    /> : */}
                <Text style={[styles.title2,{textAlign:this.props.locale=='ar'?'right':'left'}]} numberOfLines={2}>{item.subbody}</Text>
            </TouchableOpacity >
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.SafeAreaViewContainer}>
                {!this.state.firstLoading ?
                    <ScrollView contentContainerStyle={styles.scroll}
                        scrollEventThrottle={1}
                        onMomentumScrollEnd={({ nativeEvent }) => {
                            if (isCloseToBottom(nativeEvent)) {
                                if (!this.state.isLastPage && !this.state.isLoading) {
                                    
                                    this.dataFetch()
                                }
                            }
                        }}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.props.isLoading}
                        //         onRefresh={() => this.dataFetch()}
                        //         colors={["#F47424"]}
                        //     />
                        // }
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            {this.state.articles && this.state.articles.length > 0 &&
                                <View style={styles.flatlist}>
                                    <FlatList
                                        numColumns={1}
                                        showsVerticalScrollIndicator={false}
                                        data={this.state.articles}
                                        renderItem={this.renderPublications}
                                        extraData={this.state}
                                        keyExtractor={(item, index) => (index.toString())}
                                    />
                                    {!this.state.isLastPage &&
                                        <MaterialIndicator color={PRIMARY_COLOR} size={25} />}
                                </View>}
                            {!this.state.isLoading && this.state.articles.length == 0 &&
                                <View style={styles.errorTextContainer}>
                                    <AntDesign name='frown' color={'#ECECEC'} size={50} />
                                    <Text style={styles.infoText}>No Records found</Text>
                                </View>}
                            {/* {(this.props.isLoading || this.props.showRetry) &&
                                    <Loader
                                        primaryColor='#CFCFCF'
                                        secondaryColor='#E7E7E7'
                                        animationDuration={500}
                                        loading={true}
                                        active
                                        pRows={0}
                                        tHeight={height * .25}
                                        titleStyles={{ borderRadius: 15 }}
                                        tWidth={width * .8}
                                        listSize={1}
                                        containerStyles={{
                                            height: height * .25,
                                            width: width * .8, marginLeft: 15,
                                            paddingLeft: 0
                                        }}
                                        title={true} />} */}
                        </View>
                    </ScrollView> :
                    <View style={styles.barIndicator}>
                        <BarIndicator color={PRIMARY_COLOR} size={34} />
                    </View>}
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        applications: state.dashboard.applications,
        publications: state.dashboard.publications,
        isLoading: state.dashboard.isLoading,
        isPublicationLoading: state.dashboard.isPublicationLoading,
        isLastPage: state.dashboard.isLastPage,
        locale: state.userLogin.locale,
    }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    SafeAreaViewContainer: {
        flex: 1,
        margin: 10,
        backgroundColor:'#fff'
    },
    scroll:{
        backgroundColor:'#fff'
    },
    section:{
        backgroundColor:'#fff'
    },
    flatlist:{
        backgroundColor:'#fff'
    },
    headerContainer: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    textHeader: {
        fontSize: 22,
        fontFamily: FONT_BOLD,
        color: TITLE_COLOR
    },
    textHeader1: {
        fontSize: 14,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR
    },
    cardGrid: {
        flex: 1,
        marginTop: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowOpacity: .1,
        shadowOffset: { width: 1, height: 0 },
        marginHorizontal: 2,
        marginBottom: 10,
        borderColor:'#9c9c9c',
        borderRadius: 10,
        padding: 5,
        paddingHorizontal: 10
    },
    cardShared: {
        height: 200,
        width: '98%',
        margin: 5,
        borderRadius: 15,
        backgroundColor:'#fff'
    },
    shareContainer: {
        flex: 1,
        borderRadius: 15,
        padding: 15,
        justifyContent: 'flex-end',
        borderRadius: 15
    },
    categoryContainer: {
        position: 'absolute',
        alignSelf: 'flex-end',
        borderBottomLeftRadius: 15,
        backgroundColor: PRIMARY_COLOR,
    },
    categoryTitle: {
        fontSize: 18,
        fontFamily: FONT_LIGHT_ITALIC,
        padding: 5,
        paddingHorizontal: 10,
        // backgroundColor: PRIMARY_COLOR,
        marginLeft: -5,
        color: TITLE_COLOR,
        textAlign: 'justify',
    },
    titleShared: {
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
        // width:width-115,
        textAlign: 'right',
        // textAlign:'justify',
        flex: 2.5,
    },
    title1: {
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        color: '#9c9c9c',
        alignSelf: 'flex-start',
        flex: 1
    },
    title2: {
        fontSize: 14,
        fontFamily: FONT_REGULAR,
        color: TITLE_COLOR,
        textAlign: 'justify',
        width: '100%',
        marginVertical: 10
    },
    nameContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingHorizontal:10,
        width: '98%',
    },
    barIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: height * .75
    },
    highlightStyle: {
        backgroundColor: 'yellow'
    },
    highlightContainer: {
        paddingBottom: 15
    },
    errorTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 1.5,
    },
    infoText: {
        fontFamily: FONT_MEDIUM,
        color: '#9c9c9c'
    }
})