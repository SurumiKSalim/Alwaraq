import { StyleSheet, Linking, ImageBackground, KeyboardAvoidingView, View, TouchableOpacity, Dimensions, FlatList, Text, Image, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native'
import { connect } from 'react-redux'
import React, { Component, Fragment } from 'react'
// import Pdf from 'react-native-pdf';
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Foundation from 'react-native-vector-icons/Foundation'
import Feather from 'react-native-vector-icons/Feather'
import ModalDropdown from 'react-native-modal-dropdown';
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { HeaderBackButton } from 'react-navigation-stack';
import Icon from 'react-native-vector-icons/Ionicons'
import Modal from "react-native-modal"
import I18n from '../../../i18n'
import AntDesign from "react-native-vector-icons/AntDesign"
import { FONT_REGULAR, FONT_SEMIBOLD, FONT_MEDIUM, FONT_BOLD, FONT_LIGHT } from '../../../assets/fonts'

const { height, width } = Dimensions.get('screen')
class PDFExample extends React.Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        let index=this.props.navigation.getParam('index')
        this.state = {
            page: 1,
            totalPage: null,
            isScrollView: true,
            enablePaging: false,
            visible: false,
            Text: null,
            index: index?index:0,
            modalVisible: false,
        }
        this.dropDown = this.dropDown.bind(this)
        this.Select = this.Select.bind(this)
    }

    componentDidMount() {
        if (this.props.navigation.getParam('data')) {
            this.setState({ modalVisible: false })
        }
    }

    dropDown(rowData, rowID, highlighted) {
        return (
            <View style={styles.modalContainerHeader}>
                <TouchableOpacity style={styles.edit} onPress={() => this.Select(rowData, rowID, highlighted)}>
                    <Text style={styles.textEdit}>{rowData}</Text>
                    {rowID == 2 && this.state.enablePaging &&
                        <MaterialIcons name={'done'} color={PRIMARY_COLOR} size={24} />}
                </TouchableOpacity>
            </View>
        )
    }

    Select(rowData, rowID, highlighted) {
        console.log('rowData', rowData)
        if (refs) {
            refs.hide()
        }
        if (rowID) {
            if (rowID == 0 && rowData == I18n.t("Scroll_View"))
                this.setState({ isScrollView: true })
            if (rowID == 0 && rowData == I18n.t("Page_View"))
                this.setState({ isScrollView: false })
            if (rowID == 1)
                this.setState({ enablePaging: !this.state.enablePaging })
        }
        return (
            <View>
            </View>
        )
    }

    renderPageModal = () => (
        <View style={styles.pageContent}>
            <View style={styles.modalClose}>
                <TouchableOpacity onPress={() => this.setState({ visible: null, invaliedPage: false })}>
                    <Icon name='ios-close-circle-outline' size={30} color='black' />
                </TouchableOpacity>
            </View>
            <View style={styles.renderModalContainer}>
                <Text>{I18n.t("Go_to_Page")} </Text>
                <View style={styles.textInput}>
                    <TextInput style={styles.searchText}
                        ref={ref => this.textInputRef = ref}
                        placeholderTextColor={'#9c9c9c'}
                        bufferDelay={5}
                        style={styles.gotoText}
                        onChangeText={(Text) => this.setState({ Text: Text })}
                        keyboardType={'numeric'}
                    />
                </View>
            </View>
            {this.state.invaliedPage &&
                <Text style={styles.invaliedPage}>Enter a valied page</Text>}
            <View style={styles.submitContainer}>
                <TouchableOpacity onPress={() => this.goToPage()} style={styles.submitSubContainer}>
                    <Text style={styles.submitText}>{I18n.t("OK")}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    goToPage() {
        if (parseInt(this.state.Text) > 0 && parseInt(this.state.Text) <= parseInt(this.state.totalPage)) {
            this.pdf.setPage(parseInt(this.state.Text));
            this.setState({ visible: null })
        }
        else {
            this.setState({ invaliedPage: true })
        }
        if (this.state.invaliedPage) {
            this.setState({ visible: null, invaliedPage: false })
        }
    }

    renderAudioItem(item, index) {
        return (
            <TouchableOpacity onPress={() => this.setState({ index: index,modalVisible:false })} style={styles.audioContainer}>
                <Text numberOfLines={1} style={styles.audioLink}>{parseInt(index + 1)}</Text>
                <Feather name='book' size={20} color={PRIMARY_COLOR} style={styles.audioContent} />
                <Text numberOfLines={1} style={styles.audioLink1}>{item.pdfTitle}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        let data = this.props.navigation.getParam('data')
        let index = this.state.index
        var source = { uri: '', cache: true };
        var viewtype = this.state.isScrollView ? I18n.t("Page_View") : I18n.t("Scroll_View")
        if (data) {
            source = { uri: data ? data[index] && data[index].pdfFile : '', cache: true };
        }
        if (this.props.navigation.getParam('pdfPath')) {
            source = { uri: Platform.OS === 'android' ? 'file://' + this.props.navigation.getParam('pdfPath') : '' + this.props.navigation.getParam('pdfPath'), cache: true };
        }
        // const source = require('/Users/macos/Library/Developer/CoreSimulator/Devices/A616B4BE-FBF5-4EF2-8F98-0D71EF0BC99C/data/Containers/Data/Application/781B5B6C-452F-4B49-A3C7-C3F6ECA135DE/Documents/RNFetchBlob_tmp/RNFetchBlobTmp_go57ak0z1vk6ndql6i3v4');  // ios only

        //const source = require('./test.pdf');  // ios only
        //const source = {uri:'bundle-assets://test.pdf'};

        //const source = {uri:'file:///sdcard/test.pdf'};
        //const source = {uri:"data:application/pdf;base64,JVBERi0xLjcKJc..."};

        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <HeaderBackButton tintColor={PRIMARY_COLOR} onPress={() => this.props.navigation.goBack()} />
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        {data &&
                            <Foundation onPress={() => this.setState({ modalVisible: true })} style={{ marginHorizontal: 5 }} name='list' size={26} color='black' />}
                        <ModalDropdown
                            ref={el => refs = el}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={false}
                            options={[viewtype, I18n.t("Single_Page")]}
                            dropdownTextStyle={styles.dropdownTextStyle}
                            dropdownStyle={styles.dropdownStyle}
                            renderRow={(rowData, rowID, highlighted) => this.dropDown(rowData, rowID, highlighted)}
                        >
                            <SimpleLineIcons name='options-vertical' size={22} color='black' />
                        </ModalDropdown>
                    </View>
                </View>
                {/* {this.state.enablePaging &&
                    <Pdf
                        ref={(pdf) => { this.pdf = pdf; }}
                        enablePaging={true}
                        horizontal={!this.state.isScrollView}
                        source={source}
                        onLoadComplete={(numberOfPages, filePath) => {
                            this.setState({ totalPage: numberOfPages })
                        }}
                        onPageChanged={(page, numberOfPages) => {
                            this.setState({ page: page, totalPage: numberOfPages })
                        }}
                        onPressLink={(uri) => Linking.openURL(uri)}
                        onError={(error) => {
                            console.log(error);
                        }}
                        style={styles.pdf} />} */}

                {/* {!this.state.enablePaging &&
                    <Pdf
                        ref={(pdf) => { this.pdf = pdf; }}
                        enablePaging={false}
                        horizontal={!this.state.isScrollView}
                        source={source}
                        onLoadComplete={(numberOfPages, filePath) => {
                            this.setState({ totalPage: numberOfPages })
                        }}
                        onPageChanged={(page, numberOfPages) => {
                            this.setState({ page: page, totalPage: numberOfPages })
                        }}
                        onPressLink={(uri) => Linking.openURL(uri)}
                        onError={(error) => {
                            console.log(error);
                        }}
                        style={styles.pdf} />} */}
                {/* {this.state.totalPage &&
                    <TouchableOpacity onPress={() => this.setState({ visible: true })} style={styles.pageContainer}>
                        <Text>{this.state.page}/{this.state.totalPage}</Text>
                    </TouchableOpacity>} */}
                {this.state.totalPage &&
                    <TouchableOpacity onPress={() => this.setState({ index: this.state.index + 1 })} style={styles.pageContainer}>
                        <Text>{this.state.page}/{this.state.totalPage}</Text>
                    </TouchableOpacity>}
                <Modal
                    isVisible={this.state.visible}
                    hasBackdrop={true}
                    backdropOpacity={.02}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    backdropTransitionOutTiming={0}
                    animationInTiming={1000}
                    animationOutTiming={1000}
                    style={styles.bottomPageModal}
                >
                    <KeyboardAvoidingView style={styles.modalContain}>
                        {this.renderPageModal()}
                    </KeyboardAvoidingView>
                </Modal>
                {/* <Modal
                    isVisible={this.state.modalVisible}
                    hasBackdrop={true}
                    backdropOpacity={.02}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    useNativeDriver={true}
                    onBackButtonPress={() => this.setState({modalVisible:false})}
                    onBackdropPress={() => this.setState({modalVisible:false})}
                    hideModalContentWhileAnimating={true}
                    backdropTransitionOutTiming={0}
                    animationInTiming={1000}
                    animationOutTiming={1000}
                    style={styles.bottomPageModal}
                >
                    <KeyboardAvoidingView style={styles.modalContain}>
                        {this.renderBookList()}
                    </KeyboardAvoidingView>
                </Modal> */}
                <Modal
                    isVisible={this.state.modalVisible}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    hasBackdrop={true}
                    backdropColor='black'
                    useNativeDriver={true}
                    backdropOpacity={.5}
                    onBackButtonPress={() => this.setState({ modalVisible: false })}
                    onBackdropPress={() => this.setState({ modalVisible: false })}
                    style={styles.modal}>
                    <View style={styles.modalContainer1}>
                        <View style={styles.modalHeaderLinks}>
                            <View style={styles.modalFooter1}>
                                <TouchableOpacity style={styles.buttonCancel1}>
                                    <Text style={styles.cancel}>BookList</Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={data}
                                ItemSeparatorComponent={this.renderHeader}
                                renderItem={({ item, index }) => this.renderAudioItem(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                        <View style={styles.modalFooter1}>
                            <TouchableOpacity style={styles.buttonCancel1} onPress={() => this.setState({ modalVisible: false })}>
                                <Text style={styles.cancel}>{I18n.t("close")}</Text>
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
        publications: state.dashboard.publications,
        isLoading: state.dashboard.isLoading,
        isPublicationLoading: state.dashboard.isPublicationLoading,
        isLastPage: state.dashboard.isLastPage,
        locale: state.userLogin.locale,
        user: state.userLogin.user,
    }
}
export default connect(mapStateToProps)(PDFExample)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25,
    },
    header: {
        width: width,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pdf: {
        flex: 1,
        width: '100%',
        height: '90%',
    },
    pageContainer: {
        backgroundColor: '#fff',
        paddingVertical: 5,
        paddingHorizontal: 10,
        position: 'absolute',
        bottom: 50,
        borderRadius: 10
    },
    edit: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalContainerHeader: {
        flex: 1,
        padding: 15
    },
    headerRightContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dropdownTextStyle: {
        textAlign: 'center',
        fontSize: 15
    },
    dropdownStyle: {
        height: 97,
        width: 140,
        borderWidth: 1,
        elevation: .1,
        shadowOffset: { width: 1, height: 1, },
        shadowColor: 'black',
        shadowOpacity: .3
    },
    bottomPageModal: {
        margin: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContain: {
        height: height > 750 ? '20%' : '25%',
        width: '95%'
    },
    pageContent: {
        padding: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        justifyContent: 'space-between',
        height: 180
    },
    modalClose: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
    },
    renderModalContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    textInput: {
        width: '20%',
    },
    gotoText: {
        height: 30,
        marginHorizontal: 5,
        paddingVertical: 0,
        borderWidth: .5,
        borderRadius: 5,
    },
    invaliedPage: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 5
    },
    submitContainer: {
        height: 40,
        justifyContent: 'center'
    },
    submitSubContainer: {
        height: 30,
        width: '20%',
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    submitText: {
        textAlign: 'center'
    },
    modalContainer1: {
        width: '90%',
        borderRadius: 10,
    },
    modalHeaderLinks: {
        backgroundColor: '#fff'
    },
    modalFooter1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#DDDDDD',
        backgroundColor: '#fff'
    },
    buttonCancel1: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    cancel: {
        fontSize: 14,
        color: PRIMARY_COLOR,
        fontFamily: FONT_SEMIBOLD,
    },
    audioContainer: {
        width: '100%',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    audioContent: {
        marginLeft: 5,
        marginRight: 8
    },
    audioLink:{
        fontFamily:FONT_SEMIBOLD,
        width:20,
    },
    audioLink1:{
        width:'80%',
        fontFamily:FONT_SEMIBOLD
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
