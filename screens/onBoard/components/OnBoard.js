import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Linking, Image, Text, StatusBar } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import { SafeAreaView } from 'react-navigation'
import { connect } from 'react-redux'
import ModalDropdown from 'react-native-modal-dropdown'
import Ionicons from "react-native-vector-icons/Ionicons"
import { PRIMARY_COLOR, TITLE_COLOR, SECONDARY_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import I18n from '../../../i18n'
import { NavigationActions, StackActions } from "react-navigation"
import { resetFirstLogin } from '../../login/actions'
import { PRIVACY_POLICY } from '../../../common/endpoints'
import Images from '../../../assets/images'

const DEMO_OPTIONS = ['English', 'العربية'];

class App extends Component {

    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props)
        this.state = {
            category: 'English'
        }
        this._dropdownOnSelect = this._dropdownOnSelect.bind(this)
        this.gotoHomePage = this.gotoHomePage.bind(this)
    }

    componentDidMount() {
        SplashScreen.hide()
    }

    _dropdownOnSelect(idx, value) {
        this.setState({ category: value })
    }

    gotoHomePage() {
        if (this.state.category == 'العربية')
            I18n.locale = 'ar'

        const resetAction = StackActions.reset({
            key: null,
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'HomePage' })],
        })
        this.props.dispatch(resetFirstLogin({ locale: I18n.locale, isFirstLogin: true }))
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='default' translucent={false} />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.welcome}>Welcome to</Text>
                        <Image style={styles.headerImage} source={Images.headerName} resizeMode='contain' />
                        {/* <Image source={{ uri: 'titlelogo' }} style={styles.headerImage} resizeMode='contain' /> */}
                    </View>
                    {/* <View style={styles.imageContainer}>
                        {/* <Image source={{ uri: 'onboard' }} style={styles.image} /> */}
                    {/* </View>  */}

                    <View style={styles.choiceContainer}>
                        <View style={styles.changeLanguage}>
                            <Text style={styles.choose}>Choose Language</Text>
                            <ModalDropdown
                                options={DEMO_OPTIONS}
                                scrollEnabled={false}
                                style={styles.drop}
                                dropdownStyle={styles.dropdown}
                                dropdownTextStyle={styles.dropDownText}
                                dropdownTextHighlightStyle={styles.highlighted}
                                onSelect={(idx, value) => this._dropdownOnSelect(idx, value)}
                            >
                                <View style={styles.category}>
                                    <Text style={styles.input}>{this.state.category ? this.state.category : 'Category'}</Text>
                                    <Ionicons name='ios-arrow-down' size={24} color='#707070' />
                                </View>
                            </ModalDropdown>
                        </View>
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={this.gotoHomePage} style={styles.exploreButton}>
                                <Text style={styles.explore}>Explore</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.privacyContainer}>
                        <Text style={styles.privacyText}>By clicking on the Explore button , you are agreeing to our</Text>
                        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY)} >
                            <Text style={styles.privacyPolicyText}>Privacy Policy and Terms of use.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.userLogin.user,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF'
    },
    privacyContainer: {
        padding: 15
    },
    privacyText: {
        textAlign: 'center',
        color: SECONDARY_COLOR
    },
    privacyPolicyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: SECONDARY_COLOR,
        textDecorationLine: 'underline',
        paddingVertical: 5
    },
    headerImage: {
        height: 40,
        width: 150
    },
    content: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 15
    },
    welcome: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 33,
        textAlign: 'center',
        color: TITLE_COLOR
    },
    imageContainer: {
        flex: 4.5,
    },
    image: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain'
    },
    changeLanguage: {
        padding: 15,
    },
    choose: {
        fontSize: 28,
        fontFamily: FONT_MEDIUM,
        color: SECONDARY_COLOR,
        paddingBottom: 15
    },
    category: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderWidth: 1,
        borderColor: SECONDARY_COLOR,
        borderRadius: 5,
        paddingLeft: 15,
        paddingRight: 15,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        color: SECONDARY_COLOR,
    },
    drop: {},
    dropdown: {
        right: 15,
        height: 120,
    },
    dropDownText: {
        marginTop: 10,
        marginBottom: 10,
        paddingLeft: 15,
        fontSize: 16,
        fontFamily: FONT_MEDIUM,
        color: SECONDARY_COLOR,
        opacity: .9,
    },
    highlighted: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        fontSize: 16,
        fontFamily: FONT_MEDIUM,
        color: SECONDARY_COLOR,
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 15,
        marginBottom: 40
    },
    exploreButton: {
        backgroundColor: PRIMARY_COLOR,
        width: '100%',
        paddingVertical: 15,
        borderRadius: 40,
        shadowColor: 'black',
        shadowOffset: { height: 1, width: 1 },
        shadowRadius: 1,
        shadowOpacity: .3,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3
    },
    explore: {
        fontSize: 16,
        fontFamily: FONT_SEMIBOLD,
        color: '#FFFFFF',
        width: '100%',
        justifyContent: 'center',
        textAlign: 'center'
    },
    choiceContainer: {
        flex:1,
        justifyContent:'space-between'
    }
})