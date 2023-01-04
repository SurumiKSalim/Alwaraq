import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {HeaderBackButton} from 'react-navigation-stack';
import Toast from 'react-native-simple-toast';
import {
  PRIMARY_COLOR,
  TEXT_BLACK_COLOR,
  BLACK_COLOR,
  BG_GRAY_COLOR,
  WHITE_COLOR,
  TEXT_GRAY_COLOR,
} from '../assets/color';
import Entypo from 'react-native-vector-icons/Entypo';
import {copilot, walkthroughable, CopilotStep} from 'react-native-copilot';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {connect} from 'react-redux';
import AlertModal from './AlertModal';
import {resetSearchModal} from '../screens/home/actions';
import I18n from '../i18n';
import ToolTip from './toolTip';
import { FONT_SEMIBOLD } from '../assets/fonts';
import SearchModal from './SearchModal'

const App = ({navigation, toogleSwapImage,isSwapImg,fromSearchPage}) => {
  const [isSearchVisible, setSearchModal] = useState(false)

  const closeModal = () => {
    setModal(false);
  };

  const toogleSearchModal = () => {
    setSearchModal(!isSearchVisible)
  }

  const toogleImage=()=>{
    if(isSwapImg){
      Toast.show('Changing into Book images . . .');
    }
    else{
      Toast.show('Changing into Author images . . .');
    }
    toogleSwapImage()
  }

  return (
    <View style={styles.header}>
      <View>
        <View style={styles.headerContainer}>
          <HeaderBackButton
            size={30}
            tintColor={PRIMARY_COLOR}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>IB Awards</Text>
        </View>
      </View>
      <View style={styles.subHeader}>
      <TouchableOpacity
          onPress={() =>
            toogleImage()
          }
          style={styles.headerButton}>
          <Ionicons
            name="md-camera-reverse-outline"
            color={PRIMARY_COLOR}
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ApplyIbnAward')}
          style={styles.headerButton}>
          <FontAwesome name="wpforms" color={PRIMARY_COLOR} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('AwardInfo')}
          style={styles.headerButton}>
          <AntDesign name="infocirlceo" color={PRIMARY_COLOR} size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Map', {fromIbnAwards: true})
          }
          style={styles.headerButton}>
          <Ionicons
            name="ios-location-outline"
            color={PRIMARY_COLOR}
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toogleSearchModal()}
          style={[styles.headerButton, {backgroundColor: WHITE_COLOR}]}>
          <AntDesign name="search1" color={PRIMARY_COLOR} size={20} />
        </TouchableOpacity>
      </View>
      <SearchModal
        isVisible={isSearchVisible}
        navigation={navigation}
        fromSearchPage={fromSearchPage}
        toogleModal={toogleSearchModal} />
    </View>
  );
};

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    isFirstLogin: state.userLogin.isFirstLogin,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG_GRAY_COLOR,
    marginHorizontal: 10,
    height: 50,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG_GRAY_COLOR,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
  },
  headerButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 15,
  },
  title:{
    fontSize:18,
    fontFamily:FONT_SEMIBOLD,
    color:PRIMARY_COLOR
  }
});
