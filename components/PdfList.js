import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import Modal from "react-native-modal"
import {FONT_SEMIBOLD} from '../assets/fonts'
import { PRIMARY_COLOR} from '../assets/color'
import I18n from '../i18n'
import Feather from 'react-native-vector-icons/Feather'

const App = (props) => {

    const onSubmit = (index) =>{
        props.tooglePdfList(false)
        props.navigation.navigate('PdfViewer', { data: props.data,index:index })
    }

    const renderAudioItem =(item, index)=> {
        return (
            <TouchableOpacity 
            onPress={()=>onSubmit(index)}  
            style={styles.audioContainer}>
                <Text numberOfLines={1} style={styles.audioLink}>{parseInt(index + 1)}</Text>
                <Feather name='book' size={20} color={PRIMARY_COLOR} style={styles.audioContent} />
                <Text numberOfLines={1} style={styles.audioLink1}>{item.pdfTitle}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <Modal
            isVisible={props.pdfListModal}
            hideModalContentWhileAnimating={true}
            animationIn='zoomIn'
            animationOut='zoomOut'
            hasBackdrop={true}
            backdropColor='black'
            useNativeDriver={true}
            backdropOpacity={.5}
            onBackButtonPress={() => props.tooglePdfList(false)}
            onBackdropPress={() => props.tooglePdfList(false)}
            style={styles.modal}>
            <View style={styles.modalContainer1}>
                <View style={styles.modalHeaderLinks}>
                    <View style={styles.modalFooter1}>
                        <TouchableOpacity style={styles.buttonCancel1}>
                            <Text style={styles.cancel}>BookList</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={props.data}
                        // ItemSeparatorComponent={renderHeader}
                        renderItem={({ item, index }) => renderAudioItem(item, index)}
                        keyExtractor={(item, index) => index.toString()}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                <View style={styles.modalFooter1}>
                    <TouchableOpacity onPress={()=>props.tooglePdfList(false)} style={styles.buttonCancel1}>
                        <Text style={styles.cancel}>{I18n.t("close")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer1: {
        width: '90%',
        borderRadius: 10,
    },
    modalHeaderLinks: {
        backgroundColor: '#fff'
    },
    modalFooter1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#DDDDDD',
        backgroundColor: '#fff'
    },
    buttonCancel1: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
    },
    cancel: {
        fontSize: 14,
        color: PRIMARY_COLOR,
        fontFamily: FONT_SEMIBOLD,
    },
    audioContainer: {
        width: '100%',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center'
    },
    audioContent: {
        marginLeft: 5,
        marginRight: 8
    },
    audioLink:{
        fontFamily:FONT_SEMIBOLD,
        width:20,
    },
    audioLink1:{
        width:'80%',
        fontFamily:FONT_SEMIBOLD
    },
});

export default App;