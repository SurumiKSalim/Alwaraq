import React, {useEffect, useState} from 'react';
import {View, Switch, StyleSheet,Text} from 'react-native';
import Toast from 'react-native-simple-toast';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import {PRIMARY_COLOR} from '../assets/color';
import {changeBiometric} from '../screens/login/actions';
import { FONT_REGULAR } from '../assets/fonts';
import I18n from '../i18n';

const App = ({dispatch, isBiometric}) => {

  const validateBiometric = async (rnBiometrics) => {
    rnBiometrics
      .simplePrompt({promptMessage: 'Confirm fingerprint'})
      .then((resultObject) => {
        const {success} = resultObject;
        if (success) {
          console.log('successful biometrics provided');
          dispatch(changeBiometric(true));
        } else {
          Toast.show('user cancelled verification');
          dispatch(changeBiometric(false));
        }
      })
      .catch(() => {
        Toast.show('biometrics failed');
        dispatch(changeBiometric(false));
      });
  };

  const checkBiometric = async () => {
    if (!isBiometric) {
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
          dispatch(changeBiometric(false));
        }
      });
    } else {
      dispatch(changeBiometric(false));
    }
  };
  return (
    <View style={styles.contain}>
        <Text style={styles.title}>{I18n.t('Enable_Biometric')}</Text>
    <Switch
      onValueChange={checkBiometric}
      style={styles.container}
      trackColor={{true: PRIMARY_COLOR, false: 'grey'}}
      value={isBiometric}
    />
    </View>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
    marginVertical: 10,
    marginLeft:6,
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
contain:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'flex-end'
},
title:{
    color:PRIMARY_COLOR,
    fontFamily:FONT_REGULAR,
    fontSize:12
}
});
