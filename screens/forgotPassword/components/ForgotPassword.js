import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_LIGHT, FONT_REGULAR } from '../../../assets/fonts'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import I18n from '../../../i18n'
import { forgotPassword, resetForgotPassword } from '../actions'
import { changeUserSession } from '../../login/actions'

class App extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            email: null
        }
        this.onForgot = this.onForgot.bind(this)
    }

    componentDidMount() {
        this.props.dispatch(changeUserSession('ForgotPassword'))
        this.props.dispatch(resetForgotPassword())
    }

    onForgot() {
        if(this.state.email!=null&&this.state.email!='')
        this.props.dispatch(forgotPassword({ email: this.state.email }, this.props.navigation))
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView style={styles.keyboardaware}>
                    <View style={styles.tophead}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={styles.goback}>
                            <AntDesign name='arrowleft' size={26} color='black' />
                        </TouchableOpacity>
                        <Text style={styles.welcome}>{I18n.t("Forgot_Password")}</Text>
                        <View style={styles.emptyContainer}></View>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.subtitle}>{I18n.t("Please_enter_your_email_address")}</Text>
                    </View>
                    <View style={styles.email}>
                        <TextInput
                            placeholder={I18n.t("Email_address")}
                            placeholderTextColor={TITLE_COLOR}
                            onChangeText={(text) => this.setState({ email: text })}
                            style={styles.textField}
                            caretHidden={Platform.OS === 'ios'?false:true}
                            keyboardType='email-address'
                            autoCompleteType='email'
                        />
                    </View>
                    {this.props.error && <Text style={styles.validationText}>{this.props.error} </Text>}
                    <TouchableOpacity onPress={this.onForgot} style={styles.button}>
                        <Text style={styles.submit}>{this.props.isLoading ? 'Sending OTP...' :I18n.t("Submit")}</Text>
                        <AntDesign name='arrowright' size={26} color='white' />
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        error: state.forgotPassword.errorMessgae,
        isLoading: state.forgotPassword.isLoading
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF'
    },
    keyboardaware: {
        padding: 15
    },
    header: {
        alignItems: 'center'
    },
    tophead: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    welcome: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 30,
        textAlign: 'center',
        color: TITLE_COLOR
    },
    subtitle: {
        fontFamily: FONT_REGULAR,
        fontSize: 18,
        paddingTop: 10,
        paddingBottom: 15,
        textAlign: 'left',
        alignSelf: 'flex-start',
        color: TITLE_COLOR
    },
    email: {
        height: 50,
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: SECONDARY_COLOR,
        borderRadius: 5
    },
    textField: {
        flex: 1,
        fontSize: 18,
        fontFamily: FONT_SEMIBOLD,
        paddingLeft: 15,
        paddingTop: 0,
        paddingBottom: 0,
        justifyContent: 'center',
    },
    validationText: {
        color: '#f44336',
        fontFamily: FONT_LIGHT,
        fontSize: 15,
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: -5
    },
    button: {
        height: 50,
        width: '100%',
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 15
    },
    submit: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 18,
        color: TITLE_COLOR,
        color: '#FFFFFF',
        textAlign: 'center',
        paddingRight: 15
    },
    goback: {
        flex: 1
    },
    emptyContainer: {
        flex: 1
    },
})