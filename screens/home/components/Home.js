import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import {TabView, TabBar, SceneMap} from 'react-native-tab-view';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {ScrollView} from 'react-native-gesture-handler';
import Images from '../../../assets/images';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import {
  resetDashboardCategory,
  fetchDashboardCategory,
  fetchDocumentInfos,
  resetDocumentInfos,
  resetSearchModal,
  fetchBookAds,
  toogleLanguageModal,
} from '../actions';
import {connect} from 'react-redux';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import I18n from '../../../i18n';
import LinearGradient from 'react-native-linear-gradient';
import Search from '../../../components/Search';
import {resetFirstLogin} from '../../login/actions';
import {MaterialIndicator} from 'react-native-indicators';
import Carousel from 'react-native-looped-carousel-improved';
import {ImageBackground} from 'react-native';
import LanguageModal from '../../../components/languageModal';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ToolTip from '../../../components/toolTip';
import AdsPopUp from '../../../components/AdsPopUp';
import {copilot, walkthroughable, CopilotStep} from 'react-native-copilot';

const CopilotText = walkthroughable(Text);
const CopilotImage = walkthroughable(Image);
const y_value = Platform.OS == 'ios' ? 0 : 20;

const circleSvgPath = ({position, canvasSize}) =>
  `M0,0H${canvasSize.x}V${canvasSize.y}H0V0ZM${-25 + position.x._value},${
    y_value + position.y._value
  }Za50 50 0 1 0 100 0 50 50 0 1 0-100 0`;

const StepNumber = () => <View />;

const {height, width} = Dimensions.get('screen');
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

export class PopularScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subjuctIndex: null,
      searchVisible: false,
      popularSubjectId: null,
      latestSubjectId: null,
      contemporarySubjectId: null,
      onLoadLoader: false,
    };
    this.renderItem = this.renderItem.bind(this);
    this.rendercatogory = this.rendercatogory.bind(this);
    this.subjectSelect = this.subjectSelect.bind(this);
    this.loader = this.loader.bind(this);
    this.fetchDashboard = this.fetchDashboard.bind(this);
    this.onLoad = this.onLoad.bind(this);
  }

  subjectSelect(item, index) {
    if (this.props.fromLatest == 1) {
      this.props.dispatch(resetDocumentInfos('latest'));
      if (this.state.subjuctIndex === index) {
        this.setState({subjuctIndex: null});
        this.props.dispatch(fetchDocumentInfos('latest'));
      } else {
        this.setState({subjuctIndex: index, latestSubjectId: item.subjectId});
        this.props.dispatch(fetchDocumentInfos('latest', item.subjectId));
      }
    } else if (this.props.fromLatest == 0) {
      this.props.dispatch(resetDocumentInfos('popular'));
      if (this.state.subjuctIndex === index) {
        this.setState({subjuctIndex: null});
        this.props.dispatch(fetchDocumentInfos('popular'));
      } else {
        this.setState({subjuctIndex: index, popularSubjectId: item.subjectId});
        this.props.dispatch(fetchDocumentInfos('popular', item.subjectId));
      }
    } else {
      this.props.dispatch(resetDocumentInfos('contemporary'));
      if (this.state.subjuctIndex === index) {
        this.setState({subjuctIndex: null});
        this.props.dispatch(fetchDocumentInfos('contemporary'));
      } else {
        this.setState({
          subjuctIndex: index,
          contemporarySubjectId: item.subjectId,
        });
        this.props.dispatch(fetchDocumentInfos('contemporary', item.subjectId));
      }
    }
  }

  onLoad() {
    this.setState({onLoadLoader: true});
    if (this.props.fromLatest == 1) {
      if (!this.props.isLatestLastPage) {
        this.props.dispatch(
          fetchDocumentInfos('latest', this.state.latestSubjectId, true),
        );
      }
    } else if (this.props.fromLatest == 0) {
      if (!this.props.isPopularLastPage) {
        this.props.dispatch(
          fetchDocumentInfos('popular', this.state.popularSubjectId, true),
        );
      }
    } else {
      if (!this.props.isContemporaryLastPage) {
        this.props.dispatch(
          fetchDocumentInfos(
            'contemporary',
            this.state.contemporarySubjectId,
            true,
          ),
        );
      }
    }
  }

  fetchDashboard(booksads) {
    {
      booksads && this.props.dispatch(fetchBookAds(booksads));
    }
    if (this.props.fromLatest == 1) {
      this.props.dispatch(resetDocumentInfos('latest'));
      this.props.dispatch(
        fetchDocumentInfos('latest', this.state.latestSubjectId),
      );
    } else if (this.props.fromLatest == 0) {
      this.props.dispatch(resetDocumentInfos('popular'));
      this.props.dispatch(
        fetchDocumentInfos('popular', this.state.popularSubjectId),
      );
    } else {
      this.props.dispatch(resetDocumentInfos('contemporary'));
      this.props.dispatch(
        fetchDocumentInfos('contemporary', this.state.contemporarySubjectId),
      );
    }
  }

  componentDidMount() {
    this.fetchDashboard();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.searchVisible != this.props.searchVisible) {
      this.setState({searchVisible: true});
    }
    if (this.props.locale != prevProps.locale) {
      I18n.locale =
        this.props.user && this.props.user.language
          ? this.props.user.language
          : this.props.locale;
      this.fetchDashboard();
    }
  }

  loader() {
    return (
      <View>
        <Placeholder
          Animation={Shine}
          Left={props => <PlaceholderMedia style={styles.loaderLeft} />}
          Right={props => <PlaceholderMedia style={styles.loaderRight} />}>
          <PlaceholderMedia style={styles.loaderContain} />
        </Placeholder>
      </View>
    );
  }

  categoryLoader() {
    return (
      <View>
        <Placeholder
          Animation={Shine}
          Left={props => <PlaceholderMedia style={styles.categoryLoaderLeft} />}
          Right={props => (
            <PlaceholderMedia style={styles.categoryLoaderLeft} />
          )}>
          <PlaceholderMedia style={styles.categoryLoaderContain} />
        </Placeholder>
      </View>
    );
  }

  rendercatogory({item, index}) {
    return (
      <TouchableOpacity
        style={[
          styles.rendercatogoryContainer,
          {
            backgroundColor:
              this.state.subjuctIndex === index ? PRIMARY_COLOR : '#FFF',
          },
        ]}
        onPress={() => this.subjectSelect(item, index)}>
        <Text
          style={[
            styles.itemText,
            {
              color:
                this.state.subjuctIndex === index
                  ? '#fff'
                  : 'rgba(180, 0, 0, 0.78)',
            },
          ]}>
          {item.subjectName}
        </Text>
      </TouchableOpacity>
    );
  }

  renderItem({item}) {
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
        <Text
          style={[
            styles.nameText,
            {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
          ]}
          ellipsizeMode={'middle'}
          numberOfLines={1}>
          {item.memberid == 0 ? item.name : item.name.concat(memberid)}
        </Text>
        <View
          style={[
            styles.prizeContainer,
            {flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row'},
          ]}>
          <Text
            style={[
              styles.authorText,
              {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
            ]}
            numberOfLines={1}>
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
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.FlatListContainer}>
          {this.props.categorySubjucts && !this.props.isCategoryLoading ? (
            <FlatList
              horizontal={true}
              style={styles.flatlistStyles}
              showsHorizontalScrollIndicator={false}
              data={this.props.categorySubjucts}
              renderItem={this.rendercatogory}
              inverted={this.props.locale == 'ar' ? true : false}
              extraData={this.state.subjuctIndex}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={styles.loadersContain}>{this.categoryLoader()}</View>
          )}
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{paddingBottom: 30}}
          scrollEventThrottle={1}
          onMomentumScrollEnd={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              this.onLoad();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={
                this.props.fromLatest
                  ? this.props.isLatestLoading
                  : this.props.isPopularLoading
              }
              onRefresh={() => this.fetchDashboard(true)}
              colors={['#F47424']}
            />
          }>
          <View style={styles.FlatListContainer2}>
            {(this.props.fromLatest == 0 &&
              this.props.popularDocumentList &&
              (!this.props.isPopularLoading || this.state.onLoadLoader)) ||
            (this.props.fromLatest == 1 &&
              this.props.latestDocumentList &&
              (!this.props.isLatestLoading || this.state.onLoadLoader)) ||
            (this.props.fromLatest == 2 &&
              this.props.ContemporaryDocumentList &&
              (!this.props.isContemporaryLoading ||
                this.state.onLoadLoader)) ? (
              <FlatList
                style={{marginBottom: 40}}
                showsVerticalScrollIndicator={false}
                data={
                  this.props.fromLatest == 1
                    ? this.props.latestDocumentList
                    : this.props.fromLatest == 0
                    ? this.props.popularDocumentList
                    : this.props.ContemporaryDocumentList
                }
                renderItem={this.renderItem}
                numColumns={2}
                scrollEnabled={false}
                extraData={this.state}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <View>
                {this.loader()}
                {this.loader()}
                {this.loader()}
                {this.loader()}
              </View>
            )}
            {((this.props.fromLatest == 0 && !this.props.isPopularLastPage) ||
              (this.props.fromLatest == 1 && !this.props.isLatestLastPage)) && (
              <MaterialIndicator color={PRIMARY_COLOR} size={20} />
            )}
            {((this.props.fromLatest == 0 &&
              !this.props.isPopularLoading &&
              this.props.popularDocumentList &&
              this.props.popularDocumentList.length === 0) ||
              (this.props.fromLatest == 1 &&
                !this.props.isLatestLoading &&
                this.props.latestDocumentList &&
                this.props.latestDocumentList.length === 0) ||
              (this.props.fromLatest == 2 &&
                !this.props.isContemporaryLoading &&
                this.props.ContemporaryDocumentList &&
                this.props.ContemporaryDocumentList.length === 0)) && (
              <View style={styles.errorTextContainer}>
                {!this.props.popularError ? (
                  <Text style={styles.errorText}>Sorry No Books Available</Text>
                ) : (
                  <Text style={styles.errorText}>
                    Sorry Something Went Wrong!
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
        <Search navigation={this.props.navigation} />
      </SafeAreaView>
    );
  }
}

export class TabViewExample extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      isFirstLogin:props.isFirstLogin,
      index: 1,
      size: {width, height},
      routes: [
        {key: 'third', title: I18n.t('Contemporary')},
        {key: 'second', title: I18n.t('Latest')},
        {key: 'first', title: I18n.t('Popular')},
      ],
    };
    this.onSearch = this.onSearch.bind(this);
    this.fetchCategory = this.fetchCategory.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  onSearch() {
    this.props.dispatch(resetSearchModal(true));
  }

  changeLanguage() {
    this.props.dispatch(toogleLanguageModal());
  }

  componentDidUpdate(prevProps) {
    if (this.props.locale != prevProps.locale) {
      this.fetchCategory();
      this.setState({
        routes: [
          {key: 'third', title: I18n.t('Contemporary')},
          {key: 'second', title: I18n.t('Latest')},
          {key: 'first', title: I18n.t('Popular')},
        ],
      });
    }
    if (this.props.user != prevProps.user) {
      setTimeout(() => {
        this.setState({
          routes: [
            {key: 'third', title: I18n.t('Contemporary')},
            {key: 'second', title: I18n.t('Latest')},
            {key: 'first', title: I18n.t('Popular')},
          ],
        });
      }, 200);
    }
  }

  fetchCategory() {
    this.props.dispatch(resetDashboardCategory());
    this.props.dispatch(
      fetchDashboardCategory(this.props.locale == 'ar' ? 1 : 2),
    );
  }

  componentDidMount() {
    if (this.props.showOtp) {
      this.props.navigation.navigate('Otp');
    } else {
      this.props.dispatch(fetchBookAds(true));
    }
    this.fetchCategory();
    I18n.locale =
      this.props.user && this.props.user.language
        ? this.props.user.language
        : this.props.locale;
    if (this.props.isFirstLogin) {
      this.props.start();
      this.setState({value: this.state.value + 1});
      this.props.dispatch(
        resetFirstLogin({locale: I18n.locale, isFirstLogin: false}),
      );
    }
    this.props.navigation.setParams({
      this: this,
    });
    this.setState({
      routes: [
        {key: 'third', title: I18n.t('Contemporary')},
        {key: 'second', title: I18n.t('Latest')},
        {key: 'first', title: I18n.t('Popular')},
      ],
    });
  }

  _onLayoutDidChange = e => {
    const layout = e.nativeEvent.layout;
    this.setState({size: {width: layout.width, height: layout.height}});
  };

  carouselLoader(item) {
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('Detailbuy', {
            data: item,
            fromPopular: true,
          })
        }
        style={[{backgroundColor: '#fff'}, this.state.size]}>
        <ImageBackground
          blurRadius={10}
          resizeMode="stretch"
          style={styles.adsImg}
          source={item.coverImage ? {uri: item.coverImage} : Images.default}>
          <LinearGradient
            style={[
              styles.adsGradient,
              {
                flexDirection:
                  this.props.locale == 'ar' ? 'row-reverse' : 'row',
              },
            ]}
            colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
            <View
              style={[
                styles.sliderImg,
                {
                  marginLeft: this.props.locale == 'ar' ? 0 : 20,
                  marginRight: this.props.locale == 'ar' ? 20 : 0,
                },
              ]}>
              <Image
                style={styles.adsCard}
                resizeMode="stretch"
                source={
                  item.coverImage ? {uri: item.coverImage} : Images.default
                }
              />
            </View>
            <View style={styles.adsTextContainer}>
              <Text
                numberOfLines={2}
                style={[
                  styles.textName,
                  {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
                ]}>
                {item.name}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.textAuthor,
                  {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
                ]}>
                {item.author}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  render() {
    if (
      this.props.bookAds &&
      this.props.latestAds &&
      this.props.latestAds.length > 0
    ) {
      var arr = this.props.latestAds;
      arr = arr.slice(0, 4);
      var count = arr.length;
    }
    var tabWidth = this.props.locale == 'ar' ? width / 4 + 30 : width / 4;
    var lastTabWidth =
      this.props.locale == 'ar' ? (width * 2) / 4 : (width * 2) / 4;
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flexDirection: 'row', marginLeft: 10, marginRight: 15}}>
          <TouchableOpacity
            onPress={() => this.props.navigation.toggleDrawer()}
            style={{zIndex: 10}}>
            <CopilotStep
              text={I18n.t('Click_here_to_view_Alwaraq_App_Options')}
              order={1}
              name={I18n.t('Menu')}>
              <CopilotText>
                <Entypo
                  onPress={() => this.props.navigation.toggleDrawer()}
                  name="menu"
                  color={TITLE_COLOR}
                  size={36}
                />
              </CopilotText>
            </CopilotStep>
            {/* <Entypo name='menu' color={TITLE_COLOR} size={36} /> */}
            {/* <Image source={Images.menu} resizeMode='contain' /> */}
          </TouchableOpacity>
          <View style={styles.headerView}>
            <Image
              style={styles.logo}
              source={Images.headerName}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              style={styles.menu}
              onPress={() => this.changeLanguage()}>
              <CopilotStep
                text={I18n.t('Change_Language')}
                order={2}
                name={I18n.t('Language')}>
                <CopilotText>
                  <FontAwesome5
                    name="globe-asia"
                    color={TITLE_COLOR}
                    size={26}
                  />
                </CopilotText>
              </CopilotStep>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.onSearch()}>
              <CopilotStep
                text={I18n.t('Search_for_books')}
                order={3}
                name={I18n.t('Search')}>
                <CopilotText>
                  <FontAwesome name="search" color={TITLE_COLOR} size={30} />
                </CopilotText>
              </CopilotStep>
            </TouchableOpacity>
          </View>
        </View>
        {this.props.bookAds &&
          this.props.latestAds &&
          this.props.latestAds.length > 0 && (
            <View
              style={{height: height * 0.25}}
              onLayout={this._onLayoutDidChange}>
              <Carousel delay={2000} style={this.state.size} autoplay>
                {arr &&
                  arr.map(item => {
                    return this.carouselLoader(item);
                  })}
                {this.carouselLoader(
                  this.props.latestAds && this.props.latestAds[count]
                    ? this.props.latestAds[count]
                    : this.props.latestAds[0],
                )}
              </Carousel>
              <AntDesign
                onPress={() => this.props.dispatch(fetchBookAds(false))}
                style={styles.close}
                name="closecircleo"
                size={20}
                color="#fff"
              />
            </View>
          )}
        <TabView
          navigationState={this.state}
          renderScene={route => {
            switch (route.route.key) {
              case 'first':
                return (
                  <PopularScreen
                    navigation={this.props.navigation}
                    value={this.state.value}
                    categorySubjucts={
                      this.props.categorySubjucts && this.props.categorySubjucts
                    }
                    popularDocumentList={
                      this.props.popularDocumentList &&
                      this.props.popularDocumentList
                    }
                    isPopularLoading={this.props.isPopularLoading}
                    isCategoryLoading={this.props.isCategoryLoading}
                    isPopularLastPage={this.props.isPopularLastPage}
                    locale={this.props.locale}
                    fromLatest={0}
                    user={this.props.user}
                    popularError={this.props.popularError}
                    dispatch={this.props.dispatch}
                  />
                );
              case 'second':
                return (
                  <PopularScreen
                    navigation={this.props.navigation}
                    categorySubjucts={
                      this.props.categorySubjucts && this.props.categorySubjucts
                    }
                    latestDocumentList={
                      this.props.latestDocumentList &&
                      this.props.latestDocumentList
                    }
                    isLatestLoading={this.props.isLatestLoading}
                    isLatestLastPage={this.props.isLatestLastPage}
                    latestError={this.props.latestError}
                    fromLatest={1}
                    locale={this.props.locale}
                    isCategoryLoading={this.props.isCategoryLoading}
                    dispatch={this.props.dispatch}
                  />
                );
              case 'third':
                return (
                  <PopularScreen
                    navigation={this.props.navigation}
                    categorySubjucts={
                      this.props.categorySubjucts && this.props.categorySubjucts
                    }
                    ContemporaryDocumentList={
                      this.props.ContemporaryDocumentList &&
                      this.props.ContemporaryDocumentList
                    }
                    isContemporaryLoading={this.props.isContemporaryLoading}
                    isContemporaryLastPage={this.props.isContemporaryLastPage}
                    ContemporaryError={this.props.ContemporaryError}
                    fromLatest={2}
                    locale={this.props.locale}
                    isCategoryLoading={this.props.isCategoryLoading}
                    dispatch={this.props.dispatch}
                  />
                );
              default:
                return null;
            }
          }}
          renderTabBar={props => {
            return (
              <TabBar
                {...props}
                onTabPress={({route}) => {}}
                activeColor="#272727"
                inactiveColor="#c2c3c8"
                indicatorStyle={styles.indicatorStyle}
                style={styles.tabStyle}
                renderLabel={({route, focused, color}) => (
                  <View
                    style={{
                      width: route.key == 'third' ? lastTabWidth : tabWidth,
                      alignItems:
                        this.props.locale == 'ar' ? 'center' : 'flex-end',
                      marginLeft:
                        this.props.locale == 'ar'
                          ? 0
                          : route.key == 'second'
                          ? 30
                          : 0,
                    }}>
                    {route.key == 'first' ? (
                      <CopilotStep
                        text={I18n.t('Switch_between_tabs')}
                        order={4}
                        name={I18n.t('Popular_and_Latest')}>
                        <CopilotText>
                          <Text
                            style={[
                              styles.titleText,
                              {color: focused ? PRIMARY_COLOR : color},
                            ]}>
                            {route.title}
                          </Text>
                        </CopilotText>
                      </CopilotStep>
                    ) : route.key == 'second' ? (
                      <CopilotStep
                        text={I18n.t('Switch_between_tabs1')}
                        order={5}
                        name={I18n.t('Popular_and_Latest1')}>
                        <CopilotText>
                          <Text
                            style={[
                              styles.titleText,
                              {color: focused ? PRIMARY_COLOR : color},
                            ]}>
                            {route.title}
                          </Text>
                        </CopilotText>
                      </CopilotStep>
                    ) : (
                      <CopilotStep
                        text={I18n.t('Switch_between_tabs2')}
                        order={6}
                        name={I18n.t('Popular_and_Latest2')}>
                        <CopilotText>
                          <Text
                            style={[
                              styles.titleText,
                              {color: focused ? PRIMARY_COLOR : color},
                            ]}>
                            {route.title}
                          </Text>
                        </CopilotText>
                      </CopilotStep>
                    )}
                  </View>
                )}
              />
            );
          }}
          onIndexChange={index => this.setState({index})}
          labelStyle={styles.labelStyle}
          initialLayout={{width: Dimensions.get('window').width}}
        />
        {!this.state.isFirstLogin&&
        <AdsPopUp navigation={this.props.navigation}/>}
        <LanguageModal />
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    latestAds: state.dashboard.latestAds,
    bookAds: state.dashboard.bookAds,
    categorySubjucts: state.dashboard.categorySubjucts,
    popularDocumentList: state.dashboard.popularDocumentList,
    latestDocumentList: state.dashboard.latestDocumentList,
    ContemporaryDocumentList: state.dashboard.ContemporaryDocumentList,
    isPopularLoading: state.dashboard.isPopularLoading,
    isLatestLoading: state.dashboard.isLatestLoading,
    isContemporaryLoading: state.dashboard.isContemporaryLoading,
    popularError: state.dashboard.popularError,
    latestError: state.dashboard.latestError,
    ContemporaryError: state.dashboard.ContemporaryError,
    isPopularLastPage: state.dashboard.isPopularLastPage,
    isLatestLastPage: state.dashboard.isLatestLastPage,
    ContemporaryPage: state.dashboard.ContemporaryPage,
    isCategoryLoading: state.dashboard.isCategoryLoading,
    locale: state.userLogin.locale,
    isFirstLogin: state.userLogin.isFirstLogin,
    user: state.userLogin.user,
    speechToogle: state.dashboard.speechToogle,
    showOtp: state.otp.showOtp,
  };
};

const style = {
  position: 'absolute',
  paddingTop: 15,
  paddingHorizontal: 15,
  backgroundColor: '#fff',
  borderRadius: 13,
  overflow: 'hidden',
  marginTop: 40,
};

export default connect(mapStateToProps)(
  copilot({
    tooltipComponent: props => <ToolTip {...props} isHomePage={true} />,
    svgMaskPath: circleSvgPath,
    stepNumberComponent: StepNumber,
    tooltipStyle: style,
    animated: true,
    overlay: 'svg',
  })(TabViewExample),
);

// export default connect(mapStateToProps)(TabViewExample)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    margin: 10,
  },
  headerView: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    height: height / 4,
    width: '100%',
    borderRadius: 13,
    marginBottom: 4,
  },
  cardGrid: {
    flex: 1 / 2,
    paddingHorizontal: 5,
  },
  headerContainer: {
    marginTop: 0,
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  subHeaderContaner: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'center',
  },
  menu: {
    paddingLeft: 15,
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: 'rgba(0, 0, 0,.06)',
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONT_SEMIBOLD,
    marginHorizontal: 15,
  },
  rendercatogoryContainer: {
    borderRadius: 20,
    opacity: 0.78,
    borderWidth: 1,
    borderColor: 'rgba(180, 0, 0, 0.78)',
    paddingHorizontal: 10,
    marginRight: 10,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontFamily: FONT_SEMIBOLD,
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
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
    fontFamily: FONT_REGULAR,
    // width: '55%',
    flex: 1,
  },
  prizeText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontFamily: FONT_SEMIBOLD,
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
  FlatListContainer: {
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    marginTop: -5,
  },
  FlatListContainer2: {
    marginVertical: 10,
  },
  SafeAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 50,
  },
  indicatorStyle: {
    backgroundColor: '#fff',
    margin: -5,
    width: width / 6,
    marginLeft: width / 20,
    height: 3,
    zIndex: 1,
  },
  tabStyle: {
    height: 35,
    justifyContent: 'flex-start',
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: '#fff',
  },
  bottomModal: {
    marginBottom: 0,
  },
  content: {
    padding: 15,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
    flex: 1,
  },
  searchText: {
    fontSize: 18,
    fontFamily: FONT_BOLD,
    color: TITLE_COLOR,
    backgroundColor: '#fff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    elevation: 1,
    flex: 0.8,
    height: 35,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  loaderLeft: {
    borderRadius: 13,
    width: width / 2 - 20,
    height: height / 4,
    marginLeft: 5,
    marginBottom: 30,
  },
  loaderRight: {
    width: 0,
    height: 0,
  },
  loaderContain: {
    width: width / 2 - 20,
    height: height / 4,
    marginHorizontal: 10,
    borderRadius: 13,
    marginBottom: 30,
  },
  categoryLoaderLeft: {
    borderRadius: 13,
    width: width / 4,
    height: 25,
    marginBottom: 30,
  },
  categoryLoaderContain: {
    width: width / 4,
    height: 25,
    borderRadius: 13,
    marginBottom: 30,
    marginHorizontal: 30,
  },
  flatlistStyles: {
    backgroundColor: '#fff',
    height: 55,
    paddingVertical: 13,
    marginTop: -5,
  },
  loadersContain: {
    marginTop: 10,
    height: 40,
  },
  errorTextContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
  },
  categoryFlatlist: {
    backgroundColor: '#fff',
    height: 5,
    marginLeft: width / 5.5,
    marginTop: -5,
  },
  titleText: {
    flex: 1,
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'right',
    alignSelf: 'flex-end',
    width: '100%',
    fontFamily: FONT_SEMIBOLD,
    justifyContent: 'flex-start',
  },
  adsTextContainer: {
    width: '55%',
  },
  textName: {
    fontSize: 20,
    fontFamily: FONT_BOLD,
    color: '#FFFFFF',
    paddingHorizontal: 5,
    textAlign: 'right',
  },
  textAuthor: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    color: '#FFFFFF',
    paddingHorizontal: 5,
  },
  adsImg: {
    height: '100%',
    width: width,
  },
  adsGradient: {
    height: '100%',
    width: width,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row-reverse',
  },
  close: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  adsCard: {
    width: height * 0.17,
    height: height * 0.23,
    borderRadius: 5,
    backgroundColor: '#ededed',
  },
  sliderImg: {
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 4,
    shadowOpacity: 0.2,
    //    marginLeft: 20,
  },
  headerRightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    marginRight: 10,
  },
});
