import React from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD } from '../assets/fonts'
import { PRIMARY_COLOR, INPUT_COLOR, TEXT_BLACK_COLOR } from '../assets/color'
import { connect } from 'react-redux'

const { height, width } = Dimensions.get('screen')
export const IS_IPAD = width > 800 ? true : false

export const DynamicView = connect(
    state => ({
        locale: state.userLogin.locale,
    })
)(({ children, style, locale, touchable, onPress }) => {
    if (touchable) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[style, { flexDirection: locale == 'ar' ? 'row-reverse' : 'row' }]}>
                {children}
            </TouchableOpacity>
        )
    }
    else {
        return (
            <View
                style={[style, { flexDirection: locale == 'ar' ? 'row-reverse' : 'row' }]}>
                {children}
            </View>
        )
    }
})

const DynamicText = ({ children, numberOfLines, style, locale, ellipsizeMode, textAlign }) => (
    <Text
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        style={[style, { textAlign: locale == 'ar' ? 'right' :textAlign?textAlign: 'justify' }]}>
        {children}
    </Text>
);

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(DynamicText)

