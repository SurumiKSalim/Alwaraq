import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput} from 'react-native';
import {connect} from 'react-redux';
import DropDownPicker from 'react-native-dropdown-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SECONDARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import {FONT_SEMIBOLD} from '../../../assets/fonts';
import I18n from '../../../i18n';
import {fetchCountryList} from '../../AddressManager/actions';

const App = ({country, dispatch}) => {
  let inputData = {};
  const keyArray = [
    'Name',
    'literary name',
    'Manuscript name',
    'e-mail',
    'Country of Residence',
    'Phone',
    'Nationality',
    'nickname',
    'About the manuscript',
    'About the participant',
  ];

  useEffect(() => {
    dispatch(fetchCountryList());
  }, []);

  const fetchInput = (key, text) => {
    let obj = {};

    switch (key) {
      case keyArray[0]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[1]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[2]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[3]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[4]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[5]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[6]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[7]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[8]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
      case keyArray[9]:
        obj[key] = text;
        inputData = {...inputData, ...obj};
        break;
    }
    console.log(inputData);
  };

  const InputData = placeholder => {
    return (
      <View style={styles.email}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={TITLE_COLOR}
          onChangeText={text => fetchInput(placeholder, text)}
          style={
            placeholder == keyArray[8] || placeholder == keyArray[9]
              ? styles.multiLineTextField
              : styles.textField
          }
          multiline={placeholder == keyArray[8] || placeholder == keyArray[9]}
          keyboardType={
            placeholder == keyArray[3]
              ? 'email-address'
              : placeholder == keyArray[5]
              ? 'number-pad'
              : ''
          }
          autoCompleteType={placeholder == keyArray[3] ? 'email' : ''}
        />
      </View>
    );
  };

  const RenderDropdown = placeholder => {
    return (
      <DropDownPicker
        items={country}
        // defaultValue={this.state.country}
        labelStyle={styles.dropDownText}
        style={styles.dropDownContainer}
        itemStyle={styles.itemStyle}
        placeholder={placeholder}
        onChangeItem={(item, index) => fetchInput(placeholder, item)}
      />
    );
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      {keyArray?.map((item, index) => {
        {
          if (index == 4 || index == 6) {
            return RenderDropdown(keyArray[index]);
          } else {
            return InputData(item);
          }
        }
      })}
    </KeyboardAwareScrollView>
  );
};

const mapStateToProps = state => {
  return {
    country: state.address.country,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  email: {
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    flexDirection: 'row',
  },
  textField: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    paddingLeft: 15,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  multiLineTextField: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    paddingLeft: 15,
    paddingVertical: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  dropDownText: {
    // marginTop: 10,
    // marginBottom: 10,
    paddingVertical: 7,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  dropDownContainer: {
    borderColor: SECONDARY_COLOR,
    marginBottom: 15,
  },
  itemStyle: {
    justifyContent: 'flex-start',
  },
});
