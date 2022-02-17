import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions, TextInput } from 'react-native'
import Demo from '../../../mockData/homeData'
import images from '../../../assets/images'
import { PRIMARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import Images from '../../../assets/images'
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import Login from '../../login'
import { WALLET } from '../../../common/endpoints'
import Api from '../../../common/api'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import Fontisto from "react-native-vector-icons/Fontisto"
import { fetchCountryList, fetchShippingInfos } from '../actions'
import DropDownPicker from 'react-native-dropdown-picker';
import { act } from 'react-test-renderer'
import { BallIndicator, BarIndicator, MaterialIndicator } from 'react-native-indicators';

const SECONDARY_COLOR = '#3E525E'
var categoryList = [
    { label: 'USA', value: 'usa' },
    { label: 'UK', value: 'uk' },
    { label: 'France', value: 'france' },
]
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
            name: null,
            address_1: null,
            address_2: null,
            email: null,
            mobile: null,
            telephone: null,
            country: null,
            isDefault: true,
            fromPurchase:this.props.navigation.getParam('fromPurchase', null),
            addressEditor: this.props.navigation.getParam('addressEditor', null),
            errors: {},
        }
        this.fetchData = this.fetchData.bind(this)
        this.addressView = this.addressView.bind(this)
        this.isvaildData = this.isvaildData.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.renderItem = this.renderItem.bind(this)
        // this.onLoad = this.onLoad.bind(this)
    }

    fetchData(action, shippingId) {
        let formdata = new FormData()
        formdata.append('language', this.props.locale == 'ar' ? 1 : 2)
        formdata.append('appId', 1)
        if (shippingId) {
            formdata.append('shippingId', shippingId)
        }
        formdata.append('action', action)
        this.props.dispatch(fetchShippingInfos(formdata))
    }

    componentDidMount() {
        this.props.dispatch(fetchCountryList(this.props.locale == 'ar' ? 1 : 2))
        this.fetchData()
        // I18nManager.forceRTL(true);
    }

    isvaildData() {
        if (this.state.country == '' || this.state.country == null) {
            this.setState({ errors: { ...this.state.errors, countryError: true } })
            return false;
        }
        if (this.state.name == '' || this.state.name == null) {
            this.setState({ errors: { ...this.state.errors, nameError: true } })
            return false;
        }
        if (this.state.address_1 == '' || this.state.address_1 == null) {
            this.setState({ errors: { ...this.state.errors, address_1Error: true } })
            return false;
        }
        if (this.state.address_2 == '' || this.state.address_2 == null) {
            this.setState({ errors: { ...this.state.errors, address_2Error: true } })
            return false;
        }
        if (this.state.email == '' || this.state.email == null) {
            this.setState({ errors: { ...this.state.errors, emailError: true } })
            return false;
        }
        if (this.state.mobile == '' || this.state.mobile == null) {
            this.setState({ errors: { ...this.state.errors, mobileError: true } })
            return false;
        }
        return true;
    }

    onSubmit(action) {
        this.setState({ errors: {} }, () => {
            if (!this.isvaildData())
                return 0;
            else {
                this.setState({ addressEditor: null })
                let formdata = new FormData()
                formdata.append('action', action)
                formdata.append('country', this.state.country)
                formdata.append('name', this.state.name)
                formdata.append('address_1', this.state.address_1)
                formdata.append('address_2', this.state.address_2)
                formdata.append('email', this.state.email)
                formdata.append('mobile', this.state.mobile)
                formdata.append('telephone', this.state.telephone)
                formdata.append('language', this.props.locale == 'ar' ? 1 : 2)
                formdata.append('appId', 1)
                formdata.append('isDefault', this.state.isDefault ? 1 : 0)
                this.props.dispatch(fetchShippingInfos(formdata))
                this.setState({ country: null, name: null, address_1: null, address_2: null, email: null, mobile: null, telephone: null })
            }
        })
    }

    addressView(isLastPage) {
        return (
            <View>
                    <DropDownPicker
                        items={this.props.country}
                        defaultValue={this.state.country}
                        labelStyle={styles.dropDownText}
                        style={styles.dropDownContainer}
                        itemStyle={{ justifyContent: 'flex-start',backgroundColor:'#fff' }}
                        placeholder={this.state.country ? this.state.country :I18n.t("Country")}
                        onChangeItem={(item, index) => this.setState({ country: item.value })}
                    />
                {this.state.errors.countryError && this.state.errors.countryError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Country Required!</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("Name")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.name}
                        onChangeText={(text) => this.setState({ name: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]} />
                </View>
                {this.state.errors.nameError && this.state.errors.nameError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Name Required!</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("Address")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.address_1}
                        onChangeText={(text) => this.setState({ address_1: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]} />
                </View>
                {this.state.errors.address_1Error && this.state.errors.address_1Error == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>{I18n.t("Address_Required")}</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("City")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.address_2}
                        onChangeText={(text) => this.setState({ address_2: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]} />
                </View>
                {this.state.errors.address_2Error && this.state.errors.address_2Error == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>City Required!</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("Email_address")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.email}
                        onChangeText={(text) => this.setState({ email: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]} 
                        caretHidden={Platform.OS === 'ios' ? false : true}
                        keyboardType='email-address'
                        autoCompleteType='email'
                    />
                </View>
                {this.state.errors.emailError && this.state.errors.emailError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Email Required!</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("Mobile_Number")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.mobile}
                        keyboardType='number-pad'
                        onChangeText={(text) => this.setState({ mobile: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]}  />
                </View>
                {this.state.errors.mobileError && this.state.errors.mobileError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Mobile Number Required!</Text></View>}
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder={I18n.t("Telephone_Number")}
                        placeholderTextColor={SECONDARY_COLOR}
                        value={this.state.telephone}
                        keyboardType='number-pad'
                        onChangeText={(text) => this.setState({ telephone: text })}
                        style={[styles.input,{textAlign:this.props.locale=='ar'?'right':'left',}]}  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 5, alignItems: 'center' }}>
                    <Text style={styles.defaultText2}>{I18n.t("Set_as_default_Address")}</Text>
                    <Fontisto onPress={() => this.setState({ isDefault: !this.state.isDefault })} name={this.state.isDefault ? 'radio-btn-active' : 'radio-btn-passive'} size={20} color={PRIMARY_COLOR} />
                </View>
                <TouchableOpacity onPress={() => this.onSubmit('add')} style={[styles.addContainer, { backgroundColor: PRIMARY_COLOR }]}>
                    <Text style={[styles.addContainerText, { color: '#fff' }]}>{I18n.t("Add_Address")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.setState({ addressEditor: null })} style={[styles.addContainer, { backgroundColor: '#fff' }]}>
                    <Text style={[styles.addContainerText, { color: PRIMARY_COLOR }]}>{I18n.t("Cancel")}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderItem({ item, index }) {
        console.log('item', item)
        return (
            <TouchableOpacity onPress={() =>this.state.fromPurchase&& this.props.navigation.navigate('Purchase', { index: index })} style={styles.cardGrid}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.addText}>{item.shippingAddress1}</Text>
                <Text style={styles.addText}>{item.shippingAddress2}</Text>
                <Text style={styles.addText}>{I18n.t("Country")}:{item.country}</Text>
                <Text style={styles.addText}>Email Id:{item.email}</Text>
                <Text style={styles.addText}>Mobile No:{item.mobile}</Text>
                <Text style={styles.addText}>Telephone No:{item.telephone}</Text>
                <View style={styles.actionContainer}>
                    {item.isdefault == 0 &&
                        <TouchableOpacity onPress={() => this.fetchData('default', item.shippingId)} style={styles.remove}>
                            <Text style={styles.removeText}>Set as default</Text>
                        </TouchableOpacity>}
                    {item.isdefault == 1 &&
                        <Text style={styles.defaultText}>Default address</Text>}
                    <TouchableOpacity onPress={() => this.fetchData('delete', item.shippingId)} style={styles.remove}>
                        <Text style={styles.removeText}>{I18n.t("Remove")}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    scrollEventThrottle={1}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (isCloseToBottom(nativeEvent)) {
                            // this.onLoad()
                        }
                    }} showsVerticalScrollIndicator={false}>
                    {this.state.addressEditor != 0 &&
                        <TouchableOpacity onPress={() => !this.props.isCountryLoading && this.setState({ addressEditor: 0 })} style={styles.addContainer}>
                            {this.props.isCountryLoading ?
                                <MaterialIndicator style={styles.addContainerText} color={PRIMARY_COLOR} size={24} /> :
                                <Text style={styles.addContainerText}>Add a new address</Text>}
                        </TouchableOpacity>}
                    {this.state.addressEditor == 0 && this.addressView()}
                    {this.props.shipping && this.props.shipping.length != 0 &&
                        <FlatList
                            style={styles.flatlistStyle}
                            showsVerticalScrollIndicator={false}
                            data={this.props.shipping}
                            renderItem={this.renderItem}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />}
                </ScrollView>
                {this.props.isLoading &&
                    <BarIndicator style={styles.loaderContainer} color={PRIMARY_COLOR} size={34} />}
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
        country: state.address.country,
        shipping: state.address.shipping,
        isLoading: state.address.isLoading,
        isCountryLoading: state.address.isCountryLoading,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        marginHorizontal: 15,
        backgroundColor: '#FFFFFF',
    },
    addContainer: {
        backgroundColor: '#ededed',
        borderWidth: .5,
        borderRadius: 4,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    addContainerText: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 10,
        fontFamily: FONT_REGULAR,
        fontSize: 18,
    },
    addContainerText2: {
        textAlign: 'center',
        paddingVertical: 10,
        fontFamily: FONT_REGULAR,
        fontSize: 18,
    },
    inputContainer: {
        height: 50,
        borderWidth: 1,
        borderColor: SECONDARY_COLOR,
        borderRadius: 5,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 8
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: SECONDARY_COLOR,
        padding: 0,
        margin: 0,
    },
    dropDownText: {
        // marginTop: 10,
        // marginBottom: 10,
        paddingVertical: 7,
        fontSize: 16,
        fontFamily: FONT_SEMIBOLD,
        color: SECONDARY_COLOR,
        opacity: .9,
    },
    dropDownContainer: {
        backgroundColor: '#ededed',
        borderColor: SECONDARY_COLOR,
        marginBottom: 8
    },
    logo: {
        marginVertical: 5,
        height: 30
    },
    nameText: {
        flex: 1,
        fontFamily: FONT_MEDIUM,
        fontSize: 18,
    },
    addText: {
        flex: 1,
        fontFamily: FONT_REGULAR,
        fontSize: 16,
    },
    cardGrid: {
        borderWidth: .5,
        padding: 10,
        borderColor: '#9c9c9c',
        shadowOpacity: .2,
        borderRadius: 4,
        shadowOffset: { width: 1, height: 1 },
        backgroundColor: '#fff',
        marginVertical: 5
    },
    remove: {
        borderWidth: .5,
        alignItems: 'center',
        padding: 5,
        borderColor: '#9c9c9c',
        borderRadius: 4,
        backgroundColor: '#ededed',
        marginVertical: 5,
        alignSelf: 'flex-end'
    },
    removeText: {
        flex: 1,
        paddingHorizontal: 10,
        fontFamily: FONT_REGULAR,
        fontSize: 14,
    },
    defaultText: {
        paddingHorizontal: 10,
        fontFamily: FONT_MEDIUM,
        fontSize: 18,
        color: PRIMARY_COLOR
    },
    defaultText2: {
        paddingHorizontal: 10,
        fontFamily: FONT_MEDIUM,
        fontSize: 18,
        color: SECONDARY_COLOR
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: width - 30,
    },
    infoTextContainer: {
        marginBottom: 10
    },
    infoText: {
        fontSize: 14,
        fontFamily: FONT_MEDIUM,
        color: 'red'
    },
})


