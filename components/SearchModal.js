import React from 'react';
import {
  StyleSheet,
  Platform,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {PRIMARY_COLOR, BG_GRAY_COLOR} from '../assets/color';
import Modal from 'react-native-modal';
import SearchBox from './SearchBox';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {height, width} = Dimensions.get('screen');

const App = ({isVisible, toogleModal, fromSearchPage, moduleId, title,navigation}) => {
  const renderItem = () => {
    return (
      <View style={styles.container}>
        <SearchBox
          toogleModal={toogleModal}
          fromSearchPage={fromSearchPage}
          moduleId={moduleId}
          title={title}
          navigation={navigation}
        />
        <TouchableOpacity onPress={() => toogleModal()}>
          <Ionicons name="ios-arrow-up" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'slideInDown'}
      animationOut={'slideOutUp'}
      onSwipeComplete={() => this.close()}
      hasBackdrop={true}
      backdropOpacity={0.02}
      backdropTransitionOutTiming={100}
      backdropColor={'black'}
      useNativeDriver={true}
      onBackButtonPress={() => toogleModal()}
      onBackdropPress={() => toogleModal()}
      hideModalContentWhileAnimating={true}
      animationInTiming={1000}
      animationOutTiming={1000}
      style={styles.bottomModal}>
      {renderItem()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomModal: {
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
  container: {
    backgroundColor: '#fff',
    height: Platform.OS=='ios'?150: 115,
    marginTop:-25,
    marginHorizontal: -20,
    paddingHorizontal: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position:'absolute',
    width:width+5,
    shadowOpacity:.2
  },
});

export default App;