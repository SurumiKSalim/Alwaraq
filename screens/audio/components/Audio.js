import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
} from '../../../assets/color';
import Demo from './../../../mockData/librariesData';
import Images from '../../../assets/images';
import I18n from '../../../i18n';
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {MaterialIndicator} from 'react-native-indicators';
import Modal from 'react-native-modal';
import VideoPlayer from 'react-native-video-controls';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {HeaderBackButton} from 'react-navigation-stack';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import {DOCUMENT_INFOS} from '../../../common/endpoints';
import Api from '../../../common/api';
import LinearGradient from 'react-native-linear-gradient';
import AudioPlay from '../../../components/audioPlay';
import {
  fetchModules,
  resetModules,
  resetModulesList,
  fetchModulesList,
} from '../actions';

const {height, width} = Dimensions.get('screen');
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

var base64 = require('base-64');
var utf8 = require('utf8');

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: params.moduleListShow && (
        <HeaderBackButton
          tintColor={PRIMARY_COLOR}
          onPress={() => params.this.stepBack()}
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
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      info: false,
      selectedItem: [],
      article: false,
      sound: false,
      moduleId: null,
      onLoadLoader: false,
      moduleListShow: false,
      popularDocumentList: [],
      isAudioBookPage: false,
      isAudioLastPage: false,
      page: 1,
      isAudioLoading: false,
    };
    this.renderItem = this.renderItem.bind(this);
    this.renderChildItem = this.renderChildItem.bind(this);
    this.selection = this.selection.bind(this);
    // this.renderModalContent = this.renderModalContent.bind(this)
    this.goBack = this.goBack.bind(this);
    this.stepBack = this.stepBack.bind(this);
    this.loader = this.loader.bind(this);
    this.audioPlay = this.audioPlay.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.rendercatogory = this.rendercatogory.bind(this);
    this.audioBookFetch = this.audioBookFetch.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(resetModules());
    this.props.dispatch(fetchModules());
    this.props.navigation.setParams({
      this: this,
    });
  }

  audioBookFetch() {
    this.setState({isAudioLoading: true});
    Api('get', DOCUMENT_INFOS, {
      isAudioAvailable: 1,
      page: this.state.page,
    }).then(response => {
      if (response) {
        console.log('audio booksasss', response);
        this.setState({
          isAudioBookPage: true,
          isAudioLastPage: response.isLastPage,
          popularDocumentList: this.state.popularDocumentList.concat(
            response.books,
          ),
          isAudioLoading: false,
          page: parseInt(this.state.page) + 1,
        });
      }
    });
  }

  stepBack() {
    if (this.state.article) {
      this.setState({article: false});
    } else {
      this.setState({
        moduleListShow: false,
        isAudioBookPage: false,
        popularDocumentList: [],
        page: 1,
      });
      this.props.navigation.setParams({
        moduleListShow: false,
      });
    }
  }

  selection(item, info, article) {
    if (!article) {
      this.props.dispatch(resetModulesList());
      if (item.moduleId != 5) {
        this.props.dispatch(fetchModulesList(item.moduleId));
      } else {
        !info && this.audioBookFetch();
      }
    }
    this.setState({
      moduleListShow: true,
      info: info,
      selectedItem: item,
      article: article,
      moduleId: item.moduleId,
    });
    this.props.navigation.setParams({
      moduleListShow: true,
    });
  }

  renderItem({item, index}) {
    console.log('item', item);
    return (
      <TouchableOpacity
        onPress={() => this.selection(item, false, false)}
        style={styles.containerContent}>
        <View style={styles.renderItemImg}>
          <Image
            style={[styles.card1, {width: width / 2.3}]}
            source={{uri: `data:image/jpeg;base64,${item.picture}`}}
          />
        </View>
        <View style={styles.renderItemText1}>
          <Text numberOfLines={1} style={styles.categoryNameText}>
            {item.moduleName}
          </Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() => this.selection(item, false, false)}
            style={styles.infoContainer}>
            <MaterialCommunityIcons
              name="microsoft-xbox-controller-menu"
              color={PRIMARY_COLOR}
              size={23}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.selection(item, true, false)}
            style={styles.infoContainer}>
            <MaterialIcons
              name="info-outline"
              color={PRIMARY_COLOR}
              size={25}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  renderChildItem({item, index}) {
    return (
      <TouchableOpacity
        onPress={() => this.selection(item, false, true)}
        style={styles.containerContent}>
        <View style={styles.renderItemImg}>
          <Image
            style={[styles.card1, {width: width / 2.3}]}
            source={{uri: `data:image/jpeg;base64,${item.coverImage}`}}
          />
        </View>
        <View style={styles.renderItemText1}>
          <Text numberOfLines={1} style={styles.categoryNameText}>
            {item.name}
          </Text>
          {/* <Text style={styles.statusText}>{item.author}</Text> */}
        </View>
      </TouchableOpacity>
    );
  }

  goBack() {
    this.setState({
      article: false,
      isAudioBookPage: false,
      popularDocumentList: [],
      page: 1,
    });
  }

  loader() {
    return (
      <View style={styles.loaderContainer}>
        <Placeholder
          Animation={Shine}
          Left={props => (
            <PlaceholderMedia
              style={[
                styles.loaderLeft,
                {
                  width: this.state.modalVisible ? width / 2.6 : width / 2.3,
                  height: this.state.modalVisible ? width / 2.6 : width / 2.3,
                },
              ]}
            />
          )}
          Right={props => <PlaceholderMedia style={styles.loaderRight} />}>
          <PlaceholderMedia
            style={[
              styles.loaderContain,
              {
                width: this.state.modalVisible ? width / 2.6 : width / 2.3,
                height: this.state.modalVisible ? width / 2.6 : width / 2.3,
              },
            ]}
          />
        </Placeholder>
      </View>
    );
  }

  audioPlay() {
    this.setState({sound: !this.state.sound});
  }

  onLoad() {
    this.setState({onLoadLoader: true});
    if (!this.props.isLastPage) {
      this.props.dispatch(fetchModulesList(this.state.moduleId));
    }
  }

  rendercatogory({item, index}) {
    var memberid = '-' + item.memberid;
    return (
      <TouchableOpacity
        style={styles.cardGrid}
        onPress={() =>
          this.props.navigation.navigate('Detailbuy', {
            data: item,
            fromPopular: true,
          })
        }>
        <LinearGradient
          style={styles.card}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.card}
            source={item.coverImage ? {uri: item.coverImage} : Images.default}
          />
        </LinearGradient>
        <View style={{flexDirection: 'row'}}>
          <Text
            style={styles.nameText}
            ellipsizeMode={'middle'}
            numberOfLines={1}>
            {item.memberid == 0 ? item.name : item.name.concat(memberid)}
          </Text>
        </View>
        <View style={styles.prizeContainer}>
          <Text style={styles.authorText} numberOfLines={1}>
            {item.author}
          </Text>
          <TouchableOpacity
            style={[
              styles.prizeTextContainer,
              {width: I18n.locale == 'ar' ? 80 : 70},
            ]}
            onPress={() =>
              item.inapp_free == 0
                ? this.props.navigation.navigate('Detailbuy', {
                    data: item,
                    fromPopular: true,
                  })
                : this.props.navigation.navigate('Subscribe')
            }>
            <Text style={styles.prizeText}>
              {item.inapp_free == 0 ? I18n.t('Free') : I18n.t('PREMIUM')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    console.log('this.state.article ', this.state.article);
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.moduleListShow && (
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
              ]}>
              {I18n.t('Audio_Gallery')}
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
        )}
        <View style={styles.actionContainer}>
          {this.props.fromLibrary && this.state.moduleListShow && (
            <HeaderBackButton
              onPress={
                this.state.article
                  ? () => this.setState({article: false})
                  : () =>
                      this.setState({
                        moduleListShow: false,
                        isAudioBookPage: false,
                        popularDocumentList: [],
                        page: 1,
                        info: false,
                      })
              }
            />
          )}
          {this.state.info && (
            <TouchableOpacity
              onPress={() =>
                this.selection(this.state.selectedItem, false, false)
              }
              style={[styles.infoContainer, {alignItems: 'flex-end'}]}>
              <MaterialCommunityIcons
                name="microsoft-xbox-controller-menu"
                color={PRIMARY_COLOR}
                size={23}
              />
            </TouchableOpacity>
          )}
        </View>
        {!this.props.isLoading && !this.state.moduleListShow ? (
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={this.props.audio}
            renderItem={this.renderItem}
            extraData={this.state}
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          !this.state.moduleListShow && (
            <View>
              {this.loader()}
              {this.loader()}
              {this.loader()}
              {this.loader()}
            </View>
          )
        )}
        {this.state.moduleListShow && (
          <View style={{flex: 1}}>
            {!this.state.info &&
              !this.state.article &&
              (!this.props.isModuleListLoading || this.state.onLoadLoader) && (
                <ScrollView
                  style={styles.scrollContainer}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={1}
                  onMomentumScrollEnd={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                      if (!this.state.isAudioBookPage) {
                        this.onLoad();
                      } else {
                        !this.state.isAudioLoading &&
                          !this.state.isAudioLastPage &&
                          this.audioBookFetch();
                      }
                    }
                  }}>
                  <FlatList
                    style={styles.FlatListStyle}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    data={this.props.moduleList}
                    renderItem={this.renderChildItem}
                    extraData={this.state}
                    numColumns={2}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  {this.state.isAudioBookPage && (
                    <View>
                      <FlatList
                        style={styles.flatlistStyle}
                        showsVerticalScrollIndicator={false}
                        data={this.state.popularDocumentList}
                        renderItem={this.rendercatogory}
                        numColumns={2}
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                      />
                      {!this.state.isAudioLastPage && (
                        <MaterialIndicator color={PRIMARY_COLOR} size={20} />
                      )}
                    </View>
                  )}
                </ScrollView>
              )}
            {((this.props.isModuleListLoading &&
              !this.state.info &&
              !this.state.onLoadLoader) ||
              (this.state.isAudioLoading &&
                this.state.popularDocumentList &&
                this.state.popularDocumentList.length == 0)) && (
              <View style={{position: 'absolute'}}>{this.loader()}</View>
            )}
            {!this.props.isLastPage &&
              this.props.isModuleListLoading &&
              this.state.onLoadLoader && (
                <MaterialIndicator color={PRIMARY_COLOR} size={20} />
              )}
            {this.state.info && !this.state.article && (
              <View
                showsVerticalScrollIndicator={false}
                style={styles.fullFlux}>
                <View style={styles.renderModalImg}>
                  <Image
                    style={styles.cardModal}
                    resizeMode="stretch"
                    source={{
                      uri: `data:image/jpeg;base64,${this.state.selectedItem.picture}`,
                    }}
                  />
                </View>
                <View style={styles.renderItemText}>
                  <Text style={styles.modalNameText}>
                    {this.state.selectedItem.moduleName}
                  </Text>
                  <View style={styles.fullFlux}>
                    <WebView
                      showsVerticalScrollIndicator={false}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      onError={this.onError}
                      onLoadStart={this.onLoadStart}
                      onLoadEnd={this.onLoadEnd}
                      mixedContentMode="compatibility"
                      style={styles.fullFlux}
                      showsHorizontalScrollIndicator={false}
                      source={{
                        html:
                          this.state.selectedItem &&
                          this.state.selectedItem.description,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
            {this.state.article && (
              <View style={styles.fullFlux}>
                <View style={styles.modalHeader}>
                  {this.state.selectedItem.isAudioAvailable != 0 && (
                    <TouchableOpacity onPress={() => this.audioPlay()}>
                      {this.state.sound ? (
                        <FontAwesome5
                          name="volume-mute"
                          size={24}
                          color={PRIMARY_COLOR}
                        />
                      ) : (
                        <FontAwesome5
                          name="volume-up"
                          size={24}
                          color={PRIMARY_COLOR}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  showsVerticalScrollIndicator={false}
                  style={styles.fullFlux}>
                  <View style={styles.renderModalImg}>
                    <Image
                      style={styles.cardModal}
                      resizeMode="stretch"
                      source={{
                        uri: `data:image/jpeg;base64,${this.state.selectedItem.coverImage}`,
                      }}
                    />
                  </View>
                  <View style={styles.renderItemText}>
                    <Text style={styles.modalNameText}>
                      {this.state.selectedItem.name}
                    </Text>
                    {this.state.sound && (
                      <View style={styles.videoContainer}>
                        <AudioPlay
                          navigation={this.props.navigation}
                          videoLink={
                            this.state.selectedItem &&
                            this.state.selectedItem.audio
                          }
                        />
                      </View>
                    )}
                    <View style={styles.fullFlux}>
                      <WebView
                        showsVerticalScrollIndicator={false}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onError={this.onError}
                        onLoadStart={this.onLoadStart}
                        onLoadEnd={this.onLoadEnd}
                        mixedContentMode="compatibility"
                        style={styles.fullFlux}
                        showsHorizontalScrollIndicator={false}
                        source={{
                          html:
                            this.state.selectedItem &&
                            utf8.decode(
                              base64.decode(
                                this.state.selectedItem.description,
                              ),
                            ),
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    categorySubjucts: state.dashboard.categorySubjucts,
    audio: state.library.audio,
    modules: state.library.modules,
    locale: state.userLogin.locale,
    moduleList: state.library.moduleList,
    isLoading: state.library.isLoading,
    isLastPage: state.library.isLastPage,
    isModuleListLoading: state.library.isModuleListLoading,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    margin: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  containerContent: {
    height: width / 2.3,
    margin: width / 50,
    width: width / 2.3,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 13,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    borderWidth: 0.01,
    borderColor: '#fff',
  },
  containerContent1: {
    height: width / 2.6,
    margin: width / 52,
    width: width / 2.6,
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 13,
    backgroundColor: '#fff',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    borderWidth: 0.01,
    borderColor: '#fff',
  },
  categoryNameText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
  },
  statusText: {
    fontFamily: FONT_MEDIUM,
    textAlign: 'center',
    fontSize: 12,
    color: PRIMARY_COLOR,
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 62,
    marginBottom: 10,
  },
  indicatorStyle: {
    backgroundColor: PRIMARY_COLOR,
    margin: -5,
    width: width / 5,
    marginLeft: width / 30,
    height: 3,
  },
  tabStyle: {
    backgroundColor: '#fff',
    height: 35,
    justifyContent: 'flex-start',
    shadowOpacity: 0,
    elevation: 0,
    marginRight: '15%',
    marginLeft: 15,
  },
  labelStyle: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 50,
  },
  renderItemImg: {
    flex: 2,
    justifyContent: 'center',
  },
  renderItemText: {
    justifyContent: 'flex-start',
    flex: 1,
    padding: 2,
  },
  renderItemText1: {
    justifyContent: 'flex-end',
    padding: 2,
    flex: 1,
  },
  titleText: {
    flex: 1,
    fontSize: 18,
    marginBottom: 5,
    marginHorizontal: -15,
    fontFamily: FONT_BOLD,
  },
  content: {
    flex: 1,
    height: 0.7,
    width: width * 0.9,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff00',
  },
  modalStyle: {
    width: width * 0.9,
    height: height * 0.6,
    shadowOpacity: 0.1,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  card: {
    width: width / 7,
    height: width / 7,
  },
  card1: {
    marginTop: -5,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    // width: width / 2.6,
    height: width / 3.8,
  },
  renderModalImg: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardModal: {
    height: 100,
    width: 100,
  },
  modalNameText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
    textAlign: 'center',
  },
  loaderLeft: {
    borderRadius: 13,
    margin: width / 50,
    // width:width / 2.3,
    // height:width / 2.3,
    // marginLeft: 10,
    marginVertical: 10,
  },
  loaderRight: {
    width: 0,
    height: 0,
  },
  loaderContain: {
    margin: width / 50,
    // width:width / 2.3,
    // height:width / 2.3,
    marginHorizontal: 10,
    borderRadius: 13,
    marginVertical: 10,
  },
  videoContainer: {
    height: 130,
    marginHorizontal: -15,
    marginBottom: 8,
  },
  FlatListStyle: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  fullFlux: {
    flex: 1,
  },
  webViewStyle: {
    height: height / 3.5,
    marginBottom: 10,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loaderContainer: {
    backgroundColor: '#fff',
  },
  scrollContainer: {
    borderColor: 20,
    marginBottom: 60,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    marginLeft: 10,
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
  },
  cardGrid: {
    flex: 1 / 2,
    paddingHorizontal: 5,
  },
  card: {
    height: height / 6,
    width: '100%',
    borderRadius: 13,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  prizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'flex-end',
    marginTop: -4,
  },
  authorText: {
    fontSize: 12,
    opacity: 0.6,
    fontSize: 13,
    fontFamily: FONT_REGULAR,
    // width: '55%',
    flex: 1,
  },
  prizeTextContainer: {
    padding: 3,
    borderRadius: 20,
    backgroundColor: '#F4E7E7',
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  prizeText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontFamily: FONT_SEMIBOLD,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
