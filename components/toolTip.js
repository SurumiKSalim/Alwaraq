import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet,Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { updateWalkThrough, resetFirstLogin } from '../screens/login/actions'
import { store } from './../common/store'
import I18n from '../i18n'

import { TITLE_COLOR, PRIMARY_COLOR, SECONDARY_COLOR } from '../assets/color'
import { FONT_BOLD, FONT_SEMIBOLD, FONT_REGULAR, FONT_MEDIUM, FONT_LIGHT, FONT_EXTRA_LIGHT } from '../assets/fonts'

import { connect } from 'react-redux'



const { height, width } = Dimensions.get('screen')

const Tooltip = ({
    locale,
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrev,
    handleStop,
    currentStep,
    labels,
    isHomePage
}) => (
        <View style={{ flex: 1,backgroundColor:'#fff',marginHorizontal:-20,paddingHorizontal:20,paddingTop:20,marginTop:-20}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignSelf:locale=='ar'? 'flex-end':'flex-start' }}>
            {locale=='ar'&&
                <TouchableOpacity style={{flex:1}} onPress={() => {
                    handleStop()
                }}
                >
                    <AntDesign name="close" color={TITLE_COLOR} size={20} />
                </TouchableOpacity>}
                <Text testID="stepDescription" style={{ fontFamily: FONT_BOLD, fontSize: 18, color: SECONDARY_COLOR,textAlign:'right'}}>{currentStep.name}</Text>
                {locale!='ar'&&
                <TouchableOpacity style={{flex:1,alignItems:'flex-end'}} onPress={() => {
                    handleStop()
                }}
                >
                    <AntDesign name="close" color={TITLE_COLOR} size={20} />
                </TouchableOpacity>}
            </View>
            <View style={styles.tooltipContainer}>
                <View style={{ justifyContent: 'flex-start',alignSelf:locale=='ar'? 'flex-end':'flex-start'}}>
                    <Text testID="stepDescription" style={[styles.tooltipText,{textAlign:locale=='ar'?'right':'left'}]}>{currentStep.text}</Text>
                </View>
            </View>
            <View style={[styles.bottomBar]}>
                {
                    !isLastStep ?
                        // <TouchableOpacity onPress={handleStop} style={{ justifyContent: 'flex-end' }}>
                        //     <Text style={{ color: PRIMARY_COLOR }}>{labels.skip || 'Skip'}</Text>
                        // </TouchableOpacity>
                        null
                        : null
                }
                {
                    !isFirstStep ?
                        <TouchableOpacity onPress={handlePrev} style={{width:width*.2}} >
                            <Text style={styles.next}>{labels.previous || I18n.t("Previous")}</Text>
                        </TouchableOpacity>
                        : null
                }
                {
                    !isLastStep ?
                        <TouchableOpacity onPress={handleNext} style={{ width:isFirstStep?'100%':width*.2, alignItems: 'flex-end'}}>
                            <Text style={styles.next}>{labels.next || I18n.t("Next")}</Text>
                        </TouchableOpacity> :
                        <TouchableOpacity onPress={() => {

                            if (isHomePage) {
                                store.dispatch(updateWalkThrough(true))
                                handleStop()
                            }
                            else {
                                console.log("isShowWalkThrough False", isHomePage)
                                store.dispatch(updateWalkThrough(false))
                                handleStop()
                            }


                        }}
                            style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.next}>{labels.finish || I18n.t("Okay_Got_it")}</Text>
                        </TouchableOpacity>
                }
            </View>
        </View>
    );

    const mapStateToProps = (state) => {
        return {
            locale: state.userLogin.locale,
        }
    }
    export default connect(mapStateToProps)(Tooltip)

const styles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
    },
    tooltipContainer: {
        justifyContent: 'center',
        alignItems:'flex-end',
        height: 90,
        width: '100%',
        marginRight: 10,
    },
    tooltipText: {
        fontFamily: FONT_REGULAR,
        paddingBottom: 25,
        color: 'grey',
    },
    next:
    {
        color: PRIMARY_COLOR,
        fontFamily: FONT_BOLD,
        fontSize: 14,
        flex:1,
        textAlign:'left'
    }

})

