import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR} from '../assets/color';
import {DynamicView} from '../common/dynamicviews';
import BouncingButton from './BouncingButton';

const {width, height} = Dimensions.get('window');
const ModalListView = ({
  data,
  isVisible,
  onClose,
  coverImage,
  onSelect,
  currentIndex,
}) => {
  const renderItem = ({item, index}) => (
    <DynamicView
      touchable
      onPress={() => onSelect(index)}
      style={[
        styles.itemContainer,
        {backgroundColor: index == currentIndex ? PRIMARY_COLOR : '#fff'},
      ]}>
      <Text
        style={[
          styles.serialNumber,
          {color: index == currentIndex ? '#fff' : TITLE_COLOR},
        ]}>
        {index + 1}
      </Text>
      <Image style={styles.coverImage} source={{uri: coverImage}} />
      <Text
        numberOfLines={1}
        style={[
          styles.audioTitle,
          {color: index == currentIndex ? '#fff' : TITLE_COLOR},
        ]}>
        {item.audioTitle}
      </Text>
      {index == currentIndex&&
      <Text
        style={ styles.playingText}>
        Currently Playing . . 
      </Text>}
    </DynamicView>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}>
      <View style={styles.modalContainer}>
        <FlatList
          data={data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
      <BouncingButton
        setInitialBounce
        setOnClickBounce
        buttonStyle={styles.bouncingButton}
        onPress={onClose}>
        <Ionicons name="close-circle-outline" size={35} color="#fff" />
      </BouncingButton>
    </Modal>
  );
};

export default ModalListView;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: height * 0.75,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderColor: SECONDARY_COLOR,
    borderWidth: 0.5,
    padding: 10,
    borderRadius: 10,
  },
  serialNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: TITLE_COLOR,
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  audioTitle: {
    fontSize: 16,
    color: TITLE_COLOR,
    flexShrink: 1,
  },
  playingText:{
    position:'absolute',
    right:5,
    bottom:8,
    color:'#fff',
    fontSize:10
  },
  bouncingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    backgroundColor: PRIMARY_COLOR,
    alignSelf: 'center',
    marginTop: 10,
  },
});
