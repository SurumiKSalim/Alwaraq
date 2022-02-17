import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Api from '../common/api';
import {EMAIL_VALIDATE, SEND_OTP} from '../common/endpoints';
import {FONT_REGULAR, FONT_SEMIBOLD} from '../assets/fonts';
import {TITLE_COLOR, PRIMARY_COLOR,SECONDARY_COLOR} from '../assets/color';
import I18n from '../i18n';

const App = ({user, navigation}) => {
  usernameEditField;

  const [isVisible, setVisible] = useState(false);
  const [updateEmail, setUpdateEmail] = useState(null);
  const [usernameEditField, setUsernameEditField] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setUpdateEmail(user?.email);
  }, [user]);

  const changeEmail = () => {
    setError(null);
    setLoading(true);
    let formData = new FormData();
    formData.append('appId', 31);
    formData.append('email', updateEmail);
    Api('post', SEND_OTP, formData).then((response) => {
      setLoading(false);
      if (response?.statusCode == 200) {
        setVisible(false);
        navigation.navigate('ChangeEmail', {updateEmail: updateEmail});
      } else {
        setVisible(false);
        setError(
          response?.errormessage
            ? response.errormessage
            : 'Something Went Wrong',
        );
      }
    });
    // this.props.dispatch(fetchChangeName(this.state.updateEmail));
    // setVisible(false)
  };

  const validate = (text, type) => {
    if (updateEmail != user?.email) {
      let alph = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
      if (type == 'email') {
        if (alph.test(text)) {
          validateEmailDomain();
        } else {
          setError('Enter a vailed Email');
        }
      }
    } else {
      setError('No change in email');
    }
  };

  const validateEmailDomain = () => {
    Api('get', EMAIL_VALIDATE + updateEmail).then((response) => {
      if (response.disposable) {
        setError('Enter a vailed Domain');
      } else {
        changeEmail();
      }
    });
  };

  const changeText = (text) => {
    setUpdateEmail(text);
    setError(null);
  };

  const openModal = () => {
    setError(null);
    setUpdateEmail(user?.email);
    setVisible(true);
  };

  const renderModalEdit = () => (
    <View style={styles.content}>
      <View style={styles.modalClose}>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Ionicons name="ios-close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.modalTitle}>{I18n.t('Edit_Email')}</Text>
      <View style={styles.txtinput}>
        <TextInput
          value={updateEmail != null ? updateEmail : usernameEditField}
          placeholderTextColor={TITLE_COLOR}
          onChangeText={(text) => changeText(text)}
          style={styles.modalTxtInput}
        />
      </View>
      {updateEmail === '' && (
        <Text style={styles.info}>* {I18n.t('user_name_cant_be_empty')}</Text>
      )}
      {error && <Text style={styles.info}>* {error}</Text>}
      <TouchableOpacity
        onPress={() => updateEmail !== '' && validate(updateEmail, 'email')}
        style={styles.modalButton}>
        <View style={styles.TouchableContentView}>
          <Text style={styles.modalButtonFont}>
            {isLoading ? I18n.t('changing') : 'Submit'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.profName} numberOfLines={1}>
        {user ? user.email : '-'}
      </Text>
      <MaterialIcons
        onPress={() => openModal()}
        name="edit"
        style={styles.userNameIcon}
        size={19}
        color="grey"
      />
      <Modal
        isVisible={isVisible}
        onSwipeComplete={() => setVisible(false)}
        hasBackdrop={true}
        backdropOpacity={0.02}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
        animationInTiming={1000}
        animationOutTiming={1000}
        style={styles.bottomModal}>
        <KeyboardAvoidingView
          style={styles.KeyboardViewContainer2}
          behavior="padding"
          enabled
          keyboardVerticalOffset={Platform.OS == 'ios' ? 0 : -300}>
          {renderModalEdit()}
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  profName: {
    fontSize: 14,
    fontFamily: FONT_REGULAR,
    color: SECONDARY_COLOR,
    marginRight: 5,
  },
  bottomModal: {
    marginBottom: 0,
    justifyContent: 'flex-end',
  },
  KeyboardViewContainer2: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: -20,
  },
  content: {
    padding: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalClose: {
    flexDirection: 'row',
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 24,
    paddingBottom: 15,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
  },
  txtinput: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    // paddingLeft: 15,
    marginBottom: 20,
  },
  modalTxtInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    borderRadius: 8,
    paddingLeft: 15,
    borderWidth: 1,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  TouchableContentView: {
    backgroundColor: PRIMARY_COLOR,
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 25,
  },
  modalButtonFont: {
    fontSize: 20,
    fontFamily: FONT_SEMIBOLD,
    color: '#FFFFFF',
  },
  info: {
    color: 'red',
    marginBottom: 8,
    fontFamily: FONT_REGULAR,
  },
});
