import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { PRIMARY_COLOR } from '../../../assets/color'
import Images from '../../../assets/images'
import { connect } from 'react-redux'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import I18n from '../../../i18n'
import Api from '../../../common/api'
import { BUY_NOW } from '../../../common/endpoints'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import AntDesign from "react-native-vector-icons/AntDesign"
import { WebView } from 'react-native-webview';
import Modal from 'react-native-modal'
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import cancel from '../../../assets/animation/cancel.json';
import anim from '../../../assets/animation/success.json';
import Animation from 'lottie-react-native';

const { height, width } = Dimensions.get('screen')
// const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
//     const paddingToBottom = 100;
//     return layoutMeasurement.height + contentOffset.y >=
//         contentSize.height - paddingToBottom;
// };

class App extends Component {
    // static navigationOptions = ({ navigation }) => {
    //     const { params = {} } = navigation.state;
    //     return {
    //         header:null
    //     }
    // }

    constructor(props) {
        super(props)
        this.state = {
            faildModel: false,
            declineModel: false,
            successModel: false,
            orderId: this.props.navigation.getParam('orderId')
        }
        // this.orderInfo = this.orderInfo.bind(this)
        this.goBack = this.goBack.bind(this)
        // this.onLoad = this.onLoad.bind(this)
    }

    // orderInfo(transactionStatusId) {
    //     let formData = new FormData()
    //     formData.append('action', 'orderStatusUpdate');
    //     formData.append('orderId', this.state.orderId);
    //     formData.append('transactionStatusId', transactionStatusId);
    //     Api('post', BUY_NOW, formData)
    //         .then((response) => {
    //             console.log('ordddddddddeeeeeeeeeeeerrrrrrrrrriinfo', response)
    //             if (response.statusCode === 200) {
    //                 console.log('order infof')
    //             }
    //         }
    //         )
    // }

    goBack(action) {
        this.setState({ faildModel: false, declineModel: false, successModel: false })
        // this.props.navigation.navigate('Detailbuy')
        if (action == 1) {
            this.props.navigation.pop(2)
        }
        else{
            this.props.navigation.goBack()}
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.fullFlux}>
                    <WebView
                        showsVerticalScrollIndicator={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="compatibility"
                        style={styles.fullFlux}
                        onShouldStartLoadWithRequest={event => {
                            if (event.url.slice(0, 20) === 'https://alwaraq.net/') {
                                // Linking.openURL(event.url)
                                if (event.url.includes('transactionStatus=0')) {
                                    this.setState({ payModel: false })
                                    setTimeout(() => {
                                        this.setState({
                                            faildModel: true
                                        })
                                        this.animation.play();
                                    }, 500)
                                    // setTimeout(() => {
                                    //     this.goBack()
                                    //     // this.setState({
                                    //     //     faildModel: false
                                    //     // })
                                    // }, 3000)
                                    // this.orderInfo(0)
                                }
                                else if (event.url.includes('transactionStatus=1')) {
                                    this.setState({ payModel: false, })
                                    setTimeout(() => {
                                        this.setState({
                                            successModel: true
                                        })
                                        this.animation.play();
                                    }, 500)
                                    // setTimeout(() => {
                                    //     this.goBack(1)
                                    //     // this.setState({
                                    //     //     successModel: false
                                    //     // })
                                    // }, 3000)
                                    // this.orderInfo(1)
                                } else if (event.url.includes('transactionStatus=-1')) {
                                    this.setState({ payModel: false, })
                                    setTimeout(() => {
                                        this.setState({
                                            declineModel: true
                                        })
                                    }, 500)
                                    // setTimeout(() => {
                                    //     this.goBack()
                                    //     // this.setState({
                                    //     //     declineModel: false
                                    //     // })
                                    // }, 3000)
                                    // this.orderInfo(-1)
                                }
                                return false
                            }
                            return true
                        }}
                        source={{ uri: this.props.navigation.getParam('secureUrlPayment') }} />
                </View>

                <Modal
                    isVisible={this.state.faildModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <Animation
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                style={{
                                    width: 80,
                                    height: 80,
                                }}
                                loop={true}
                                source={cancel}
                            />
                            <Text style={styles.modalTextSuccess}>{I18n.t("Payment_canceled")}</Text>
                            <Text onPress={() => this.goBack()} style={styles.goBack}>{I18n.t("Ok")}</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>

                <Modal
                    isVisible={this.state.successModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <Animation
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                style={{
                                    width: 80,
                                    height: 80,
                                }}
                                loop={true}
                                source={anim}
                            />
                            <Text style={styles.modalTextSuccess}>{I18n.t("Payment_success")}</Text>
                            <Text onPress={() => this.goBack(1)} style={styles.goBack}>{I18n.t("Ok")}</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
                <Modal
                    isVisible={this.state.declineModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <IconMaterial name='error-outline' size={80} color='red' />
                            <Text style={styles.modalTextFaild}>{I18n.t("Payment_Declined")}</Text>
                            <Text onPress={() => this.goBack()} style={styles.goBack}>{I18n.t("Ok")}</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
    }
}

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullFlux: {
        flex: 1,
    },
    fullModel: {
        height: height,
        width: width,
        marginLeft: -20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalTextSuccess: {
        fontSize: 20,
        fontFamily: FONT_SEMIBOLD,
        color: 'green',
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 25,
        paddingBottom: 10
    },
    goBack: {
        marginTop: 10,
        backgroundColor: PRIMARY_COLOR,
        fontFamily: FONT_REGULAR,
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: '#fff'
    },
    containerModal: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center'
    },
})


