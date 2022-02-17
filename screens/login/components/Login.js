import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Image, TextInput, ScrollView, SafeAreaView, Platform } from 'react-native'
import { connect } from 'react-redux'
import { GoogleSignin } from '@react-native-community/google-signin';
import { fetchUser } from '../actions'
import { LoginManager, GraphRequest, GraphRequestManager } from "react-native-fbsdk"
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_LIGHT, FONT_REGULAR, FONT_MEDIUM, FONT_BOLD } from '../../../assets/fonts'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Images from '../../../assets/images'
import I18n from '../../../i18n'
import jwt_decode from 'jwt-decode'
// import { fetchUser } from '../actions'
import { signup } from '../../signUp/actions'
import { MaterialIndicator } from 'react-native-indicators'
// import { changeUserSession } from '../../login/actions'
import { webClientId } from '../../../common/config'
import appleAuth, {
    AppleButton,
    AppleAuthError,
    AppleAuthRequestScope,
    AppleAuthRealUserStatus,
    AppleAuthCredentialState,
    AppleAuthRequestOperation,
} from '@invertase/react-native-apple-authentication';

class App extends Component {

    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props)
        this.state = {
            email: null,
            password: null,
            user: null,
            showpswrd: true,
            validate: null,
            goBack: this.props.navigation.getParam('goBack')
            // fcmToken: null,
            // uniqueId: null
        }
        this.login_fb = this.login_fb.bind(this)
        this.userInfoFb = this.userInfoFb.bind(this)
        this._responseInfoCallback = this._responseInfoCallback.bind(this)
        this.signIn = this.signIn.bind(this)
        this._setupGoogleSignin = this._setupGoogleSignin.bind(this)
        this.sentUserToServer = this.sentUserToServer.bind(this)
        this.onLogin = this.onLogin.bind(this)
    }

    async componentDidMount() {
        this._setupGoogleSignin()
        // this.props.dispatch(changeUserSession('Login'))
    }
    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            if (this.props.user && this.props.navigation.getParam('goBack')) {
                this.props && this.props.navigation && this.props.navigation.goBack()
            }
        }
        // if(this.props.user){
        //     this.props&&this.props.navigation&&this.props.navigation.goBack()}
        // }
    }

    sentUserToServer(user) {
        // this.props.dispatch(signup(user, this.props.navigation))
        this.props.dispatch(signup(user, this.props.navigation, this.props.locale, this.state.goBack))
    }

    onLogin() {
        if ((this.state.email == null) || this.state.email == '') {
            this.setState({ validate: 'Email cannot be empty' })
            return 0
        }
        if (this.state.password == null || this.state.password == '') {
            this.setState({ validate: 'Password cannot be empty' })
            return 0
        }
        else{
        let user = { email: this.state.email, password: this.state.password, fcmToken: this.state.fcmToken }
        this.props.dispatch(fetchUser(user, this.props.navigation))
        this.setState({validate:null})
        }
    }

    async _setupGoogleSignin() {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
            await GoogleSignin.configure({
                webClientId: webClientId,
                offlineAccess: false
            });
        }
        catch (err) {
        }
    }

    _responseInfoCallback(error: ?Object, result: ?Object) {
        if (error) {
            alert('Error fetching data: ' + error.toString());
        } else {
            let user = {};
            user.name = result.name
            user.email = result.email
            user.photo = result.picture.data.url
            user.fbgoogle = 1
            user.fcmToken = this.state.fcmToken
            user.auth = {
                id: result.id,
                provider: "facebook"
            }
            this.sentUserToServer(user)
        }
    }

    userInfoFb() {
        const infoRequest = new GraphRequest(
            '/me?fields=name,email,picture.height(72).width(72)', null,
            this._responseInfoCallback,
        );
        new GraphRequestManager().addRequest(infoRequest).start();
    }

    signIn() {
        GoogleSignin.signIn()
            .then((result) => {
                let user = {}
                user.name = result.user.name
                user.email = result.user.email
                user.photo = result.user.photo
                user.fbgoogle = 2
                user.fcmToken = this.state.fcmToken
                user.auth = {
                    id: result.user.id,
                    provider: "google"
                }
                this.sentUserToServer(user)
            })
            .catch((err) => {
            })
            .done();
    }

    async onAppleButtonPress() {
        // 1). start a apple sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: AppleAuthRequestOperation.LOGIN,
          requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
        });
      
        // 2). if the request was successful, extract the token and nonce
        console.log('appleAuthRequestResponse', appleAuthRequestResponse);
        const { identityToken, nonce } = appleAuthRequestResponse;
      
        // can be null in some scenarios
        if (identityToken) {
            var decoded = jwt_decode(identityToken);
            console.log('decoded',decoded.email);
            let user = {};
            user.name = appleAuthRequestResponse.fullName.givenName+' '+appleAuthRequestResponse.fullName.familyName
            user.email = appleAuthRequestResponse.email?appleAuthRequestResponse.email:decoded&&decoded.email
            // user.photo = appleAuthRequestResponse.picture.data.url
            user.fbgoogle = 3
            user.fcmToken = this.state.fcmToken
            user.auth = {
                id: appleAuthRequestResponse.id,
                provider: "apple"
            }
            this.sentUserToServer(user)
        } else {
          // handle this - retry?
        }
      }

    login_fb() {
        LoginManager.logOut();
        const that = this
        LoginManager.logInWithPermissions(["public_profile", "email"]).then(
            result => {
                if (!result.isCancelled) {
                    that.userInfoFb()
                }
            })
            .catch(err => {
                console.log('fb erore', err)
            })
    }

    render() {
        var goBack = this.props.navigation.getParam('goBack')
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                    {!(this.props.activeSession && (this.props.activeSession.includes("Profile") || this.props.activeSession.includes("Maps") || this.props.activeSession.includes("Trips") || this.props.activeSession.includes("TripDetail") || this.props.activeSession.includes("Profile"))) &&
                        <View style={styles.tophead}>
                            {goBack && <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={styles.goback}>
                                <AntDesign name='arrowleft' size={26} color='black' />
                            </TouchableOpacity>}
                            <Text style={styles.welcome}>{I18n.t("Login")}</Text>
                            {goBack && <View style={styles.emptyContainer}></View>}
                        </View>}
                    <View style={styles.header}>
                        <Text style={[styles.subtitle,{textAlign:this.props.locale=='ar'?'right':'left'}]}>{I18n.t("Login_with_email_or_a_social_account")}</Text>
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
                    <View style={styles.password}>
                        <TextInput
                            placeholder={I18n.t("Password")}
                            placeholderTextColor={TITLE_COLOR}
                            onChangeText={(text) => this.setState({ password: text })}
                            secureTextEntry={this.state.showpswrd}
                            style={styles.textField}
                        />
                        <TouchableOpacity activeOpacity={0} style={styles.passwordHide}
                            onPress={() => this.setState({ showpswrd: !this.state.showpswrd })}>
                            <FontAwesome5 name={this.state.showpswrd ? 'eye-slash' : 'eye'} size={18} color='#656565' />
                        </TouchableOpacity>
                    </View>
                    <Text onPress={() => this.props.navigation.navigate('ForgotPassword')} style={styles.reset}>{I18n.t("Forgot_Password")}</Text>
                    {this.state.validate && <Text style={styles.validationText}>{this.state.validate} </Text>}
                    {this.props.error && <Text style={styles.validationText}>{this.props.error} </Text>}
                    <TouchableOpacity onPress={this.onLogin} style={styles.button}>
                        {this.props.isLogging ? <View style={styles.indicatorContainer}><MaterialIndicator color='white' size={20} style={styles.signinIcon} /></View>
                            : <Text style={styles.signin}>{I18n.t("Sign_In")}</Text>}
                    </TouchableOpacity>
                    <Text style={styles.member}>{I18n.t("Not_a_member")}</Text>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SignUp')} >
                        <Text style={styles.signup}>{I18n.t("Signup_Now")}</Text>
                    </TouchableOpacity>
                    <View style={styles.sepratorContainer}>
                        <View style={styles.seprator} />
                        <View style={styles.orContainer}>
                            <Text style={styles.or}>{I18n.t("OR")}</Text>
                        </View>
                        <View style={styles.seprator} />
                    </View>
                    <TouchableOpacity style={styles.facebook} onPress={this.login_fb}>
                        <Fontisto name='facebook' size={18} color='white' />
                        <Text style={styles.signinwith}>{I18n.t("Sign_in_with")}<Text style={styles.social}>{I18n.t("Facebook")}</Text></Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.google} onPress={this.signIn}>
                        <Fontisto name='google' size={18} color='white' />
                        <Text style={styles.signinwith}>{I18n.t("Sign_in_with")}<Text style={styles.social}>{I18n.t("Google")}</Text></Text>
                    </TouchableOpacity>
                    
        {(Platform.OS === 'ios' && Platform.Version >= '13.0')&&
                    <AppleButton
                        style={styles.apple}
                        cornerRadius={5}
                        buttonStyle={AppleButton.Style.WHITE}
                        buttonType={AppleButton.Type.CONTINUE}
                        onPress={() => this.onAppleButtonPress()}
                    />}
                    <View style={styles.loginInfoContainer}>
                        <Text style={styles.loginInfoText}>Why You Need To Login ?</Text>
                        <Text>Logged In users can see their Favorite books</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.userLogin.user,
        isLogging: state.userLogin.isLogging,
        error: state.userLogin.errorMessage,
        activeSession: state.userLogin.activeSession,
        locale: state.userLogin.locale,
    }
}


export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
    },
    scroll: {
        padding: 15,
    },
    tophead: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    header: {
        alignItems: 'center',
    },
    loginInfoText: {
        textAlign: 'center',
        fontFamily: FONT_BOLD,
        paddingBottom: 8
    },
    loginInfoContainer: {
        marginBottom: 90,
        alignItems: 'center'
    },
    passwordHide: {
        justifyContent: 'center',
        paddingRight: 15
    },
    titleLogoImage: {
        height: 40,
        width: 150
    },
    closeContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    signinIcon: {
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
        alignSelf: 'flex-start',
        color: TITLE_COLOR,
    },
    email: {
        height: 50,
        justifyContent: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: SECONDARY_COLOR,
        borderRadius: 5
    },
    password: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
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
    reset: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16,
        textDecorationLine: 'underline',
        textAlign: 'right',
        paddingTop: 5,
        marginBottom: 15,
        color: '#656565'
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
    signin: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 14,
        color: TITLE_COLOR,
        color: '#FFFFFF',
        textAlign: 'center',
        paddingRight: 15
    },
    member: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 18,
        textAlign: 'center',
        color: TITLE_COLOR,
        opacity: .4,
        lineHeight: 21
    },
    signup: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 21,
        textDecorationLine: 'underline',
        color: PRIMARY_COLOR,
        textAlign: 'center',
        lineHeight: 25
    },
    sepratorContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    seprator: {
        flex: 1,
        height: 1,
        width: '100%',
        backgroundColor: '#707070',
        opacity: .2
    },
    orContainer: {
        height: 50,
        width: 50,
        borderRadius: 25,
        margin: 15,
        backgroundColor: '#E2E2E2',
        justifyContent: 'center',
        alignItems: 'center'
    },
    or: {
        fontFamily: FONT_REGULAR,
        fontSize: 16,
        color: TITLE_COLOR
    },
    facebook: {
        height: 50,
        width: '100%',
        backgroundColor: '#3b5998',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 15
    },
    google: {
        height: 50,
        width: '100%',
        backgroundColor: '#db3236',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 30
    },
    apple: {
        height: 50,
        width: '100%',
        borderWidth:2,
        borderColor:'#9c9c9c',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 30
    },
    social: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 16,
        color: TITLE_COLOR,
        color: 'white',
        textAlign: 'left'
    },
    signinwith: {
        fontFamily: FONT_MEDIUM,
        fontSize: 14,
        color: TITLE_COLOR,
        color: 'white',
        paddingLeft: 15
    },
    welcome: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 30,
        textAlign: 'center',
        color: TITLE_COLOR,
        flex: 1
    },
    goback: {
        flex: 1
    },
    emptyContainer: {
        flex: 1
    },
    indicatorContainer: {
        backgroundColor: '#FFFFFF00'
    },
})