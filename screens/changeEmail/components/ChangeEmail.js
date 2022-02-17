import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Api from '../../../common/api';
import {CHANGE_EMAIL, SEND_OTP} from '../../../common/endpoints';
import {
  PRIMARY_COLOR,
  TITLE_COLOR,
  SECONDARY_COLOR,
} from '../../../assets/color';
import {
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_LIGHT,
} from '../../../assets/fonts';
import I18n from '../../../i18n';
import AlertModal from '../../../components/AlertModal';
import { changeEmail } from '../../login/actions'

const App = ({navigation,user,dispatch,route}) => {
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);
  const [isVisible, setModal] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [updateEmail, setUpdateEmail] = useState(route?.updateEmail);

  const closeModal = () => {
    setModal(false);
  };

  const onSubmit = () => {
    setModal(false);
    navigation.navigate('Profile');
  };
  const onVerify = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append('appId', 31);
    formData.append('otp', code);
    formData.append('email', updateEmail);
    Api('post', CHANGE_EMAIL, formData).then((response) => {
      setLoading(false);
      console.log('response', response);
      if (response?.statusCode == 200) {
        setModal('success');
        setError(response?.errormessage)
        let user_updated = { ...user, email: response.userinfo?.email }
        dispatch(changeEmail(user_updated))
      } else {
        setModal('failed');
        setError(response?.errormessage)
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Enter OTP</Text>
      <Text style={styles.subHeader}>
        Please check your email inbox for the OTP code from Electronic Village.
        Kindly check your spam folder if you did not find it in your inbox.
      </Text>
      <View style={styles.otpInputContainer}>
        <OTPInputView
          style={{height: 200}}
          pinCount={4}
          autoFocusOnLoad
          codeInputFieldStyle={styles.underlineStyleBase}
          codeInputHighlightStyle={styles.underlineStyleHighLighted}
          onCodeFilled={(code) => {
            setCode(code);
          }}
        />
      </View>
      <TouchableOpacity onPress={() => onVerify()} style={styles.button}>
        <Text style={styles.signin}>
          {isLoading ? I18n.t('changing') : 'Verify'}{' '}
        </Text>
        <AntDesign name="arrowright" size={26} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={styles.CancelButton}>
        <Text style={styles.signin}>Cancel</Text>
        <AntDesign name="close" size={26} color="white" />
      </TouchableOpacity>
      <AlertModal
        isVisible={isVisible == 'success'}
        onSubmit={onSubmit}
        header={I18n.t('SUCCESS')}
        butttonlabel={I18n.t('Ok')}
        title={error}
      />
      <AlertModal
        isVisible={isVisible == 'failed'}
        onSubmit={onSubmit}
        header={I18n.t('FAILED')}
        butttonlabel={I18n.t('Ok')}
        title={error}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => {
  return {
    locale: state.userLogin.locale,
    user: state.userLogin.user,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 15,
  },
  header: {
    color: TITLE_COLOR,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    marginBottom: 8,
  },
  subHeader: {
    color: TITLE_COLOR,
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    textAlign:'justify'
  },
  otpInputContainer: {
    width: '80%',
  },
  button: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  CancelButton: {
    height: 50,
    width: '100%',
    marginVertical: 10,
    backgroundColor: '#f44336',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  signin: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    color: TITLE_COLOR,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingRight: 15,
  },
});
