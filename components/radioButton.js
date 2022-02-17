import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../assets/color'
import { FONT_BOLD, FONT_SEMIBOLD, FONT_REGULAR, FONT_MEDIUM, FONT_LIGHT, FONT_EXTRA_LIGHT } from '../assets/fonts'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons'

export default class RadioButton extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: this.props.locale,
        }
        this.onClick = this.onClick.bind(this)
    }

    onClick(item) {
        this.setState({ value: item }, () => this.props.lang(item))

    }
    
    render() {
        const { options } = this.props;
        const { value } = this.state;

        return (
            <View>
                {options.map(item => {
                    console.log('value',value)
                    return (
                        <TouchableOpacity key={item.key} style={styles.buttonContainer} onPress={() => this.onClick(item.key)} >
                            <Text style={styles.txt}>{item.text}</Text>
                            <MaterialIcons name={value !== item.key? 'circle-outline' : 'circle-slice-8'} color={value !== item.key? '#d9d9d9' : PRIMARY_COLOR} size={24} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginHorizontal: 5
    },
    txt: {
        fontFamily: FONT_MEDIUM,
        fontSize: 15,
        color: TITLE_COLOR
    },
    circle: {
        height: 20,
        width: 20,
        borderWidth: 1.5,
        borderColor:'#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: PRIMARY_COLOR,
    },
});