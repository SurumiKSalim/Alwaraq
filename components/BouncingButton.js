import React, {useRef, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {PRIMARY_COLOR} from '../assets/color';

const BouncingButton = ({
  children,
  onPress,
  setInitialBounce,
  setOnClickBounce,
  buttonStyle,
  ...props
}) => {
  const initialAnimationValue = useRef(new Animated.Value(0.9)).current;
  const bouncingAnimationValue = useRef(new Animated.Value(0)).current;
  const [initialAnimationDone, setInitialAnimationDone] = useState(false);

  useEffect(() => {
    if (setInitialBounce) {
      Animated.sequence([
        Animated.timing(initialAnimationValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(initialAnimationValue, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(initialAnimationValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => setInitialAnimationDone(true));
    } else {
      setInitialAnimationDone(true);
    }
  }, [initialAnimationValue]);

  const handlePress = () => {
    if (setOnClickBounce) {
      Animated.sequence([
        Animated.timing(bouncingAnimationValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bouncingAnimationValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onPress();
      });
    } else {
      onPress();
    }
  };

  const initialAnimationStyle = {
    transform: [
      {
        scale: initialAnimationValue,
      },
    ],
  };

  const bouncingAnimationStyle = {
    transform: [
      {
        scale: bouncingAnimationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[
          buttonStyle,
          initialAnimationDone ? bouncingAnimationStyle : initialAnimationStyle,
        ]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default BouncingButton;
