import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Entypo from "react-native-vector-icons/Entypo"
import { PRIMARY_COLOR, TEXT_BLACK_COLOR, BLACK_COLOR, BG_GRAY_COLOR, WHITE_COLOR, TEXT_GRAY_COLOR } from '../assets/color'
import { FONT_REGULAR, FONT_SEMIBOLD } from '../assets/fonts'

const App = ({ height, msg }) => {

    return (
        <View style={[styles.container, { height: height }]}>
            <Entypo
                onPress={() => navigation.toggleDrawer()}
                name='emoji-sad'
                color={TEXT_BLACK_COLOR}
                size={50} />
            <Text style={styles.error}>{msg}</Text>
        </View>
    )
}

export default App

const styles = StyleSheet.create({
    container: {
        backgroundColor: BG_GRAY_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth:2,
        borderColor:TEXT_GRAY_COLOR,
        borderRadius:10
    },
    error:{
        marginTop:16,
        color:TEXT_BLACK_COLOR,
        fontSize:16,
        fontFamily:FONT_REGULAR
    }
});
