import PropTypes from 'prop-types'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { SafeAreaView } from 'react-navigation'
import { NavigationActions } from 'react-navigation'
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Image, Linking, Clipboard, Dimensions, Platform } from 'react-native'
import Icon5 from 'react-native-vector-icons/FontAwesome5'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Feather from 'react-native-vector-icons/Feather'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { StackNavigator } from 'react-navigation'
import I18n from '../i18n'
import Api from '../common/api'
import { APP_INFO, } from '../common/endpoints'
import Share from 'react-native-share'
import { FONT_SEMIBOLD, FONT_REGULAR, FONT_MEDIUM } from '../assets/fonts'
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../assets/color'
import Images from '../assets/images'
import { resetUser } from '../screens/login/actions'
import { HELP_AND_SUPPORT, ABOUT_US } from '../common/endpoints'

const { height, width } = Dimensions.get('screen')
const TITLE_COLOR = '#535353'
const FOOTER_TITLE_COLOR = '#3B3B3B'

const EV_LINK = 'https://www.Electronicvillage.org'
const EV_APP_LINKS = Platform.OS === 'ios' ? 'https://appstore.electronicvillage.org' : 'https://googlestore.electronicvillage.org';
const SOCIAL_LINKS = [{ link: 'https://www.facebook.com/alwaraq.net', name: 'facebook-square', color: '#4267B2' }, { link: 'https://www.instagram.com/alwaraq.books', name: 'instagram', color: '#cd486b' }, { link: 'https://twitter.com/alwaraq', name: 'twitter-square', color: '#1da1f2' }, { link: 'https://www.Alwaraq.net', name: 'globe', color: '#C53939' }]

class SideMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            languageId: this.props.locale == 'ar' ? 1 : 2,
        }
        this.onSignOut = this.onSignOut.bind(this)
    }

    navigateToScreen = (route) => () => {
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
            this.props.navigation.dispatch(navigateAction);
    }

    navigateToPublisher(){
        this.props.navigation.closeDrawer ()
        setTimeout(() => {
        this.props.navigation.navigate('Publisher')
    }, 5)
    }

    onSignOut() {
        this.props.dispatch(resetUser())
    }

    render() {
        return (
            <Fragment style={{}}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        {/* <TouchableOpacity onPress={() => this.props.navigation.toggleDrawer()}>
                            <SimpleLineIcons name='close' size={25} color={TITLE_COLOR} />
                        </TouchableOpacity> */}
                        <Image source={Images.applogo} style={styles.imgContainer} resizeMode='stretch' />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                        <TouchableOpacity onPress={this.navigateToScreen('Home')} style={styles.content}>
                            <SimpleLineIcons style={styles.iconContainer} name='home' size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Home")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('Libraries')} style={styles.content}>
                            <Feather name='book-open' style={styles.iconContainer} color={TITLE_COLOR} size={22} />
                            <Text style={styles.title}>{I18n.t("Libraries")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('Articles')} style={styles.content}>
                            <Entypo name='news' style={styles.iconContainer} color={TITLE_COLOR} size={22} />
                            <Text style={styles.title}>{I18n.t("News")}</Text>
                            <View style={styles.subContainer}>
                                <Text style={styles.subTitle}>{I18n.t("New")}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('Map')} style={styles.content}>
                            <SimpleLineIcons name='location-pin' style={styles.iconContainer} size={22} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Map")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('TimeLine')} style={styles.content}>
                            <SimpleLineIcons name='clock' style={styles.iconContainer} size={18} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Timeline")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>this.navigateToPublisher()} style={styles.content}>
                            <SimpleLineIcons name='pencil' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Publishers")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('AuthorList')} style={styles.content}>
                            <SimpleLineIcons name='user' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Author")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('Quran')} style={styles.content}>
                            <Feather name='book' style={styles.iconContainer} color={SECONDARY_COLOR} size={20} />
                            <Text style={styles.title}>{I18n.t("Quran")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.navigateToScreen('Downloads')} style={styles.content}>
                            <Ionicons name='ios-download-outline' style={styles.iconContainer} size={22} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Downloads")}</Text>
                        </TouchableOpacity>
                        {this.props.user &&
                        <TouchableOpacity onPress={this.navigateToScreen('Cart')} style={styles.content}>
                            <Ionicons name='cart-outline' style={styles.iconContainer} size={22} color={TITLE_COLOR} />
                            <Text style={styles.title}>Cart</Text>
                        </TouchableOpacity>}

                        <View style={styles.seperator} />

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BookList', { listType: 'free' })} style={styles.content}>
                            <SimpleLineIcons name='book-open' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("FREE_BOOKS")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BookList', { listType: '101books' })} style={styles.content}>
                            <SimpleLineIcons name='book-open' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("New_Set_Books")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BookList', { isJapanese: true })} style={styles.content}>
                            <SimpleLineIcons name='book-open' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Japanese_Books")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('BookList', { authorId: 959, authorName: I18n.t("Shakespeare_Books") })} style={styles.content}>
                            <SimpleLineIcons name='book-open' style={styles.iconContainer} size={20} color={TITLE_COLOR} />
                            <Text style={styles.title}>{I18n.t("Shakespeare_Books")}</Text>
                        </TouchableOpacity>

                        <View style={styles.seperator} />

                        {this.props.user &&
                            <TouchableOpacity onPress={this.navigateToScreen('Purchased')} style={styles.content}>
                                <Feather name='unlock' style={styles.iconContainer} color={SECONDARY_COLOR} size={20} />
                                <Text style={styles.title}>{I18n.t("Purchased")}</Text>
                            </TouchableOpacity>}
                        {this.props.user &&
                            <TouchableOpacity onPress={this.navigateToScreen('Favourites')} style={styles.content}>
                                <Feather name='heart' style={styles.iconContainer} color={SECONDARY_COLOR} size={20} />
                                <Text style={styles.title}>{I18n.t("Favourites")}</Text>
                            </TouchableOpacity>}
                        {!this.props.isPremium &&
                            <TouchableOpacity onPress={this.navigateToScreen('Subscribe')} style={styles.button}>
                                <Icon5 name='crown' size={24} color='white' />
                                <Text style={styles.subscribe}>{I18n.t("Subscribe")}</Text>
                            </TouchableOpacity>}
                        <View style={styles.footerContainer}>
                            <TouchableOpacity onPress={this.props.user ? this.navigateToScreen('ShareEarn') : this.navigateToScreen('Profile')} style={styles.footerContent}>
                                {/* <Fontisto name="share" style={styles.iconStyle}  color={PRIMARY_COLOR} size={20} /> */}
                                <Text style={styles.footerTitle}>{I18n.t("Refer_Earn")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.footerContent} onPress={this.navigateToScreen('AboutUs')}>
                                {/* onPress={ () => Linking.openURL(ABOUT_US+`${this.state.languageId}`)} */}
                                <Text style={styles.footerTitle}>{I18n.t("About_Us")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => Linking.openURL(HELP_AND_SUPPORT + `${this.state.languageId}`)} style={styles.footerContent}>
                                <Text style={styles.footerTitle}>{I18n.t("Help_Support")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('ContactUs')} style={styles.footerContent}>
                                <Text style={styles.footerTitle}>{I18n.t("ContactUs")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.navigateToScreen('Profile')} style={styles.footerContent}>
                                <Text style={styles.footerTitle}>{this.props.user ? I18n.t("Settings") : I18n.t("Login")}</Text>
                            </TouchableOpacity>
                            {this.props.user &&
                                <TouchableOpacity onPress={this.onSignOut} style={styles.footerContent}>
                                    <Text style={styles.footerTitle}>{I18n.t("Sign_Out")}</Text>
                                </TouchableOpacity>}
                        </View>
                        <View style={styles.footer}>
                            <Text style={styles.text1}>{I18n.t("Powered_By")}</Text>
                            <Text onPress={() => Linking.openURL(EV_LINK)} style={styles.text2}>{I18n.t("Electronic_Village")}</Text>
                            {/* <Text style={styles.text4}>Founded by His Excellency</Text>
                            <Text style={styles.text1}>Mohammed Ahmed Khalifa Al Suwaidi</Text>
                            <Text style={styles.text3}>Version  1.0.1</Text> */}
                        </View>
                        <View style={styles.socialMediaContainer}>
                            {SOCIAL_LINKS.map((item, index) => {
                                return (
                                    <FontAwesome onPress={() => Linking.openURL(item.link)} name={item.name} style={styles.iconContainer} color={item.color} size={25} />
                                )
                            })}
                        </View>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Applications')} style={styles.card}>
                            <Text style={styles.linkText}>{I18n.t("Other_Ev_Apps")}</Text>
                        </TouchableOpacity>
                        <View style={{ height: 30, marginBottom: 50, }}>
                            {this.props.isPremium &&
                                <Text style={styles.PremiumText}>Premium Member</Text>}
                        </View>
                    </ScrollView>
                </View>
                <SafeAreaView style={styles.containerContain} />
            </Fragment>
        );
    }
}

SideMenu.propTypes = {
    navigation: PropTypes.object
};

const mapStateToProps = (state) => {
    return {
        user: state.userLogin.user,
        isPremium: state.userLogin.isPremium || state.userLogin.user && state.userLogin.user.isPremium,
        locale: state.userLogin.locale,
    }
}
export default connect(mapStateToProps)(SideMenu)

const styles = StyleSheet.create({
    containerContain: {
        flex: 0,
        backgroundColor: '#1d0c06'
    },
    container: {
        flex: 1,
    },
    header: {
    },
    scroll: {
        padding: 15,
    },
    content: {
        padding: 10,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#EEEEEE',
        alignItems: 'center'
    },
    footerContent: {
        padding: 10,
        flexDirection: 'row',
    },
    title: {
        fontSize: 18,
        fontFamily: FONT_MEDIUM,
        color: TITLE_COLOR,
        marginLeft: 8,
    },
    subTitle: {
        fontSize: 12,
        fontFamily: FONT_REGULAR,
        color: '#fff',
        backgroundColor: '#F65098',
    },
    subContainer: {
        fontSize: 12,
        fontFamily: FONT_REGULAR,
        color: '#fff',
        marginLeft: 8,
        backgroundColor: '#F65098',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        width: '80%',
        backgroundColor: '#F65098',
        borderRadius: 25,
        marginTop: 15,
        // marginBottom:15,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    subscribe: {
        fontFamily: FONT_SEMIBOLD,
        fontSize: 20,
        paddingLeft: 15,
        color: '#FFFFFF'
    },
    footerContainer: {
        marginTop: 20,
        paddingVertical: 15,
        justifyContent: 'flex-end'
    },
    footerTitle: {
        fontFamily: FONT_REGULAR,
        fontSize: 16,
        color: FOOTER_TITLE_COLOR,
        textDecorationLine: 'underline'
    },
    imgContainer: {
        height: height * .18,
        width: '100%',
    },
    PremiumText: {
        textAlign: 'center',
        color: SECONDARY_COLOR,
        fontFamily: FONT_REGULAR
    },
    text1: {
        fontSize: 12,
        color: '#000000',
        opacity: .55,
        fontFamily: FONT_REGULAR
    },
    text2: {
        fontSize: 15,
        color: '#000000',
        fontFamily: FONT_MEDIUM,
        textDecorationLine: 'underline'
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    iconContainer: {
        width: 30,
    },

    //social media
    socialMediaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignContent: 'center',
        width: '80%',
        alignSelf: 'center'
    },
    card: {
        alignSelf: 'center',
        borderRadius: 10,
        backgroundColor: PRIMARY_COLOR,
        marginBottom: 20,
        marginTop: 20
    },
    linkText: {
        padding: 10,
        alignSelf: 'center',
        fontSize: 14,
        color: '#fff',
        fontFamily: FONT_MEDIUM,
    },
    seperator: {
        height: 8,
        marginBottom: 15,
    }
})