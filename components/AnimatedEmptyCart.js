import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import {FONT_SEMIBOLD} from '../assets/fonts';
import { PRIMARY_COLOR } from '../assets/color';

const {width, height} = Dimensions.get('window');

const animateLoader = (navigation) => (
  <View style={styles.animateLoader}>
    <AnimatedLottieView
      source={require('../animations/emptyCart.json')}
      style={{height: 300, width: 200, alignSelf: 'center'}}
      autoPlay
      loop={false}
    />
    <Text style={styles.txt}>Your cart is empty!</Text>
    <TouchableOpacity
        onPress={()=>navigation.navigate('HomePage')}
      style={[styles.button,{width:300}]}>
      <Text style={styles.submit}>Shop Now</Text>
    </TouchableOpacity>
  </View>
);

export default animateLoader;

const styles = StyleSheet.create({
  animateLoader: {
    height: height * 0.6,
    width: width,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button:{
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
  submit: {
      fontSize: 16,
      fontFamily: FONT_SEMIBOLD,
      color: '#FFFFFF',
      width: '100%',
      justifyContent: 'center',
      textAlign: 'center'
  },
  AnimatedLottieView: {
    height: 180,
  },
  txt: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    marginBottom:30
  },
});
