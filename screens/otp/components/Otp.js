import React, { Component } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  SafeAreaView,
  BackHandler
} from "react-native";
import { connect } from "react-redux";
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR
} from "../../../assets/color";
import {
  FONT_PRIMARY,
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_REGULAR,
  FONT_MEDIUM,
  FONT_EXTRA_LIGHT
} from "../../../assets/fonts";
import AntDesign from "react-native-vector-icons/AntDesign";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Images from "../../../assets/images";
import OtpInputs from "react-native-otp-inputs";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { otpverify, resetOtp, resetShowOtp, setShowOtp } from "../actions";
import I18n from "../../../i18n";
import { resetUser, changeUserSession } from "../../login/actions";

class App extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      code: null
    };
    this.onVerify = this.onVerify.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }
  componentDidMount() {
    this.props.dispatch(resetOtp());
    if (!this.props.showOtp) {
      this.props.dispatch(
        setShowOtp(
          this.props.navigation.getParam("response"),
          this.props.navigation.getParam("id")
        )
      );
    }
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentDidUpdate(prevProps) {
    if (this.prevProps != this.props && this.props.user != null) {
      this.props.navigation.navigate("Profile");
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }
  handleBackButton() {
    return true;
  }

  onVerify() {
    this.props.dispatch(resetShowOtp());
    this.props.dispatch(
      otpverify(
        this.props.navigation.getParam("response")
          ? this.props.navigation.getParam("response")
          : this.props.userResponse,
        { otp: this.state.code },
        this.props.navigation,
        this.props.navigation.getParam("id")
          ? this.props.navigation.getParam("id")
          : this.props.id
      )
    );
    this.props.dispatch(resetUser());
  }

  onCancel() {
    this.props.dispatch(resetUser());
    if (this.props.showOtp) {
      this.props.dispatch(resetShowOtp());
    }
    this.props.navigation.navigate("Profile");
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.header}>
            <Text style={styles.welcome}>
              Thank you for signing up. Please check your email inbox for the
              OTP code from Electronic Village. Kindly check your spam folder if
              you did not find it in your inbox
            </Text>
            <Image source={{ uri: "titlelogo" }} style={styles.logoContainer} />
            {/* <Text style={styles.subtitle}>An one time password has been sent to <Text style={styles.email}>{this.props.navigation.getParam('response').email}</Text>.Please  enter the verification code.</Text> */}
          </View>
          <View style={styles.otpInputContainer}>
            <OTPInputView
              style={{ height: 80 }}
              keyboardAppearance="dark"
              pinCount={4}
              autoFocusOnLoad
              codeInputFieldStyle={styles.underlineStyleBase}
              codeInputHighlightStyle={styles.underlineStyleHighLighted}
              onCodeFilled={code => {
                this.setState({ code });
              }}
            />
          </View>
          {this.props.error && (
            <Text style={styles.validationText}>{this.props.error} </Text>
          )}
          <TouchableOpacity onPress={this.onVerify} style={styles.button}>
            <Text style={styles.signin}>
              {this.props.isLoading ? "Please wait..." : "Verify"}{" "}
            </Text>
            <AntDesign name="arrowright" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.onCancel} style={styles.CancelButton}>
            <Text style={styles.signin}>{I18n.t("Cancel")}</Text>
            <AntDesign name="close" size={26} color="white" />
          </TouchableOpacity>
          {/* <Text style={styles.resend}>resend otp if not recived</Text> */}
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    isLoading: state.userLogin.isLoading,
    error: state.userLogin.otpErrorMessage,
    showOtp: state.otp.showOtp,
    userResponse: state.otp.userResponse,
    id: state.otp.id
    // activeSession:state.userLogin.activeSession
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff"
  },
  scroll: {
    padding: 15
  },
  header: {
    alignItems: "center"
  },
  welcome: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
    textAlign: "center",
    color: TITLE_COLOR
  },
  subtitle: {
    fontFamily: FONT_REGULAR,
    fontSize: 22,
    paddingTop: 10,
    paddingBottom: 15,
    textAlign: "left",
    color: TITLE_COLOR
  },
  button: {
    height: 50,
    width: "100%",
    marginVertical: 10,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  CancelButton: {
    height: 50,
    width: "100%",
    marginVertical: 10,
    backgroundColor: "#f44336",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  signin: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    color: TITLE_COLOR,
    color: "#FFFFFF",
    textAlign: "center",
    paddingRight: 15
  },
  validationText: {
    color: "#f44336",
    fontFamily: FONT_LIGHT,
    fontSize: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: -5
  },
  resend: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    textDecorationLine: "underline",
    color: TITLE_COLOR,
    textAlign: "center",
    lineHeight: 25,
    paddingTop: 10
  },
  email: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    color: TITLE_COLOR
  },
  logoContainer: {
    height: 40,
    width: 150
  },
  underlineStyleBase: {
    borderColor: "#000",
    color: "#000"
  }
});
