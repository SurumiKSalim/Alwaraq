import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Text, Dimensions, Image, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import { FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD } from '../assets/fonts'
import { WHITE_COLOR, TEXT_BLACK_COLOR, INPUT_COLOR, INPUT_BACKGROUND_COLOR, PRIMARY_COLOR } from '../assets/color'
import Images from '../assets/images'
import { Placeholder, PlaceholderMedia, PlaceholderLine, Shine } from "rn-placeholder";
import { connect } from 'react-redux'
import DynamicText, { DynamicView, IS_IPAD } from '../common/dynamicviews'
import { CartOptions } from '../components/CartComponents'
import ErrorMsg from './ErrorMsg'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"

const { height, width } = Dimensions.get('screen')

const App = ({ data, isLoading, locale, scrollEnable, action, addItem, counter,onDelete,navigation }) => {

    const [count, setCount] = useState(0)

    const placeHolder = () => {
        return (
            <Placeholder
                Animation={Shine}
                style={{ flexDirection: 'row' }}
            >
                <PlaceholderLine
                    height={156}
                    style={[styles.item, { backgroundColor: INPUT_BACKGROUND_COLOR }]}
                />
                <PlaceholderLine
                    height={156}
                    style={[styles.item, { backgroundColor: INPUT_BACKGROUND_COLOR }]}
                />
            </Placeholder>
        )
    }

    useEffect(() => {
        setCount(counter)
    }, [counter])

    // const addItem = (index, action) => {
    //     let oldObject = data[index]
    //     let quantity = oldObject.quantity ? oldObject.quantity : 0
    //     if (action == 'add') {
    //         quantity++
    //     }
    //     else {
    //         quantity--
    //     }
    //     let newObject = { ...oldObject, quantity: quantity }
    //     console.log('item', newObject)
    // }


    const renderItem = ({ item, index }) => {
        let picture = item.productPicture
        let id = item.articleId
        return (
            <DynamicView
                // touchable
                // onPress={() => navigation.navigate(action, { id: id, title: title, item: item })}
                style={IS_IPAD ? [styles.ipadItem, { marginRight: 10 }] : styles.item}>
                <LinearGradient
                    style={styles.card}
                    colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}
                >
                    <Image
                        style={styles.card}
                        source={picture ?
                            { uri: picture } :
                            Images.default}
                    />
                </LinearGradient>
                <View
                    style={[styles.txtContainer, { paddingLeft: locale == 'ar' ? 0 : 18, paddingRight: locale == 'ar' ? 18 : 0 }]}>
                    <DynamicText
                        numberOfLines={2}
                        style={styles.title}>
                        {item?.productName}
                    </DynamicText>
                    <DynamicText
                        style={styles.price}>
                        ${item?.price}
                    </DynamicText>
                </View>
                <View style={{ justifyContent:'space-around',alignItems:'flex-end' }}>
                    <MaterialIcons
                        name='delete'
                        onPress={()=>onDelete(index)}
                        color={PRIMARY_COLOR}
                        size={20}
                    />
                    <CartOptions
                        addItem={addItem}
                        index={index}
                    >{item.quantity ? item.quantity : 0}
                    </CartOptions>
                </View>
            </DynamicView>
        );
    }

    return (
        data && data.length > 0 ?
            <ScrollView
                scrollEnable={false}>
                <FlatList
                    data={data}
                    scrollEnabled={scrollEnable}
                    extraData={data}
                    numColumns={IS_IPAD ? 2 : 1}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            </ScrollView> :
            <View>
                {isLoading && placeHolder()}
                {!isLoading &&
                    <ErrorMsg
                        height={156}
                        msg={"Cart is Empty"}
                    />
                }
            </View>
    );
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
    }
}

const styles = StyleSheet.create({
    card: {
        width: 80,
        height: 80,
        borderRadius: 7
    },
    ipadItem: {
        flexDirection: 'row',
        marginBottom: 18,
        backgroundColor: WHITE_COLOR,
        padding: 15,
        borderRadius: 15,
        width: (width - 30) / 2
    },
    item: {
        flexDirection: 'row',
        marginBottom: 18,
        backgroundColor: WHITE_COLOR,
        padding: 15,
        borderRadius: 15,
    },
    txtContainer: {
        flex: 1,
        // paddingHorizontal: 18,
        justifyContent: 'space-around'
    },
    title: {
        fontSize: 14,
        fontFamily: FONT_MEDIUM,
        color: TEXT_BLACK_COLOR
    },
    description: {
        fontSize: 12,
        fontFamily: FONT_REGULAR,
        color: INPUT_COLOR
    },
    price: {
        fontSize: 16,
        fontFamily: FONT_MEDIUM,
        color: TEXT_BLACK_COLOR
    },
});

export default connect(mapStateToProps)(App)