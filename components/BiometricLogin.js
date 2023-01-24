import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';
import Toast from 'react-native-simple-toast';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PRIMARY_COLOR} from '../assets/color';
import { FONT_REGULAR } from '../assets/fonts';
import I18n from '../i18n';

const App = ({biometricLogin}) => {

  const validateBiometric = async (rnBiometrics) => {
    rnBiometrics
      .simplePrompt({promptMessage: 'Confirm fingerprint'})
      .then((resultObject) => {
        const {success} = resultObject;
        if (success) {
            biometricLogin()
        } else {
            Toast.show('user cancelled biometric prompt');
        }
      })
      .catch(() => {
        Toast.show('biometrics failed');
      });
  };

  const checkBiometric = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      rnBiometrics.isSensorAvailable().then((resultObject) => {
        const {available, biometryType} = resultObject;
        if (available && biometryType === BiometryTypes.TouchID) {
          console.log('TouchID is supported');
          validateBiometric(rnBiometrics);
        } else if (available && biometryType === BiometryTypes.FaceID) {
          console.log('FaceID is supported');
          validateBiometric(rnBiometrics);
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          console.log('Biometrics is supported', biometryType);
          validateBiometric(rnBiometrics);
        } else {
          Toast.show('Biometrics not supported');
        }
      });
  };

  return (
    <TouchableOpacity onPress={()=>checkBiometric()} style={styles.container}>
      <Ionicons name="finger-print-outline" size={60} color={PRIMARY_COLOR} />
    <Text style={styles.title}>{I18n.t('Biometric_Sign_In')}</Text>
    </TouchableOpacity>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title:{
    color:PRIMARY_COLOR,
    fontFamily:FONT_REGULAR,
    fontSize:12
  }
});
