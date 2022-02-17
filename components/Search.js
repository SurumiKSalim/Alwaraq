import React, { Component, Fragment } from 'react'
import { Platform, Text, View, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, PermissionsAndroid } from 'react-native'
import { connect } from 'react-redux'
import { FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD } from '../assets/fonts'
import { TITLE_COLOR, PRIMARY_COLOR } from '../assets/color'
import Modal from "react-native-modal"
import { fetchSearchResult, resetSearchResult } from '../screens/searchPage/actions'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { resetSearchModal } from '../screens/home/actions'
import _ from 'lodash'
import I18n from '../i18n'
import Api from '../common/api'
import { PERIOD_LIST } from '../common/endpoints'
// import Voice, {
//     SpeechRecognizedEvent,
//     SpeechResultsEvent,
//     SpeechErrorEvent,
// } from '@react-native-community/voice';


var reportOptions = [{label:"Library",index:0},{label:"Book_Names",index:3},{label:"authors",index:4},{label:"Quran",index:1},{label:"Lisan",index:2}]
var speechShowTxt = ''
class App extends Component {
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            isHidden: true,
            searchText: '',
            firstRadioValue: 0,
            secondRadioValue: 1,
            wordFormRadio: 1,
            subRadioValue: 1,
            timePeriod:false,
            period: [],
            selectedPeriod: '',
            periodId: null

        }
        this.close = this.close.bind(this)
        this.renderModal = this.renderModal.bind(this)
        this.onSearch = this.onSearch.bind(this)
        this.onReport = this.onReport.bind(this)
        this.renderTimeItem = this.renderTimeItem.bind(this)
        // this.voiceFetch = this.voiceFetch.bind(this)
        // Voice.onSpeechStart = this.onSpeechStart;
        // Voice.onSpeechRecognized = this.onSpeechRecognized;
        // Voice.onSpeechEnd = this.onSpeechEnd;
        // Voice.onSpeechError = this.onSpeechError;
        // Voice.onSpeechResults = this.onSpeechResults;
        // Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    }

    componentDidMount() {
        Api('get', PERIOD_LIST).then(async (response) => {
            if (response) {
                this.setState({ period: response && response.period, isLoading: false })
            }
        })
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState.searchText != this.state.searchText) {
    //         console.log('wlkjrdfh', this.textInputRef, this.state)
    //         this.forceUpdate()
    //     }
    // }

    // voiceFetch(value) {
    //     // console.log('voiceFetch', value)
    //     // this.setState({
    //     //     searchText: value && value[0]&&value[0].toString(),
    //     // });
    // }

    // onSpeechStart = (e: any) => {
    //     console.log('onSpeechStart: ', e);
    //     this.setState({
    //         started: '√',
    //     });
    // };

    // componentWillUnmount() {
    //     Voice.destroy().then(Voice.removeAllListeners);
    // }

    // onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    //     console.log('onSpeechRecognized: ', e);
    //     this.setState({
    //         recognized: '√',
    //     });
    // };

    // onSpeechEnd = (e: any) => {
    //     console.log('onSpeechEnd: ', e);
    //     this.setState({
    //         end: '√',
    //     });
    // };

    // onSpeechError = (e: SpeechErrorEvent) => {
    //     console.log('onSpeechError: ', e);
    //     this.setState({
    //         error: JSON.stringify(e.error),
    //     });
    // };

    // onSpeechResults = (e: SpeechResultsEvent) => {
    //     this.setState({ searchText: e.value && e.value[0], key: 2 })
    // };

    // // onSpeechPartialResults = (e: SpeechResultsEvent) => {
    // //     console.log('onSpeechPartialResults: ', e);
    // //     this.setState({
    // //         partialResults: e.value,
    // //     });
    // // };

    // _startRecognizing = async () => {
    //     this.setState({
    //         recognized: '',
    //         pitch: '',
    //         error: '',
    //         started: '',
    //         searchText: '',
    //         partialResults: [],
    //         end: '',
    //     });

    //     try {
    //         await Voice.start('en-US');
    //     } catch (e) {
    //         console.error(e);
    //     }
    // };

    renderItem({ item, index }) {
        return (
            <TouchableOpacity style={[styles.cardGrid, {}]} >
                <Text style={styles.nameText1} numberOfLines={2} >{item}</Text>
            </TouchableOpacity>
        )
    }

    periodSelection(index, period) {
        if (this.state.selectedPeriod != index) {
            this.setState({ selectedPeriod: index,periodId:period })
        }
    }

    renderTimeItem({ item, index }) {
        console.log('item',item.periodId,this.state.selectedPeriod)
        return (
            <View style={styles.whiteContainer}>
                <TouchableOpacity onPress={() => this.periodSelection(index + 1, item.periodId)}
                    style={[styles.renderContainer, { backgroundColor: this.state.selectedPeriod == item.periodId ? PRIMARY_COLOR : '#fff' }]}>
                    <Text style={{ color: this.state.selectedPeriod == item.periodId ? '#fff' : '#000' }}>{item.period}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    onReport(item) {
        this.setState({timePeriod:false})
        if (this.state.firstRadioValue != item)
            this.setState({ firstRadioValue: item, })
        // if(item==1||item==2){
        //     this.setState({timePeriod:false})
        // }
    }

    renderModal() {
        return (
            <SafeAreaView style={styles.content}>
                <View style={styles.renderModalContent}></View>
                {this.props.searchVisible &&
                    <View style={styles.flexContainer}>
                        <View style={[styles.flexContainer, { marginTop: Platform.OS == 'ios' ? 20 : 0 }]}>
                            <View style={[styles.radioContainerContent, { height: this.state.firstRadioValue == 2 ? 180 : 130, flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                                <Text style={styles.searchTextContent}>{I18n.t("Search_In")}</Text>
                                <View style={styles.flexContainer}>
                                    {reportOptions.map((item, index) => {
                                        return (
                                            <TouchableOpacity onPress={() => this.onReport(item.index)} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                                <MaterialCommunityIcons name={this.state.firstRadioValue != item.index ? 'circle-outline' : 'circle-slice-8'} color={PRIMARY_COLOR} size={24} />
                                                <Text style={styles.searchOptionText}>{I18n.t(item.label)}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                    {this.state.firstRadioValue == 2 &&
                                        <View style={styles.radioSubContainer}>
                                            <TouchableOpacity onPress={() => { this.setState({ subRadioValue: 1 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                                <MaterialCommunityIcons name={this.state.subRadioValue == 1 ? 'circle-slice-8' : 'circle-outline'} color={PRIMARY_COLOR} size={24} />
                                                <Text style={styles.searchOptionText}>الجذور </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { this.setState({ subRadioValue: 2 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                                <MaterialCommunityIcons name={this.state.subRadioValue == 1 ? 'circle-outline' : 'circle-slice-8'} color={PRIMARY_COLOR} size={24} />
                                                <Text style={styles.searchOptionText}>كامل النص</Text>
                                            </TouchableOpacity>
                                        </View>}
                                </View>
                            </View>
                            <View style={[styles.upIconStyle, { height: 50, marginBottom: 8 }]}>
                                <View style={[styles.radioContainerContent, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                                    <Text style={styles.searchTextContent}>{I18n.t("Search")}</Text>
                                    <View style={styles.flexContainer}>
                                        <TouchableOpacity onPress={() => { this.setState({ secondRadioValue: 1 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                            <MaterialCommunityIcons name={this.state.secondRadioValue == 1 ? 'circle-slice-8' : 'circle-outline'} color={PRIMARY_COLOR} size={24} />
                                            <Text style={styles.searchOptionText}>{I18n.t("Any")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { this.setState({ secondRadioValue: 2 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                            <MaterialCommunityIcons name={this.state.secondRadioValue == 1 ? 'circle-outline' : 'circle-slice-8'} color={PRIMARY_COLOR} size={24} />
                                            <Text style={styles.searchOptionText}>{I18n.t("Exact_Phrase")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.upIconStyle, { height: 50 }]}>
                                <View style={[styles.radioContainerContent, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                                    <Text style={styles.searchTextContent}>{I18n.t("Search_Options")}</Text>
                                    <View style={styles.flexContainer}>
                                        <TouchableOpacity onPress={() => { this.setState({ wordFormRadio: 1 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                            <MaterialCommunityIcons name={this.state.wordFormRadio == 1 ? 'circle-slice-8' : 'circle-outline'} color={PRIMARY_COLOR} size={24} />
                                            <Text style={styles.searchOptionText}>{I18n.t("Complete")}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { this.setState({ wordFormRadio: 2 }) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                            <MaterialCommunityIcons name={this.state.wordFormRadio != 2 ? 'circle-outline' : 'circle-slice-8'} color={PRIMARY_COLOR} size={24} />
                                            <Text style={styles.searchOptionText}>{I18n.t("With_Suffix_and_prefix")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            {(this.state.firstRadioValue==3||this.state.firstRadioValue==4)&&
                            <View style={[styles.upIconStyle, { height: 40}]}>
                                <View style={[styles.radioContainerContent, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}>
                                    <Text style={styles.searchTextContent}>Time Line</Text>
                                    <View style={styles.flexContainer}>
                                        <TouchableOpacity onPress={() => { this.setState({ timePeriod: !this.state.timePeriod,periodId:null,selectedPeriod:''}) }} style={[styles.radioContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row', marginLeft: this.props.locale == 'ar' ? 20 : 0 }]}>
                                            <MaterialCommunityIcons name={!this.state.timePeriod ? 'circle-outline' : 'circle-slice-8'} color={PRIMARY_COLOR} size={24} />
                                            <Text style={styles.searchOptionText}>Time Period</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>}
                            {this.state.timePeriod&&
                            <View style={[styles.upIconStyle, { height: 40, marginTop: 10 }]}>
                                <FlatList
                                    showsHorizontalScrollIndicator={false}
                                    showsVerticalScrollIndicator={false}
                                    data={this.state.period}
                                    ref={ref => (this.flatList = ref)}
                                    horizontal={true}
                                    renderItem={this.renderTimeItem}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View>}
                        </View>
                        <View style={[styles.textInputContainer, { height: 40 }]}>
                            {/* <TouchableOpacity onPress={this._startRecognizing.bind(this)}>
                                <MaterialIcons name='keyboard-voice' size={20} color={PRIMARY_COLOR} />
                            </TouchableOpacity> */}
                            <TextInput style={styles.searchText}
                                key={this.state.key}
                                placeholder={I18n.t("Search")}
                                ref={ref => this.textInputRef = ref}
                                placeholderTextColor={'#9c9c9c'}
                                value={this.state.searchText}
                                // bufferDelay={5}
                                onChangeText={(text) => this.setState({ searchText: text })}
                            />
                            <View>
                                <TouchableOpacity style={styles.buyContainer} onPress={() => this.onSearch()}>
                                    <Text style={styles.buyText}>{I18n.t("Search")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* <FlatList
                                style={styles.flatlistStyle}
                                showsVerticalScrollIndicator={false}
                                data={this.props.searchList}
                                renderItem={this.renderItem}
                                extraData={this.state}
                                keyExtractor={(item, index) => index.toString()}
                            /> */}
                        <View style={styles.upIconStyle}>
                            <TouchableOpacity onPress={() => this.close()}>
                                <Icon name='ios-arrow-up' size={30} color={PRIMARY_COLOR} />
                            </TouchableOpacity>
                        </View>
                    </View>}
            </SafeAreaView>
        );
    }


    close() {
        // Voice.destroy().then(Voice.removeAllListeners);
        console.log('start', this.state.searchText)
        this.setState({ searchText: '',selectedPeriod:null })
        this.props.dispatch(resetSearchModal(false))
    }
    onSearch() {

        if (this.state.searchText !== '') {
            console.log('hasf dgjskhcvskla;djsfbvsadk')
            this.close();
            var base64 = require('base-64');
            var utf8 = require('utf8');
            var text = this.state.searchText;
            var bytes = utf8.encode(text);
            var encoded = base64.encode(bytes);
            this.props.dispatch(resetSearchResult())
            this.props.dispatch(fetchSearchResult(this.state.firstRadioValue, this.state.secondRadioValue, this.state.wordFormRadio, encoded, this.state.subRadioValue,this.state.periodId))
            // if (this.state.firstRadioValue == 4)
            //     this.props.navigation.navigate('Author', { firstRadioValue: this.state.firstRadioValue })
            // else
            this.props.navigation.push('SearchPage', { firstRadioValue: this.state.firstRadioValue, secondRadioValue: this.state.secondRadioValue, wordFormRadio: this.state.wordFormRadio, encoded: encoded, subRadioValue: this.state.subRadioValue,periodId:this.state.periodId })
        }
    }

    render() {
        // if(this.state.key==1){
        //     this.setState({key:2})
        // }
        var dynamicHeight=(this.state.firstRadioValue==3||this.state.firstRadioValue==4)?0:-40
        var timeLineHeight=this.state.timePeriod?80:30+dynamicHeight
        var modalheight = 420+timeLineHeight
        if (Platform.OS == "android")
            var modalheight = 405+timeLineHeight
        if (this.state.firstRadioValue == 2) {
            if (Platform.OS == "android")
                modalheight = 460+timeLineHeight
            else
                modalheight = 480+timeLineHeight
        }
        return (
            <Modal
                isVisible={this.props.searchVisible}
                animationIn={'slideInDown'}
                animationOut={'slideOutUp'}
                onSwipeComplete={() => this.close()}
                hasBackdrop={true}
                backdropOpacity={.02}
                backdropTransitionOutTiming={0}
                backdropColor={'black'}
                useNativeDriver={true}
                // animationInTiming={this.state.searchText==''?0:770}
                // animationOutTiming={770}
                hideModalContentWhileAnimating={true}
                animationInTiming={0}
                animationOutTiming={0}
                style={styles.bottomModal}
            >
                <View style={[styles.modal, { height: modalheight }]}>
                    {this.renderModal()}
                </View>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        searchVisible: state.dashboard.searchVisible,
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
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
        marginTop: -50
    },
    content: {
        marginHorizontal: 15,
        paddingTop: 35,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
        // borderTopWidth: 1,
        // borderLeftWidth: 1,
        // borderRightWidth: 1,
        borderColor: '#DDDDDD',
        flex: 1,
    },
    buyContainer: {
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        paddingHorizontal: 4,
        shadowOpacity: .2,
    },
    buyText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FONT_MEDIUM,
        paddingHorizontal: 4
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
    renderModalContent: {
        height: 30
    },
    flexContainer: {
        flex: 1.5,
    },
    searchTextContent: {
        fontSize: 16,
        flex: .5,
        fontFamily: FONT_SEMIBOLD
    },
    radioContainer: {
        alignItems: 'center',
        marginLeft: 20
    },
    searchOptionText: {
        marginHorizontal: 5,
        fontFamily: FONT_REGULAR
    },
    upIconStyle: {
        alignItems: 'center',
        justifyContent: 'center'
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
        elevation: 1
    },
    radioSubContainer: {
        marginHorizontal: 40
    },
    radioContainerContent: {
        flexDirection: 'row',
    },
    renderContainer: {
        padding: 8,
        width:100,
        flexDirection: 'row',
        marginVertical: 1,
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
    whiteContainer: {
        backgroundColor: '#fff',
    },
})