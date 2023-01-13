import React, { useEffect, useState, useRef, createRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, Image } from "react-native";
import Modal from "react-native-modal"
import { PRIMARY_COLOR, TITLE_COLOR, SECONDARY_COLOR } from '../assets/color'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_LIGHT, FONT_MEDIUM } from '../assets/fonts'
import I18n from '../i18n'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import ModalDropdown from 'react-native-modal-dropdown';
import { ASTRO, HIJIRI_CONVERTER } from '../common/endpoints'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import { ScrollView } from 'react-native-gesture-handler';
import { BarIndicator } from 'react-native-indicators';
import Api from '../common/api'
var hijri = require('hijri-js')

const { height, width } = Dimensions.get('screen')

const MONTH = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HMONTH = ['', 'Muharram', 'Safar', 'Rabi Al-Awwal', 'Rabi Al-Thani', 'Jumada Al-Awwal', 'Jumada Al-Thani', 'Rajab', 'Shaaban', 'Ramadan', 'Shawwal', 'Dhul-Qa`dah', 'Dhul-Hijjah']
const WHITE_COLOR = '#fff'
const PLACEHOLDER = ['', 'DD', 'MM', 'YYYY']
var dd, mm, yy = ''

const App = (props) => {

    const [isHijri, setToogle] = useState(true)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [day, setDay] = useState(null)
    const [month, setMonth] = useState('MM')
    const [year, setYear] = useState(null)
    const [zodiacDate, setZodiac] = useState("")
    const [mansion, setMansion] = useState(null)
    const [isLoading, setLoader] = useState(false)
    const elRefs = React.useRef([]);
    const refs = useRef(null);

    if (elRefs.current.length !== 3) {
        // add or remove refs
        elRefs.current = Array(3).fill().map((_, i) => elRefs.current[i] || createRef());
    }

    const onCalc = () => {
        if ((!isHijri && year > 0 && year < 1501) || isHijri && year > 621 && year < 2077) {
            if (month > 0 && month < 13) {
                if (day > 0 && day < 32) {
                    onConvert()
                }
                else
                    setError('Day Valid Range: 1 to 31')
            }
            else
                setError('Month Valid Range: 1 to 12')
        }
        else
            setError(!isHijri ? 'Year Valid Range: 1 to 1500' : 'Year Valid Range: 622 to 2076')
    }

    const showZodiac = () => {
        if (isHijri) {
            if (day && month && year) {
                let temp = year + '-' + month + '-' + day
                fetchZodiac(temp)
                setZodiac(temp)
            }
            else
                setError('Please fill all fields')
        }
        else {
            fetchZodiac(zodiacDate)
        }
    }

    const fetchZodiac = (date) => {
        setLoader(true)
        let formdata = new FormData()
        formdata.append('astroDate', date)
        formdata.append('language', props.locale == 'ar' ? 1 : 2)
        Api('post', ASTRO, formdata).then((response) => {
            if (response && response.astro && response.astro[0] && response.astro[0].mansion) {
                resetData(true)
                setMansion(response.astro[0].mansion)
            }
            setLoader(false)
        })
    }

    const onConvert = () => {
        let temp_day=day
        if(day<10){
            temp_day='0'+day
        }
        let formData = new FormData()
        formData.append('date', `${year}/${month}/${temp_day}`);
        formData.append('convert_to',isHijri?'hijri':'greg');
        Api('post', HIJIRI_CONVERTER, formData)
            .then((response) => {
                let temp_result=isHijri?HMONTH[parseInt(response.month)]+' '+response.date+' '+response.year:
                MONTH[parseInt(response.month)]+' '+response.date+' '+response.year
                setResult(temp_result)
            })

        const x = hijri.initialize();
        if (!isHijri) {
            let gregorianDate = x.toGregorian(`${day}/${month}/${year}`, '/')
            // setResult(String(gregorianDate).slice(0, 15))
            let t = String(gregorianDate).slice(4, 7)
            let index = MONTH.findIndex(x => x == t.toString())
            let tempDate = String(gregorianDate).slice(11, 15) + '-' + index + '-' + String(gregorianDate).slice(8, 10)
            setZodiac(tempDate)
        }
        else {
            let hijriDate = x.toHijri(`${day}/${month}/${year}`, '/')
            // setResult(hijriDate.day + ' ' + hijriDate.monthName + ' ' + hijriDate.year)
        }
    }

    const onClose = () => {
        resetData(true)
        props.dateCalc(false)
    }

    const resetData = (flag) => {
        elRefs.current[0].current.clear()
        // elRefs.current[1].current.clear()
        elRefs.current[2].current.clear()
        setDay(null)
        setMonth('MM')
        setYear(null)
        setResult(null)
        setError(null)
        setToogle(flag)
        setZodiac(!flag ? null : "")
    }

    const setDate = (expression, Text) => {
        switch (expression) {
            case 1:
                setDay(parseInt(Text))
                setError(null)
                break;
            case 2:
                setMonth(parseInt(Text))
                setError(null)
                break;
            default:
                setYear(parseInt(Text))
                setError(null)
        }
    }

    const Select = (rowData, rowID, highlighted) => {
        if (refs) {
            refs.current.hide()
        }
        let temp_month=rowID
        if(rowID<10){
            temp_month='0'+rowID
        }
        setMonth(temp_month)
        setError(null)
        return (
            <View>
            </View>
        )
    }

    const dropDown = (rowData, rowID, highlighted) => {
        return (
            <View style={styles.modalContainerHeader}>
                <TouchableOpacity style={styles.modalContent} onPress={() => Select(rowData, rowID, highlighted)}>
                    <Text style={styles.monthText}>{rowID} : {rowData}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderMansion = () => (
        <View style={styles.scrollContent}>
            <View style={styles.modalClose}>
                <Text style={{ textAlign: 'center', flex: 1, fontFamily: FONT_SEMIBOLD, fontSize: 20, marginLeft: 30 }}>{mansion.mansionName}</Text>
                <TouchableOpacity onPress={() => setMansion(null)}>
                    <Ionicons name='ios-close-circle-outline' size={30} color='black' />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image style={styles.card} source={{ uri: mansion.mansionPic }} />
                <Text style={styles.desc}>{mansion.mansiondescription}</Text>
            </ScrollView>
        </View>
    );

    const renderPageModal = () => (
        <View style={styles.pageContent}>
            <View style={styles.modalClose}>
                <Text style={{ textAlign: 'center', flex: 1, fontFamily: FONT_SEMIBOLD, fontSize: 20, marginLeft: 30 }}>Converter</Text>
                <TouchableOpacity onPress={() => onClose()}>
                    <Ionicons name='ios-close-circle-outline' size={30} color='black' />
                </TouchableOpacity>
            </View>

            <View style={styles.choiceContainer}>
                <TouchableOpacity
                    style={[styles.calender, { backgroundColor: isHijri ? PRIMARY_COLOR : WHITE_COLOR, borderColor: isHijri ? WHITE_COLOR : PRIMARY_COLOR }]}
                    onPress={() => resetData(true)}>
                    <Text style={[styles.calenderText, { color: !isHijri ? PRIMARY_COLOR : WHITE_COLOR }]}>To Hijri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.calender, { backgroundColor: isHijri ? WHITE_COLOR : PRIMARY_COLOR, borderColor: !isHijri ? WHITE_COLOR : PRIMARY_COLOR }]}
                    onPress={() => resetData(false)}>
                    <Text style={[styles.calenderText, { color: isHijri ? PRIMARY_COLOR : WHITE_COLOR }]}>To Gregorian</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.renderModalContainer}>
                {[1, 2, 3].map((item, i) => {
                    if (item != 2) {
                        return (
                            <View style={styles.textInput}>
                                <TextInput
                                    ref={elRefs.current[i]}
                                    placeholderTextColor={'#9c9c9c'}
                                    bufferDelay={5}
                                    maxLength={item == 3 ? 4 : 2}
                                    placeholder={PLACEHOLDER[item]}
                                    style={styles.gotoText}
                                    onChangeText={(Text) => setDate(item, Text)}
                                    keyboardType={'numeric'}
                                />
                            </View>
                        );
                    }
                    else {
                        let temp = isHijri ? MONTH.slice(1) : HMONTH.slice(1)
                        return (
                            <TouchableOpacity onPress={() => refs.current.show()} style={styles.monthInput}>
                                <Text style={styles.monthContainer}>{month}</Text>
                                <ModalDropdown
                                    ref={refs}
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={true}
                                    options={temp}
                                    dropdownTextStyle={styles.dropdownTextStyle}
                                    dropdownStyle={styles.dropdownStyle}
                                    renderRow={(rowData, rowID, highlighted) => dropDown(rowData, parseInt(rowID) + 1, highlighted)}
                                >
                                    <SimpleLineIcons name='arrow-down' size={18} color='#9c9c9c' />
                                </ModalDropdown>
                            </TouchableOpacity>
                        );
                    }
                })}
            </View>
            {error &&
                <Text style={styles.errorText}>{error}</Text>}
            {result &&
                <Text style={styles.resultText}>{result}</Text>}
            <View style={styles.submitContainer}>
                {zodiacDate !== null &&
                    <TouchableOpacity onPress={() => showZodiac()} style={styles.submitSubContainer}>
                        <Text style={styles.submitText}>Astro</Text>
                    </TouchableOpacity>}
                <TouchableOpacity onPress={() => onCalc()} style={styles.submitSubContainer}>
                    <Text style={styles.submitText}>{I18n.t("OK")}</Text>
                </TouchableOpacity>
            </View>
            {isLoading &&
                <BarIndicator style={styles.indicator} color={PRIMARY_COLOR} size={34} />}
        </View>
    );

    return (
        <View style={styles.container}>
            <Modal
                isVisible={props.dateCalculator}
                hasBackdrop={true}
                backdropOpacity={.02}
                animationIn='zoomIn'
                animationOut='zoomOut'
                useNativeDriver={true}
                onBackButtonPress={() => onClose()}
                onBackdropPress={() => onClose()}
                hideModalContentWhileAnimating={true}
                backdropTransitionOutTiming={0}
                animationInTiming={1000}
                animationOutTiming={1000}
                style={styles.bottomPageModal}
            >
                <View style={styles.modalContain}>
                    {mansion ? renderMansion() : renderPageModal()}
                </View>
            </Modal>
        </View>
    );
}

const mapStateToProps = (state) => {
    return {
        locale: state.userLogin.locale,
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    pageContent: {
        padding: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        justifyContent: 'space-between',
        height: 250
    },
    scrollContent: {
        padding: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#DDDDDD',
        height: height * .6
    },
    modalClose: {
        flexDirection: 'row',
        // alignItems: 'flex-end',
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    choiceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    calender: {
        backgroundColor: 'red',
        height: 40,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 1
    },
    calenderText: {
        fontSize: 14,
        fontFamily: FONT_SEMIBOLD
    },
    errorText: {
        textAlign: 'center',
        fontSize: 12,
        color: 'red',
    },
    resultText: {
        textAlign: 'center',
        fontSize: 14,
        fontFamily: FONT_SEMIBOLD,
        color: TITLE_COLOR,
    },
    renderModalContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
    textInput: {
        width: 70,
        backgroundColor: '#fff'
    },
    dropDownContainer: {
        backgroundColor: '#ededed',
        borderColor: SECONDARY_COLOR,
        marginBottom: 8,
        height: 30,
    },
    dropDownText: {
        // marginTop: 10,
        // marginBottom: 10,
        paddingVertical: 7,
        fontSize: 16,
        fontFamily: FONT_SEMIBOLD,
        color: SECONDARY_COLOR,
        opacity: .9,
        backgroundColor: '#fff'
    },
    gotoText: {
        height: 30,
        marginHorizontal: 5,
        paddingVertical: 0,
        borderWidth: .5,
        borderRadius: 5,
        textAlign: 'center',
        color: '#9c9c9c'
    },
    monthInput: {
        width: 100,
        flexDirection: 'row',
        borderWidth: .5,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        height: 30
    },
    monthContainer: {
        textAlign: 'center',
        width: 60,
        color: '#9c9c9c',
        alignSelf: 'center',
    },
    submitContainer: {
        height: 40,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    submitSubContainer: {
        height: 30,
        width: '20%',
        backgroundColor: PRIMARY_COLOR,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    submitText: {
        textAlign: 'center',
        color: '#fff'
    },
    indicator: {
        position: 'absolute',
        alignSelf: 'center',
        top: 100
    },
    dropdownTextStyle: {
        textAlign: 'center',
        fontSize: 15
    },
    dropdownStyle: {
        borderWidth: 1,
        elevation: .1,
        shadowOffset: { width: 1, height: 1, },
        shadowColor: 'black',
        shadowOpacity: .3
    },
    modalContainerHeader: {
        flex: 1,
        padding: 15
    },
    modalContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    monthText: {
        fontFamily: FONT_SEMIBOLD
    },
    card: {
        height: 200,
        width: '100%',
        backgroundColor: '#ededed',
        marginBottom: 10,
    },
    desc: {
        marginBottom: 10,
        fontFamily: FONT_REGULAR,
        textAlign: 'justify'
    }
});
