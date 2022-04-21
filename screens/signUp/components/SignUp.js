import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import {GoogleSignin} from '@react-native-community/google-signin';
import {
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
} from '../../../assets/color';
import {
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_REGULAR,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Images from '../../../assets/images';
import {signup} from '../actions';
import firebase from 'react-native-firebase';
import {MaterialIndicator} from 'react-native-indicators';
import {sendFCMToken} from '../../login/actions';
import DeviceInfo from 'react-native-device-info';
import {changeUserSession} from '../../login/actions';
import {webClientId} from '../../../common/config';
import jwt_decode from 'jwt-decode';
import I18n from '../../../i18n';
import Api from '../../../common/api';
import {EMAIL_VALIDATE} from '../../../common/endpoints';
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
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: null,
      email: null,
      emailValidate: true,
      password: null,
      confirmPassword: null,
      validate: null,
      error: null,
      disposalMail: false,
    };
    this.validate = this.validate.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.login_fb = this.login_fb.bind(this);
    this.userInfoFb = this.userInfoFb.bind(this);
    this._responseInfoCallback = this._responseInfoCallback.bind(this);
    this.signIn = this.signIn.bind(this);
    this.sentUserToServer = this.sentUserToServer.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.validateEmailDomain = this.validateEmailDomain.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(changeUserSession('Signup'));
  }

  async configureFCM() {
    firebase
      .messaging()
      .hasPermission()
      .then(enabled => {
        if (!enabled) {
          firebase
            .messaging()
            .requestPermission()
            .then(() => {
              // User has authorised
            })
            .catch(error => {
              // User has rejected permissions
            });
        }
      });
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      let uniqueId = await DeviceInfo.getUniqueId();
      let osType = Platform.OS == 'ios' ? 1 : 2;
      //4rd parameter->forcefully updated
      this.props.dispatch(sendFCMToken(fcmToken, osType, uniqueId, true));
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps != this.props && this.props.user) {
      if (this.props.activeSession != 'settings') {
        this.props.navigation.goBack();
      }
    }
  }

  validateEmailDomain() {
    let email = this.state.email;
    Api('get', EMAIL_VALIDATE + email).then(response => {
      if (response.disposable) {
        this.setState({
          emailValidate: false,
          disposalMail: true,
        });
      }
    });
  }

  validate(text, type) {
    let alph = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    if (type == 'email') {
      if (alph.test(text)) {
        this.setState({
          emailValidate: true,
          email: text,
        });
      } else {
        this.setState({
          emailValidate: false,
          email: text,
        });
      }
    }
  }

  onSignUp() {
    if (this.state.name == null) {
      this.setState({validate: 'Name cannot be empty'});
      return 0;
    }
    if (this.state.email == null || this.state.email == '') {
      this.setState({validate: 'Email cannot be empty'});
      return 0;
    }
    if (this.state.password == null || this.state.password == '') {
      this.setState({validate: 'Password cannot be empty'});
      return 0;
    }
    if (this.state.confirmPassword == null || this.state.password == '') {
      this.setState({validate: 'Enter password again'});
      return 0;
    }

    if (
      this.state.password == this.state.confirmPassword &&
      this.state.email !== null &&
      this.state.emailValidate
    ) {
      this.props.dispatch(
        signup(
          {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            fbgoogle: 0,
          },
          this.props.navigation,
        ),
      );
      // this.props.dispatch(signup({ name: this.state.name, email: this.state.email, password: this.state.password, fbgoogle: 0 }, this.props.navigation, this.props.locale))
      // this.props.navigation.navigate('Otp')
      this.setState({validate: null, error: this.props.error});
    }
    if (!this.state.emailValidate) {
      this.setState({validate: 'Please use a valid email'});
    }
    if (this.state.password != this.state.confirmPassword) {
      this.setState({validate: 'Password and confirm password should be same'});
    }
  }

  sentUserToServer(user) {
    this.props.dispatch(signup(user, this.props.navigation));
    // this.props.dispatch(signup(user, this.props.navigation, this.props.locale))
  }

  onLogin() {
    let user = {email: this.state.email, password: this.state.password};
    this.props.dispatch(fetchUser(user));
  }

  async _setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      await GoogleSignin.configure({
        webClientId: webClientId,
        offlineAccess: false,
      });
    } catch (err) {}
  }

  _responseInfoCallback(error: ?Object, result: ?Object) {
    if (error) {
      alert('Error fetching data: ' + error.toString());
    } else {
      let user = {};
      user.name = result.name;
      user.email = result.email;
      user.photo = result.picture.data.url;
      user.fbgoogle = 1;
      user.auth = {
        id: result.id,
        provider: 'facebook',
      };
      this.sentUserToServer(user);
    }
    console.log('user', user);
  }

  userInfoFb() {
    const infoRequest = new GraphRequest(
      '/me?fields=name,email,picture.height(72).width(72)',
      null,
      this._responseInfoCallback,
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  signIn() {
    GoogleSignin.signIn()
      .then(result => {
        let user = {};
        user.name = result.user.name;
        user.email = result.user.email;
        user.photo = result.user.photo;
        user.fbgoogle = 2;
        user.auth = {
          id: result.user.id,
          provider: 'google',
        };
        this.sentUserToServer(user);
      })
      .catch(err => {})
      .done();
  }

  login_fb() {
    const that = this;
    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      function (result) {
        if (!result.isCancelled) {
          that.userInfoFb();
        }
      },
      function (error) {},
    );
  }

  async onAppleButtonPress() {
    // 1). start a apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [
        AppleAuthRequestScope.EMAIL,
        AppleAuthRequestScope.FULL_NAME,
      ],
    });

    // 2). if the request was successful, extract the token and nonce
    console.log('appleAuthRequestResponse', appleAuthRequestResponse);
    const {identityToken, nonce} = appleAuthRequestResponse;

    // can be null in some scenarios
    if (identityToken) {
      var decoded = jwt_decode(identityToken);
      console.log('decoded', decoded.email);
      let user = {};
      user.name =
        appleAuthRequestResponse.fullName.givenName +
        ' ' +
        appleAuthRequestResponse.fullName.familyName;
      user.email = appleAuthRequestResponse.email
        ? appleAuthRequestResponse.email
        : decoded && decoded.email;
      // user.photo = appleAuthRequestResponse.picture.data.url
      user.fbgoogle = 3;
      user.fcmToken = this.state.fcmToken;
      user.auth = {
        id: appleAuthRequestResponse.id,
        provider: 'apple',
      };
      this.sentUserToServer(user);
    } else {
      // handle this - retry?
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          <View style={styles.tophead}>
            <TouchableOpacity
              onPress={() => this.props.navigation.goBack()}
              style={styles.goback}>
              <AntDesign name="arrowleft" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.welcome}>{I18n.t('EV_SignUp')}</Text>
            <View style={styles.emptyContainer} />
          </View>
          <View style={styles.header}>
            <Text
              style={[
                styles.subtitle,
                {textAlign: this.props.locale == 'ar' ? 'right' : 'justify'},
              ]}>
              {I18n.t('EV_Account_Description')+I18n.t(
                'Enter_your_informations_below_or_login_with_social_account',
              )}
            </Text>
          </View>
          <View style={styles.email}>
            <TextInput
              placeholder={I18n.t('Name')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({name: text})}
              style={styles.textField}
            />
          </View>
          <View style={styles.email}>
            <TextInput
              placeholder={I18n.t('Email')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={
                (text => this.setState({email: text}),
                text => this.validate(text, 'email'))
              }
              style={styles.textField}
              onBlur={() => this.validateEmailDomain()}
              caretHidden={Platform.OS === 'ios' ? false : true}
              keyboardType="email-address"
              autoCompleteType="email"
            />
          </View>
          {!this.state.emailValidate && (
            <Text style={styles.emailValidate}>
              {this.state.disposalMail
                ? "This mail domain can't be used"
                : 'Enter a valid mail'}
            </Text>
          )}
          <View style={styles.password}>
            <TextInput
              placeholder={I18n.t('Password')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({password: text})}
              secureTextEntry={true}
              style={styles.textField}
            />
          </View>
          <View style={styles.password}>
            <TextInput
              placeholder={I18n.t('Confirm_Password')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({confirmPassword: text})}
              secureTextEntry={true}
              style={styles.textField}
            />
          </View>
          {this.state.validate && (
            <Text style={styles.validationText}>{this.state.validate} </Text>
          )}
          {this.state.error && (
            <Text style={styles.validationText}>{this.state.error}</Text>
          )}
          <TouchableOpacity onPress={this.onSignUp} style={styles.button}>
            {this.props.isLogging ? (
              <MaterialIndicator
                color="white"
                size={20}
                style={styles.signUpIcon}
              />
            ) : (
              <Text style={styles.signin}>{I18n.t('Sign_Up')}</Text>
            )}
          </TouchableOpacity>
          <View style={styles.sepratorContainer}>
            <View style={styles.seprator} />
            <View style={styles.orContainer}>
              <Text style={styles.or}>{I18n.t('OR')}</Text>
            </View>
            <View style={styles.seprator} />
          </View>
          <TouchableOpacity onPress={this.login_fb} style={styles.facebook}>
            <Fontisto name="facebook" size={18} color="white" />
            <Text style={styles.signinwith}>
              {I18n.t('Sign_Up_With')}
              <Text style={styles.social}>{I18n.t('Facebook')}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.signIn} style={styles.google}>
            <Fontisto name="google" size={18} color="white" />
            <Text style={styles.signinwith}>
              {I18n.t('Sign_Up_With')}
              <Text style={styles.social}>{I18n.t('Google')}</Text>
            </Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && Platform.Version >= '13.0' && (
            <AppleButton
              style={styles.apple}
              cornerRadius={5}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.CONTINUE}
              onPress={() => this.onAppleButtonPress()}
            />
          )}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    isLogging: state.userLogin.isLogging,
    error: state.userLogin.signUpErrorMessage,
    // activeSession: state.userLogin.activeSession,
    locale: state.userLogin.locale,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
  scroll: {
    padding: 15,
  },
  tophead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  headerImage: {
    height: 40,
    width: 150,
  },
  goback: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  signUpIcon: {
    elevation: 20,
  },
  welcome: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 20,
    textAlign: 'center',
    color: TITLE_COLOR,
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 22,
    paddingTop: 10,
    paddingBottom: 15,
    textAlign: 'left',
    color: TITLE_COLOR,
  },
  email: {
    height: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    marginBottom: 15,
  },
  emailValidate: {
    fontFamily: FONT_LIGHT,
    fontSize: 15,
    color: '#f44336',
    paddingHorizontal: 15,
    marginBottom: 15,
    marginTop: -10,
  },
  password: {
    height: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    marginBottom: 15,
  },
  textField: {
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
    marginTop: -5,
  },
  button: {
    height: 50,
    width: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  signin: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    color: TITLE_COLOR,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingRight: 15,
  },
  sepratorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seprator: {
    flex: 1,
    height: 1,
    width: '100%',
    backgroundColor: '#707070',
    opacity: 0.2,
  },
  orContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 15,
    backgroundColor: '#E2E2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  or: {
    fontFamily: FONT_REGULAR,
    fontSize: 16,
    color: TITLE_COLOR,
  },
  facebook: {
    height: 50,
    width: '100%',
    backgroundColor: '#3b5998',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  google: {
    height: 50,
    width: '100%',
    backgroundColor: '#db3236',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 60,
  },
  social: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
    color: TITLE_COLOR,
    color: 'white',
    textAlign: 'left',
  },
  signinwith: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    color: TITLE_COLOR,
    color: 'white',
    paddingLeft: 15,
  },
  apple: {
    height: 50,
    width: '100%',
    borderWidth: 2,
    borderColor: '#9c9c9c',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 30,
  },
});
