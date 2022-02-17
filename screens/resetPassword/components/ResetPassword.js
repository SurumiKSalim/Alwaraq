import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, TextInput, SafeAreaView } from 'react-native'
import { connect } from 'react-redux'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_LIGHT, FONT_REGULAR } from '../../../assets/fonts'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { resetPassword } from '../actions'
import I18n from '../../../i18n'

class App extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            password: null,
            email: this.props.navigation.getParam('response', null),
            otp: this.props.navigation.getParam('otp', null),
        }
        this.onForgot = this.onForgot.bind(this)
    }

    onForgot() {
        this.props.dispatch(resetPassword({ email: this.state.email, otp: this.state.otp, newPassword: this.state.password }, this.props.navigation))
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView style={styles.keyboardaware}>
                    <View style={styles.tophead}>
                        <TouchableOpacity onPress={() =>this.props.navigation.navigate('ForgotPassword')} style={styles.goback}>
                            <AntDesign name='arrowleft' size={26} color='black' />
                        </TouchableOpacity>
                        <Text style={styles.welcome}>{I18n.t("Reset_password")}</Text>
                        <View style={styles.emptyContainer}></View>
                    </View>
                    <View style={styles.header}>
                        <Text style={styles.subtitle}>{I18n.t("Please_enter_your_new_password")}</Text>
                    </View>
                    <View style={styles.email}>
                        <TextInput
                            placeholder='New Password'
                            placeholderTextColor={TITLE_COLOR}
                            onChangeText={(text) => this.setState({ password: text })}
                            style={styles.textField}
                        />
                    </View>
                    {this.props.error && <Text style={styles.validationText}>{this.props.error} </Text>}
                    <TouchableOpacity onPress={this.onForgot} style={styles.button}>
                        <Text style={styles.submit}>{this.props.isLoading ? I18n.t("changing") : 'Submit'}</Text>
                        <AntDesign name='arrowright' size={26} color='white' />
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        error: state.resetPassword.errorMessgae,
        isLoading: state.resetPassword.isPasswordResting
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
        fontSize: 33,
        textAlign: 'center',
        color: TITLE_COLOR
    },
    subtitle: {
        fontFamily: FONT_REGULAR,
        fontSize: 22,
        paddingTop: 10,
        paddingBottom: 15,
        textAlign: 'left',
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