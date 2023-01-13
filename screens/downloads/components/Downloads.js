import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions, FlatList, Text, Image, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native'
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import Images from '../../../assets/images'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AntDesign from "react-native-vector-icons/AntDesign"
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR } from '../../../assets/color'
import { fetchDeleteBook } from '../../detailBuy/actions'
import AsyncStorage from '@react-native-community/async-storage'
import RNFetchBlob from 'rn-fetch-blob'
import { fetchAudioAdd } from '../../detailBuy/actions'
import { HeaderBackButton } from 'react-navigation-stack';


const { height, width } = Dimensions.get('screen')
var url = []

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
        }
        this.renderItem = this.renderItem.bind(this)
        this.readBook = this.readBook.bind(this)
        this.deleteBook = this.deleteBook.bind(this)
    }

    getUrl(bookid, callback) {
        AsyncStorage.getItem(bookid)
            .then(resp => {
                // const data = JSON.parse(resp);
                // console.log('name is ', resp);
                callback(resp)
            })
        // return url
    }

    componentDidMount() {
        this.props.navigation.setParams({
            this: this,
        })
    }

    readBook(item) {
        if (item && item.pdfPath && item.pdfPath.length > 0) {
            this.props.navigation.navigate('PdfViewer', { pdfPath: item.pdfPath })
        }
        else if (item.audioArray && item.audioArray.length > 0) {
            this.props.dispatch(fetchAudioAdd(item.audioArray))
            this.props.navigation.navigate('Detailbuy', { data: item })
        }
        else
            this.props.navigation.navigate('BookPage', { offlineData: item, offline: true })
    }

    deleteBook(item) {
        if (item && item.pdfPath && item.pdfPath.length > 0) {
            this.props.dispatch(fetchDeleteBook(item))
            RNFetchBlob.fs.unlink(item.pdfPath).then(() => {
            })
            RNFetchBlob.fs.unlink(item.imgPath).then(() => {
            })
        }
        else if (item.audioArray && item.audioArray.length > 0) {
            this.props.dispatch(fetchDeleteBook(item))
            for (let i = 0; i < item.audioArray.length; i++) {
                RNFetchBlob.fs.unlink(item.audioArray[i]).then(() => {
                })
            }
            RNFetchBlob.fs.unlink(item.imgPath).then(() => {
            })
        }
        else {
            this.props.dispatch(fetchDeleteBook(item))
            RNFetchBlob.fs.unlink(item.imgPath).then(() => {
            })
        }
    }

    renderItem({ item, index }) {
        console.log('item.imgPath', item.imgPath)
        return (
            <TouchableOpacity style={styles.renderContainer}>
                <View>
                    <Image style={styles.card} source={{ uri: Platform.OS === 'android' ? 'file://' + item.imgPath : '' + item.imgPath }}></Image>
                    {/* <Image style={styles.card} source={{ uri:url[index] }}></Image> */}
                </View>
                <View style={styles.renderSubContainer}>
                    <Text style={styles.nameText} numberOfLines={height < 660 ? 1 : 2}>{item.name}</Text>
                    <Text style={styles.pageText}>{item.totalpages} pages</Text>
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.readContainer} onPress={() => this.readBook(item)}>
                            <Text style={styles.buyText}>{item.audioArray ? I18n.t("Play_audio") : I18n.t("Read_now")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.deleteBook(item)} style={styles.deleteContainer}>
                            <MaterialIcons name='delete' color={PRIMARY_COLOR} size={30} />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{I18n.t("Downloads")}</Text>
                    <View style={styles.emptyContainer} />
                </View>
                <ScrollView>
                    {this.props.offlinebook.length == 0 ?
                        <View style={styles.iconContainer}>
                            <AntDesign name='frown' color={'#ECECEC'} size={50} />
                            <Text style={styles.infoText}>{I18n.t("No_books_found")}</Text>
                        </View> :
                        <FlatList
                            style={styles.flatlistStyle}
                            showsVerticalScrollIndicator={false}
                            data={this.props.offlinebook}
                            renderItem={this.renderItem}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />}
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        offlinebook: state.offlinebook.offlinebook
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
    card: {
        height: width / 4,
        width: width / 4,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    nameText: {
        flex: 1,
        fontSize: 17,
        fontFamily: FONT_SEMIBOLD,
    },
    pageText: {
        flex: 1,
        fontSize: 12,
        opacity: .6,
        fontSize: 13,
        width: '85%',
        fontFamily: FONT_REGULAR
    },
    renderContainer: {
        padding: 5,
        backgroundColor: '#fff',
        flexDirection: 'row',
        marginVertical: 10,
        borderWidth: .1,
        shadowOpacity: .2,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 2
    },
    readContainer: {
        backgroundColor: PRIMARY_COLOR,
        alignSelf: 'center',
        borderRadius: 4,
        width: '65%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: height < 660 ? 6 : 8,
        marginVertical: height < 660 ? 0 : 10,
        shadowOpacity: .2
    },
    buyText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: FONT_MEDIUM
    },
    renderSubContainer: {
        width: '68%',
        marginLeft: 5
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    deleteContainer: {
        justifyContent: 'center',
        alignItems: 'center'
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
        width: 82,
        marginBottom: 10
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        fontFamily: FONT_SEMIBOLD,
    },
    iconContainer: {
        height: height / 1.5,
        alignItems: 'center',
        justifyContent: 'center'
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