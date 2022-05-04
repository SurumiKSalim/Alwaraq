import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Text,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {connect} from 'react-redux';
import Slider from '@react-native-community/slider';
import I18n from '../../../i18n';
import Images from '../../../assets/images';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {PRIMARY_COLOR} from '../../../assets/color';
import {fetchQuranContent} from '../actions';
import Api from '../../../common/api';
import {QURAN} from '../../../common/endpoints';
import {fetchSearchBookPage} from '../../searchPage/actions';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Modal from 'react-native-modal';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {WebView} from 'react-native-webview';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Icon from 'react-native-vector-icons/Ionicons';
import {HeaderBackButton} from 'react-navigation-stack';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  UIActivityIndicator,
  DotIndicator,
  MaterialIndicator,
  BallIndicator,
  BarIndicator,
} from 'react-native-indicators';
import AudioPlay from '../../../components/audioPlay';
import AlertModal from '../../../components/AlertModal';

const {height, width} = Dimensions.get('screen');

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: (
        <HeaderBackButton
          tintColor={PRIMARY_COLOR}
          onPress={() => params.this.props.navigation.goBack()}
        />
      ),
      headerTitle: (
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={Images.headerName}
            resizeMode="contain"
          />
        </View>
      ),
      headerTitleStyle: {},
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 60,
      },
      headerRight: params.audios?.length > 0 && (
        <TouchableOpacity
          onPress={() => params.this.audioPlay()}
          style={styles.headerRightContainer}>
          {params.sound ? (
            <FontAwesome5 name="volume-mute" size={24} color={PRIMARY_COLOR} />
          ) : (
            <FontAwesome5 name="volume-up" size={24} color={PRIMARY_COLOR} />
          )}
        </TouchableOpacity>
      ),
    };
  };
  constructor(props) {
    super(props);
    let fromSearch = this.props.navigation.getParam('fromSearch', null);
    let totalpages = this.props.navigation.getParam('totalpages', null);
    this.state = {
      quran: '',
      page: fromSearch ? this.props.navigation.getParam('page') : 1,
      sura: 1,
      totalpages: fromSearch ? totalpages : 360,
      visibleModal: false,
      fromSearch: fromSearch,
      visible: false,
      loading: false,
      audios: [],
      suraTitle: null,
      suraDesc: null,
      isVisible: false,
    };
    this.loadQuran = this.loadQuran.bind(this);
    this.onSwipeLeft = this.onSwipeLeft.bind(this);
    this.onSwipeRight = this.onSwipeRight.bind(this);
    this.pageLeft = this.pageLeft.bind(this);
    this.pageRight = this.pageRight.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onClose = this.onClose.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.leftMost = this.leftMost.bind(this);
    this.rightMost = this.rightMost.bind(this);
    this.reset = this.reset.bind(this);
  }

  loadQuran(sura, page) {
    console.log('hahaah', page);
    this.setState({
      loading: true,
      visibleModal: false,
      suraTitle: null,
      suraDesc: null,
    });
    Api('get', QURAN, {
      pageId: page ? page : sura ? 0 : this.state.page,
      suraId: sura ? sura : 1,
      language: this.props.locale == 'ar' ? 1 : 2,
    }).then(response => {
      if (response) {
        this.setState({
          quran: response.page,
          loading: false,
          sura: response.suraId,
          audios: response.audios,
          suraDesc: response.suraDesc,
          suraTitle: response.suraTitle,
        });
        this.props.navigation.setParams({
          audios: response.audios,
          sound: false,
        });
        if (sura) {
          this.setState({page: response.pageId});
        }
      } else {
        this.setState({loading: false});
        console.log('QURAN_FETCHING_FAILED');
      }
    });
  }

  audioPlay(close) {
    this.setState({
      audioModal: close ? false : true,
      audioPlayer: false,
      audioLink: false,
      isPlayAll: false,
    });
    this.props.navigation.setParams({
      isAudioAvailable: this.state.isAudioAvailable,
      sound: false,
    });
  }

  playAudio(item, isPlayAll) {
    this.setState({
      audioModal: false,
      audioLink: item,
      audioPlayer: true,
      isPlayAll: isPlayAll,
    });
    this.props.navigation.setParams({
      sound: true,
    });
  }

  renderAudioItem(item, index) {
    return (
      <TouchableOpacity
        onPress={() => this.playAudio(item?.link)}
        style={styles.audioContainer}>
        <AntDesign
          name="sound"
          size={20}
          color={PRIMARY_COLOR}
          style={styles.audioContent}
        />
        <Text numberOfLines={1} style={styles.audioLink}>
          {item?.title ? item.title : 'audio part ' + parseInt(index + 1)}
        </Text>
      </TouchableOpacity>
    );
  }

  onSwipeLeft(gestureState) {
    this.pageRight();
  }

  onSwipeRight(gestureState) {
    this.pageLeft();
  }

  pageRight() {
    let page = parseInt(this.state.page) - 1;
    if (parseInt(this.state.page) > 1) {
      this.setState({page: parseInt(this.state.page) - 1});
    }
    if (this.state.fromSearch && page > 0) {
      this.props.dispatch(
        fetchSearchBookPage(
          this.props.navigation.getParam('item'),
          this.props.navigation,
          page,
          1,
        ),
      );
    }
  }

  pageLeft() {
    let page = parseInt(this.state.page) + 1;
    if (parseInt(this.state.page) < parseInt(this.state.totalpages)) {
      this.setState({page: parseInt(this.state.page) + 1});
    }
    if (this.state.fromSearch && page <= this.state.totalpages) {
      this.props.dispatch(
        fetchSearchBookPage(
          this.props.navigation.getParam('item'),
          this.props.navigation,
          page,
          1,
        ),
      );
    }
  }

  leftMost() {
    if (!this.state.fromSearch) {
      this.loadQuran(parseInt(this.state.sura) + 1);
    } else {
      this.setState({
        page: this.state.totalpages,
        pageIndex: this.state.totalpages - 1,
      });
      if (this.state.fromSearch) {
        this.props.dispatch(
          fetchSearchBookPage(
            this.props.navigation.getParam('item'),
            this.props.navigation,
            this.state.totalpages,
            1,
          ),
        );
      }
    }
  }

  async reset(pageId) {
   await this.setState({fromSearch: false, totalpages: 360,page:pageId});
    this.loadQuran(null, pageId);
  }

  rightMost() {
    if (!this.state.fromSearch) {
      this.loadQuran(parseInt(this.state.sura) - 1);
    } else {
      this.setState({page: 1, pageIndex: 0});
      if (this.state.fromSearch) {
        this.props.dispatch(
          fetchSearchBookPage(
            this.props.navigation.getParam('item'),
            this.props.navigation,
            1,
            1,
          ),
        );
      }
    }
  }

  onClose() {
    this.setState({visibleModal: null});
  }

  goToPage() {
    if (this.state.Text > 0 && this.state.Text <= 360) {
      this.setState({
        page: this.state.Text,
        visible: false,
        invaliedPage: false,
      });
    } else {
      this.setState({invaliedPage: true});
    }
  }

  renderItem({item}) {
    return (
      <View>
        <View style={styles.renderItemContainer}>
          {/* <TouchableOpacity style={styles.renderItemSubContainer} onPress={() => this.setState({ sura: item.suwarid, page: 0, visibleModal: false })}> */}
          <TouchableOpacity
            style={styles.renderItemSubContainer}
            onPress={() => this.loadQuran(item.suraId)}>
            {!this.props.suraInfoLoading ? (
              <Text style={styles.nameText}>
                {parseInt(item.suraId)}:{item.suraTitle}
              </Text>
            ) : (
              <View style={styles.dotIndicatorContainer}>
                <DotIndicator
                  color={PRIMARY_COLOR}
                  size={10}
                  style={styles.indicator}
                />
              </View>
            )}
            <FontAwesome5 name="readme" color={PRIMARY_COLOR} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderModal = () => (
    <View style={styles.content}>
      <View style={[styles.modalClose, {paddingHorizontal: 15}]}>
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => this.onClose()}>
          <Icon name="md-close-circle" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
      <View style={styles.flatlistContainer}>
        <FlatList
          style={styles.flatlistStyle}
          showsVerticalScrollIndicator={false}
          data={this.props.QuranContent}
          renderItem={this.renderItem}
          extraData={this.state}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );

  renderPageModal = () => (
    <View style={styles.pageContent}>
      <View style={styles.modalClose}>
        <TouchableOpacity
          onPress={() => this.setState({visible: null, invaliedPage: false})}>
          <Icon name="ios-close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.renderModalContainer}>
        <Text>{I18n.t('Go_to_Page')}</Text>
        <View style={styles.textInput}>
          <TextInput
            ref={ref => (this.textInputRef = ref)}
            placeholderTextColor={'#9c9c9c'}
            bufferDelay={5}
            style={styles.gotoText}
            onChangeText={Text => this.setState({Text: Text})}
            keyboardType={'numeric'}
          />
        </View>
      </View>
      {this.state.invaliedPage && (
        <Text style={styles.invaliedPage}>Enter a valied page</Text>
      )}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          onPress={() => this.goToPage()}
          style={styles.submitSubContainer}>
          <Text style={styles.submitText}>{I18n.t('OK')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
    });
    if (!this.state.fromSearch) {
      this.loadQuran();
    }
    this.props.dispatch(fetchQuranContent());
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.page != this.state.page) {
      if (!this.state.fromSearch) {
        this.loadQuran();
      } else {
        this.props.dispatch(
          fetchSearchBookPage(
            this.props.navigation.getParam('item'),
            this.props.navigation,
            this.state.page,
            1,
          ),
        );
      }
    }
  }

  render() {
    var response = this.props.navigation.getParam('response', null);
    var base64 = require('base-64');
    var utf8 = require('utf8');
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    return (
      <GestureRecognizer
        onSwipeLeft={this.onSwipeLeft}
        onSwipeRight={this.onSwipeRight}
        config={config}
        style={styles.gestureContainer}>
        <SafeAreaView style={styles.container}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
              ]}>
              {I18n.t('Quran')}
            </Text>
            <View
              style={[
                styles.emptyContainer,
                {
                  alignSelf:
                    this.props.locale == 'ar' ? 'flex-end' : 'flex-start',
                },
              ]}
            />
          </View>
          {this.state.suraTitle && this.state.suraDesc && (
            <View
              style={[
                styles.subHeader,
                {
                  flexDirection:
                    this.props.locale == 'ar' ? 'row-reverse' : 'row',
                },
              ]}>
              <Text
                style={[
                  styles.subTitle,
                  {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
                ]}>
                {this.state.suraTitle}
              </Text>
              <AntDesign
                style={{marginHorizontal: 5}}
                name="infocirlceo"
                onPress={() => this.setState({isVisible: true})}
                size={16}
                color={PRIMARY_COLOR}
              />
            </View>
          )}
          {!this.state.loading ? (
            <WebView
              showsVerticalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onError={this.onError}
              onLoadStart={this.onLoadStart}
              onLoadEnd={this.onLoadEnd}
              mixedContentMode="compatibility"
              style={styles.modalSelfStyle}
              showsHorizontalScrollIndicator={false}
              source={{
                html: this.state.fromSearch
                  ? response && utf8.decode(base64.decode(response))
                  : this.state.quran,
              }}
            />
          ) : (
            <MaterialIndicator
              color={PRIMARY_COLOR}
              size={20}
              style={styles.signinIcon}
            />
          )}
          {this.state.audioPlayer && (
            <View style={styles.videoContainer}>
              <AudioPlay
                navigation={this.props.navigation}
                isPlayAll={this.state.isPlayAll}
                videoLink={this.state.audioLink}
                audioArray={this.state.bookAudios}
              />
              <AntDesign
                style={styles.audioClose}
                name="closecircle"
                onPress={() => this.audioPlay(true)}
                size={24}
                color={PRIMARY_COLOR}
              />
            </View>
          )}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderContain}>
              <Slider
                style={styles.sliderStyle}
                minimumValue={1}
                maximumValue={parseInt(this.state.totalpages)}
                value={parseInt(this.state.page)}
                minimumTrackTintColor={PRIMARY_COLOR}
                maximumTrackTintColor="#000000"
                onSlidingComplete={value =>
                  this.setState({
                    page: Math.round(value),
                  })
                }
              />
              <View style={styles.bookTreeContainer}>
                <TouchableOpacity
                  onPress={() => this.setState({visibleModal: true})}>
                  <Fontisto name="sourcetree" color={PRIMARY_COLOR} size={30} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity onPress={this.leftMost}>
                <MaterialCommunityIcons
                  name="skip-previous-circle"
                  color={PRIMARY_COLOR}
                  size={36}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.pageLeft}>
                <MaterialCommunityIcons
                  name="arrow-left-bold-circle"
                  color={PRIMARY_COLOR}
                  size={36}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({visible: true})}
                style={styles.pageContainer}>
                <Text>
                  {this.state.page}/{this.state.totalpages}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.pageRight}>
                <MaterialCommunityIcons
                  name="arrow-right-bold-circle"
                  color={PRIMARY_COLOR}
                  size={36}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={this.rightMost}>
                <MaterialCommunityIcons
                  name="skip-next-circle"
                  color={PRIMARY_COLOR}
                  size={36}
                />
              </TouchableOpacity>
              {this.state.fromSearch&&
              <TouchableOpacity
                onPress={() =>
                  this.reset(this.props.navigation.getParam('pageId'))
                }>
                <Fontisto
                  name="navigate"
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </TouchableOpacity>}
            </View>
          </View>
          <Modal
            isVisible={this.state.visibleModal}
            hasBackdrop={true}
            backdropOpacity={0.02}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            animationOutTiming={1000}
            style={styles.bottomModal}>
            <View style={styles.modalContainer}>{this.renderModal()}</View>
          </Modal>
          <Modal
            isVisible={this.state.visible}
            hasBackdrop={true}
            backdropOpacity={0.02}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            animationOutTiming={1000}
            style={styles.bottomPageModal}>
            <View style={styles.modalContain}>{this.renderPageModal()}</View>
          </Modal>
          <Modal
            isVisible={this.state.audioModal}
            hideModalContentWhileAnimating={true}
            animationIn="zoomIn"
            animationOut="zoomOut"
            hasBackdrop={true}
            backdropColor="black"
            useNativeDriver={true}
            backdropOpacity={0.5}
            onBackButtonPress={() => this.setState({audioModal: false})}
            onBackdropPress={() => this.setState({audioModal: false})}
            style={styles.modal}>
            <View style={styles.modalContainer1}>
              {this.state.audios?.length == 0 && (
                <Text style={styles.audioInfoText}>No Audios Found</Text>
              )}
              <ScrollView style={styles.modalHeaderLinks}>
                {this.state.audios?.length > 1 && (
                  <TouchableOpacity
                    onPress={() =>
                      this.playAudio(this.state.audios[0]?.audioLink, true)
                    }
                    style={styles.audioContainer}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.audioLink,
                        {color: PRIMARY_COLOR, textAlign: 'center'},
                      ]}>
                      PLAY ALL
                    </Text>
                  </TouchableOpacity>
                )}
                <FlatList
                  data={this.state.audios}
                  ItemSeparatorComponent={this.renderHeader}
                  renderItem={({item, index}) =>
                    this.renderAudioItem(item, index)
                  }
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                />
              </ScrollView>
              <View style={styles.modalFooter1}>
                <TouchableOpacity
                  style={styles.buttonCancel1}
                  onPress={() => this.setState({audioModal: false})}>
                  <Text style={styles.cancel}>{I18n.t('close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <AlertModal
            isVisible={this.state.isVisible}
            onSubmit={() => this.setState({isVisible: false})}
            header={this.state.suraTitle}
            butttonlabel={I18n.t('Ok')}
            title={this.state.suraDesc}
          />
        </SafeAreaView>
      </GestureRecognizer>
    );
  }
}

const mapStateToProps = state => {
  return {
    QuranContent: state.bookpage.QuranContent,
    suraInfoLoading: state.bookpage.suraInfoLoading,
    locale: state.userLogin.locale,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    margin: 10,
  },
  gestureContainer: {
    flex: 1,
  },
  pageContainer: {
    borderWidth: 0.5,
    padding: 5,
    borderRadius: 5,
    borderColor: PRIMARY_COLOR,
  },
  bottomModal: {
    margin: 0,
    justifyContent: 'flex-end',
    height: 200,
  },
  content: {
    padding: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalClose: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  renderItemContainer: {
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 0.1,
    padding: 15,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    backgroundColor: '#FFF',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  renderModalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  renderItemSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  KeyboardViewContainer: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    // height: '40%',
    // backgroundColor: 'red',
    // marginHorizontal: -20,
    // marginBottom: -25,
    // justifyContent: 'flex-end'
  },
  modalSelfStyle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#bcbcbc',
  },
  modalContain: {
    height: height > 750 ? '20%' : '25%',
    width: '95%',
  },
  textInput: {
    width: '20%',
  },
  pageContent: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    height: 180,
  },
  gotoText: {
    height: 30,
    marginHorizontal: 5,
    paddingVertical: 0,
    borderWidth: 0.5,
    borderRadius: 5,
  },
  submitContainer: {
    height: 40,
    justifyContent: 'center',
  },
  submitSubContainer: {
    height: 30,
    width: '20%',
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  submitText: {
    textAlign: 'center',
  },
  nameText: {
    textAlign: 'right',
    flex: 1,
    marginRight: 10,
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
  },
  subHeader: {
    marginBottom: 8,
    alignItems: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#272727',
    fontFamily: FONT_SEMIBOLD,
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 68,
    marginBottom: 10,
  },
  sliderContainer: {
    height: 140,
    elevation: 10,
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: -10,
    marginBottom: -40,
  },
  sliderContain: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  sliderStyle: {
    width: '90%',
    height: 40,
  },
  footer: {
    height: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 40,
  },
  flatlistContainer: {
    marginBottom: 70,
  },
  bottomPageModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dotIndicatorContainer: {
    width: '90%',
    alignItems: 'flex-end',
  },
  headerRightContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  audioContainer: {
    width: '100%',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioContent: {
    marginLeft: 15,
    marginRight: 8,
  },
  audioLink: {
    marginRight: 15,
    textAlign: 'center',
    flex: 1,
  },
  modalContainer1: {
    width: '80%',
    borderRadius: 10,
    maxHeight: height * 0.8,
  },
  modalHeaderLinks: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalFooter1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cancel: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontFamily: FONT_SEMIBOLD,
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel1: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  videoContainer: {
    height: 130,
    marginTop: 10,
    marginHorizontal: -10,
  },
  audioClose: {
    position: 'absolute',
    right: 5,
    top: 10,
  },
});
