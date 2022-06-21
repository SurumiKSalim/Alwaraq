import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity,ScrollView,Dimensions} from 'react-native';
import Modal from 'react-native-modal';
import {FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD, FONT_BOLD} from '../assets/fonts';
import {
  WHITE_COLOR,
  TEXT_BLACK_COLOR,
  BLACK_COLOR,
  PRIMARY_COLOR,
} from '../assets/color';
import I18n from '../i18n';
import DynamicText, { DynamicView, IS_IPAD } from '../common/dynamicviews'
const {width,height} = Dimensions.get('window')

const App = ({
  isVisible,
  title,
  onSubmit,
  closeModal,
  butttonlabel,
  header,
}) => {

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isVisible}
        hideModalContentWhileAnimating={true}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver={true}
        animationOutTiming={300}
        onBackButtonPress={() => closeModal&&closeModal()}
        onBackdropPress={() => closeModal&&closeModal()}
        style={styles.modal}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalHeader}>
            <Text style={styles.heading}>{header}</Text>
            <View style={styles.seperator}/>
            <DynamicText style={styles.modalText}>{title}</DynamicText>
          </ScrollView>
          <View style={styles.modalFooter}>
          {closeModal&&
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={() => closeModal()}>
              <Text style={styles.cancel}>{I18n.t('CANCEL')}</Text>
            </TouchableOpacity>}
            <TouchableOpacity onPress={() => onSubmit()} style={styles.button}>
              <Text style={styles.subscribe}>{butttonlabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight:'70%',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  seperator:{
    width:width*.9,
    height:1,
    marginHorizontal:-15,
    backgroundColor:'#ededed',
    marginBottom:8
  },
  modalText: {
    textAlign:'justify',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    color: TEXT_BLACK_COLOR,
    opacity: 0.9,
    flex:1
  },
  heading: {
    textAlign:'center',
    fontSize: 16,
    fontFamily: FONT_BOLD,
    color: BLACK_COLOR,
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cancel: {
    paddingRight: 25,
    fontSize: 14,
    color: TEXT_BLACK_COLOR,
    fontFamily: FONT_REGULAR,
  },
  subscribe: {
    color: '#000',
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
  },
  buttonCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  button: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
});
