import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {
  PRIMARY_COLOR,
  INPUT_BACKGROUND_COLOR,
  WHITE_COLOR,
  BG_GRAY_COLOR,
  INPUT_COLOR,
  TEXT_GRAY_COLOR,
} from '../assets/color';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import I18n from '../i18n';
import { FONT_REGULAR } from '../assets/fonts';

const App = ({toogleModal, fromSearchPage, moduleId, title,navigation}) => {
  const [searchText, setText] = useState(null);

  const onSearch = () => {
    if (searchText?.length>0) {
    toogleModal();
    console.log('item',fromSearchPage)
    if (fromSearchPage!=true) {
      navigation.replace('IbnAwardBookList', {
        searchText: searchText,
        moduleId: moduleId,
        pageTitle: title,
      });
    } else {
      navigation.navigate('IbnAwardBookList', {
        searchText: searchText,
        moduleId: moduleId,
        pageTitle: title,
      });
    }
  }
  else 
  Toast.show('Please enter a keyword');
  };
  return (
    <View style={styles.header}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={I18n.t('Search')}
          placeholderTextColor={PRIMARY_COLOR}
          onChangeText={text => setText(text)}
          style={styles.textField}
          keyboardType="email-address"
          autoCompleteType="email"
        />
      </View>
      <TouchableOpacity onPress={() => onSearch()} style={styles.headerButton}>
        <AntDesign name="search1" color={'#fff'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    borderColor: PRIMARY_COLOR,
    borderWidth:.5,
    height: 40,
    borderRadius: 15,
  },
  headerButton: {
    backgroundColor: PRIMARY_COLOR,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 8,
  },
  textField: {
      flex: 1,
      fontSize: 12,
      fontFamily: FONT_REGULAR,
      paddingLeft: 15,
      paddingTop: 0,
      paddingBottom: 0,
      justifyContent: 'center',
      color: PRIMARY_COLOR,
  },
});

export default App;
