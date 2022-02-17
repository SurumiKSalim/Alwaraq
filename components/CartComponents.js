import React from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, } from "react-native";
import { FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD } from '../assets/fonts'
import { PRIMARY_COLOR, WHITE_COLOR, TITLE_COLOR, TEXT_BLACK_COLOR } from '../assets/color'

export const CartOptions = ({ addItem, index, children }) => (
    <View style={styles.cartOptions}>
        <TouchableOpacity
            onPress={() => addItem(index, 'sub')}
            style={[styles.subButton, { backgroundColor: '#FA64004D' }]}>
            <Text style={styles.negText}>
                -
            </Text>
        </TouchableOpacity>
        <Text style={styles.countTxt}>
            {children}
        </Text>
        <TouchableOpacity
            onPress={() => addItem(index, 'add')}
            style={styles.subButton}>
            <Text style={styles.posText}>
                +
            </Text>
        </TouchableOpacity>
    </View>
)

export const CartComponent = ({ children, addItem, addToCart }) => (
    <View style={styles.cartContainer}>
        <CartOptions
            addItem={addItem}>
            {children}
        </CartOptions>
        <TouchableOpacity
        onPress={() => addToCart()}
        style={styles.button}>
            <Text style={styles.submit}>
                Add to Cart
            </Text>
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    cartOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    subButton: {
        height: 30,
        width: 30,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    countTxt: {
        fontFamily: FONT_REGULAR,
        fontSize: 14,
        width: 20,
        color: TEXT_BLACK_COLOR,
        textAlign: 'center',
        marginHorizontal: 10
    },
    negText: {
        fontFamily: FONT_REGULAR,
        fontSize: 20,
        color: PRIMARY_COLOR,
        textAlign: 'center',
    },
    posText: {
        fontFamily: FONT_REGULAR,
        fontSize: 20,
        color: WHITE_COLOR,
        textAlign: 'center',
    },
    cartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 15
    },
    button: {
        height: 50,
        paddingHorizontal: 25,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    submit: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 14,
        color: TITLE_COLOR,
        color: '#FFFFFF',
        textAlign: 'center',
    },
});