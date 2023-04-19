import React, {Component} from 'react';
import {
  StyleSheet,
  Clipboard,
  View,
  TouchableOpacity,
  Linking,
  Dimensions,
  FlatList,
  Text,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import I18n from '../../../i18n';
import Images from '../../../assets/images';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_LIGHT,
} from '../../../assets/fonts';
import {PRIMARY_COLOR} from '../../../assets/color';
import {APP_INFO, FOUNDER} from '../../../common/endpoints';
import LinearGradient from 'react-native-linear-gradient';
import Api from '../../../common/api';
import AutoHeightWebView from 'react-native-autoheight-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import email from 'react-native-email';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
// import { PowerTranslator, ProviderTypes, TranslatorConfiguration } from 'react-native-power-translator';
import {HeaderBackButton} from 'react-navigation-stack';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';

const {height, width} = Dimensions.get('screen');

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      gesturesEnabled: false,
      headerLeft: (
        <HeaderBackButton
          tintColor={PRIMARY_COLOR}
          onPress={() => params.this.props.navigation.goBack()}
        />
      ),
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 60,
      },
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      evAppInfo: [],
      appInfo: [],
      founder: [],
      isLoading: true,
      languageId: this.props.locale == 'ar' ? 1 : 2,
    };
    this.share = this.share.bind(this);
    this.getBase64FromUri = this.getBase64FromUri.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchFounder = this.fetchFounder.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
    });
    Api('get', APP_INFO, {appId: 31, language: this.state.languageId}).then(
      response => {
        this.fetchData();
        this.setState({evAppInfo: response.appInfo});
        if (response.appInfo && response.appInfo.applicationIcon) {
          this.getBase64FromUri(response.appInfo.applicationIcon);
        }
        // if (response.appInfo && response.appInfo.applicationIcon) {
        //     this.getBase64FromUri(response.appInfo.applicationIcon)
        // }
      },
    );
  }

  fetchFounder() {
    Api('get', FOUNDER, {appId: 1, language: this.state.languageId}).then(
      response => {
        if (response) {
          this.setState({founder: response.founder[0], isLoading: false});
          // this.props.dispatch(fetchAppInfo(response.appInfo))
        }
      },
    );
  }

  fetchData() {
    Api('get', APP_INFO, {appId: 1, language: this.state.languageId}).then(
      response => {
        if (response) {
          this.setState({appInfo: response.appInfo});
          // this.props.dispatch(fetchAppInfo(response.appInfo))
        }
      },
    );
    this.fetchFounder();
  }

  getBase64FromUri(uri) {
    RNFetchBlob.fetch('GET', uri)
      .then(res => {
        let status = res.info().status;
        if (status == 200) {
          // the conversion is done in native code
          let base64Str = 'data:image/png;base64,' + res.base64();
          this.setState({base64: base64Str});
          // the following conversions are done in js, it's SYNC
          let text = res.text();
          let json = res.json();
        } else {
          // handle other status codes
        }
      })
      // Something went wrong:
      .catch((errorMessage, statusCode) => {});
  }

  handleEmail() {
    const to = ['info@electronicvillage.org']; // string or array of email addresses
    email(to, {
      // Optional additional arguments
      cc: ['tanura@electronicvillage.org'], // string or array of email addresses
      // bcc: 'mee@mee.com', // string or array of email addresses
      subject: 'Alwaraq App Support and Assistance',
      // body: 'Some body right here'
    }).catch(console.error);
  }

  share(isAlwaraq) {
    if (
      (this.state.evAppInfo && !isAlwaraq) ||
      (isAlwaraq && this.state.appInfo)
    ) {
      var evAppInfo = isAlwaraq ? this.state.appInfo : this.state.evAppInfo;
      var appStoreLink = evAppInfo.appStoreLink ? evAppInfo.appStoreLink : '';
      var googleStoreLink = evAppInfo.googleStoreLink
        ? evAppInfo.googleStoreLink
        : '';
      var websitelink = evAppInfo.websitelink ? evAppInfo.websitelink : '';
      var name = evAppInfo.name ? evAppInfo.name : '';
      var footer = 'From Electronic Village... ';
      var subbody = evAppInfo.description;
      subbody = subbody.replace(/<style([\s\S]*?)<\/style>/gi, '');
      subbody = subbody.replace(/<script([\s\S]*?)<\/script>/gi, '');
      subbody = subbody.replace(/<\/div>/gi, '\n');
      subbody = subbody.replace(/<\/li>/gi, '\n');
      subbody = subbody.replace(/<li>/gi, '  *  ');
      subbody = subbody.replace(/<\/ul>/gi, '\n');
      subbody = subbody.replace(/<\/p>/gi, '\n');
      subbody = subbody.replace(/<br\s*[\/]?>/gi, '\n');
      subbody = subbody.replace(/<[^>]+>/gi, '');
      subbody = subbody.replace(/&nbsp;/gi, '');
      subbody =
        name +
        '\n\n' +
        subbody +
        '\n\n' +
        'App Store: ' +
        appStoreLink +
        '\n\n' +
        'Play Store: ' +
        googleStoreLink +
        '\n\n' +
        'Web Site: ' +
        websitelink +
        '\n\n' +
        footer;
      Clipboard.setString(subbody);
      var shareOptions = {
        title: evAppInfo && evAppInfo.name,
        subject: evAppInfo && evAppInfo.name,
        url: isAlwaraq ? '' : this.state.base64,
        message: subbody,
        // message: this.state.data && this.state.data.name + '\n\n' + this.state.data.description + '\n' + 'By Alwaraq Team '
      };
      Share.open(shareOptions);
    }
  }

  render() {
    let appInfo = this.state.appInfo;
    let evAppInfo = this.state.evAppInfo;
    let founder = this.state.founder;
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* <PowerTranslator style={styles.title} text={'A Confucian Revival Began'} /> */}
            <View style={styles.coverImgContainer}>
              <LinearGradient
                style={[styles.card, {height: height / 5 + 60}]}
                colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                <Image
                  style={styles.card}
                  resizeMode="stretch"
                  source={Images.alwaraqBanner}
                />
              </LinearGradient>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.evContainer}>
                <LinearGradient
                  style={[styles.evCard, {marginLeft: 20, borderRadius: 20}]}
                  colors={[
                    'rgba(0,0,0,.2)',
                    'rgba(0,0,0,.2)',
                    'rgba(0,0,0,.2)',
                  ]}>
                  <Image
                    style={styles.evCard}
                    source={
                      appInfo && appInfo.applicationIcon
                        ? {uri: appInfo.applicationIcon}
                        : Images.default
                    }
                  />
                </LinearGradient>
                <View style={{flex: 1, alignItems: 'flex-start'}}>
                  <Text style={styles.nameText}>{appInfo && appInfo.name}</Text>
                  <Text style={styles.tagLineText}>
                    {appInfo && appInfo.tagline}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => this.share(true)}
                  style={styles.shareContainer}>
                  <AntDesign name="sharealt" size={26} color="#000" />
                </TouchableOpacity>
              </View>
              {/* <Text style={styles.contactText}>About {appInfo && appInfo.name}</Text> */}
              {appInfo &&
                appInfo.description &&
                appInfo.description.length != 0 && (
                  <View style={styles.webViewContainer}>
                    <AutoHeightWebView
                      style={styles.autoWebView}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      scrollEnabled={false}
                      // scalesPageToFit={true}
                      onShouldStartLoadWithRequest={event => {
                        if (event.url.slice(0, 4) === 'http') {
                          Linking.openURL(event.url);
                          return false;
                        }
                        return true;
                      }}
                      customStyle={
                        Platform.OS != 'ios'
                          ? `
                                * {
                                }
                                p {
                                  font-size: 20px;
                                }
                              `
                          : `
                              * {
                              }
                              p {
                                font-size: 20px;
                              }
                            `
                      }
                      mixedContentMode="compatibility"
                      source={{html: appInfo && appInfo.description}}
                    />
                  </View>
                )}
              <View style={styles.evContainer1}>
                <LinearGradient
                  style={[styles.evCard, {marginLeft: 20}]}
                  colors={[
                    'rgba(0,0,0,.2)',
                    'rgba(0,0,0,.2)',
                    'rgba(0,0,0,.2)',
                  ]}>
                  <Image
                    style={styles.evCard}
                    source={
                      evAppInfo && evAppInfo.applicationIcon
                        ? {uri: evAppInfo.applicationIcon}
                        : Images.default
                    }
                  />
                </LinearGradient>
                <View style={{flex: 1, alignItems: 'flex-start'}}>
                  <Text style={styles.nameText}>
                    {evAppInfo && evAppInfo.name}
                  </Text>
                  <Text style={styles.tagLineText}>
                    {evAppInfo && evAppInfo.tagline}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => this.share()}
                  style={styles.shareContainer}>
                  <AntDesign name="sharealt" size={26} color="#000" />
                </TouchableOpacity>
              </View>
              <View style={styles.contactContainContainer}>
                <TouchableOpacity
                  onPress={() => this.handleEmail()}
                  style={styles.contactContainer}>
                  <MaterialCommunityIcons
                    name="email"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.contactText2}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://' + evAppInfo.websitelink)
                  }
                  style={styles.contactContainer}>
                  <Entypo name="globe" size={16} color="white" />
                  <Text style={styles.contactText2}>Website</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      Platform.OS == 'ios'
                        ? evAppInfo.appStoreLink
                        : evAppInfo.googleStoreLink,
                    )
                  }
                  style={styles.contactContainer}>
                  <Text style={styles.contactText3}>Download</Text>
                </TouchableOpacity>
              </View>
              {/* <Text style={styles.contactText}>About Us</Text> */}
              {evAppInfo &&
                evAppInfo.description &&
                evAppInfo.description.length != 0 && (
                  <View style={styles.webViewContainer}>
                    <AutoHeightWebView
                      style={styles.autoWebView}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      scrollEnabled={false}
                      // scalesPageToFit={true}
                      onShouldStartLoadWithRequest={event => {
                        if (event.url.slice(0, 4) === 'http') {
                          Linking.openURL(event.url);
                          return false;
                        }
                        return true;
                      }}
                      customStyle={
                        Platform.OS != 'ios'
                          ? `
                                * {
                                }
                                p {
                                  font-size: 20px;
                                }
                              `
                          : `
                              * {
                              }
                              p {
                                font-size: 20px;
                              }
                            `
                      }
                      mixedContentMode="compatibility"
                      source={{html: evAppInfo && evAppInfo.description}}
                    />
                  </View>
                )}
            </View>
            <View style={styles.evContainer1}>
              <LinearGradient
                style={[styles.evCard, {marginLeft: 20}]}
                colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                <Image
                  style={styles.evCard}
                  source={founder?.logo ? {uri: founder?.logo} : Images.default}
                />
              </LinearGradient>
              <View style={{flex: 1, alignItems: 'flex-start'}}>
                <Text style={styles.nameText}>{founder?.name}</Text>
                <Text style={styles.tagLineText}>{''}</Text>
              </View>
            </View>
            <View style={styles.contactContainContainer}>
              <TouchableOpacity
                onPress={() => Linking.openURL(founder?.websitelink)}
                style={styles.contactContainer}>
                <Entypo name="globe" size={16} color="white" />
                <Text style={styles.contactText2}>Website</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    Platform.OS == 'ios'
                      ? founder?.appStoreLink
                      : founder?.googleStoreLink,
                  )
                }
                style={styles.contactContainer}>
                <Text style={styles.contactText3}>Download</Text>
              </TouchableOpacity>
            </View>
            {founder?.description?.length != 0 && (
              <View style={styles.webViewContainer}>
                <AutoHeightWebView
                  style={styles.autoWebView}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  scrollEnabled={false}
                  // scalesPageToFit={true}
                  onShouldStartLoadWithRequest={event => {
                    if (event.url.slice(0, 4) === 'http') {
                      Linking.openURL(event.url);
                      return false;
                    }
                    return true;
                  }}
                  customStyle={
                    Platform.OS != 'ios'
                      ? `
                                * {
                                }
                                p {
                                  font-size: 20px;
                                }
                              `
                      : `
                              * {
                              }
                              p {
                                font-size: 20px;
                              }
                            `
                  }
                  mixedContentMode="compatibility"
                  source={{html: founder?.description}}
                />
              </View>
            )}
            <Text style={styles.contactText4}>Founded by</Text>
            <Text style={styles.contactText5}>
              His Excellency Mohammed Ahmed Khalifa Al Suwaidi
            </Text>
          </ScrollView>
        ) : (
          <BarIndicator
            style={styles.loaderContainer}
            color={PRIMARY_COLOR}
            size={34}
          />
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    locale: state.userLogin.locale,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  coverImgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 5,
  },
  card: {
    height: height / 5 + 60,
    width: width,
    marginBottom: 4,
  },
  evContainer1: {
    flexDirection: 'row',
    height: 80,
    alignItems: 'center',
    backgroundColor: '#fafafa',
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30
  },
  evContainer: {
    height: 100,
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  evCard: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    // marginHorizontal: 10
  },
  contentContainer: {
    // position: 'absolute',
    // top: (height / 4) - 30,
    // left: 0, right: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  nameText: {
    textAlign: 'center',
    fontFamily: FONT_BOLD,
    fontSize: 18,
    marginHorizontal: 10,
  },
  tagLineText: {
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#989898',
    marginHorizontal: 10,
  },
  contactText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  descriptionText: {
    textAlign: 'center',
    fontFamily: FONT_MEDIUM,
    fontSize: 20,
  },
  linkText: {
    textAlign: 'center',
    fontFamily: FONT_REGULAR,
    color: '#0000FF',
    fontSize: 15,
  },
  contactContainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  contactContainer: {
    backgroundColor: '#308de9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 3.5,
    flexDirection: 'row',
  },
  contactText2: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    paddingVertical: 8,
    color: '#fff',
    marginLeft: 10,
  },
  contactText3: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    paddingVertical: 8,
    color: '#fff',
  },
  contactText4: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#989898',
    marginBottom: 5,
    marginTop: 15,
  },
  contactText5: {
    fontFamily: FONT_REGULAR,
    fontSize: 12,
    textAlign: 'center',
  },
  webViewContainer: {},
  autoWebView: {
    width: width - 20,
    marginHorizontal: 10,
  },
  shareContainer: {
    backgroundColor: '#fff',
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    alignSelf: 'flex-end',
    borderRadius: 5,
  },
});
