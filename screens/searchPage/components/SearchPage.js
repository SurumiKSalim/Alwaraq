import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Demo from './../../../mockData/homeData';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_LIGHT,
} from '../../../assets/fonts';
import Images from '../../../assets/images';
import {connect} from 'react-redux';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {resetSearchModal} from '../../home/actions';
import {
  fetchSearchBookPage,
  fetchSearchResult,
  resetSearchResult,
} from '../../searchPage/actions';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import AntDesign from 'react-native-vector-icons/AntDesign';
import I18n from '../../../i18n';
import Api from '../../../common/api';
import {SEARCH_INTERMEDIATE} from '../../../common/endpoints';
import {MaterialIndicator} from 'react-native-indicators';
import {HeaderBackButton} from 'react-navigation-stack';
import AutoHeightWebView from 'react-native-autoheight-webview';

const {height, width} = Dimensions.get('screen');
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerLeft: (
        <SafeAreaView>
        <HeaderBackButton
          tintColor={PRIMARY_COLOR}
          onPress={() =>
            params?.fromBookList
              ? params.this.props.navigation.navigate('BookList')
              : params.this.props.navigation.navigate('Home')
          }
        />
        </SafeAreaView>
      ),
      headerTitle: (
        <SafeAreaView style={styles.header}>
          <Image
            style={styles.logo}
            source={Images.headerName}
            resizeMode="contain"
          />
        </SafeAreaView>
      ),

      headerRight: (
        <SafeAreaView>
          {!params?.fromBookList && (
            <TouchableOpacity
              onPress={() => params.this.onSearch()}
              style={styles.headerRightContainer}>
              <FontAwesome name="search" color={TITLE_COLOR} size={30} />
            </TouchableOpacity>
          )}
        </SafeAreaView>
      ),
      headerTitleStyle: {},
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 80,
      },
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isFav: [],
      isLoading: false,
      favourite: false,
      sortOrder: true,
      index: 0,
      page: 1,
      isLastReached: true,
      resultIndex: 0,
      isVisible: false,
      intermediateResult: [],
      firstRadioValue: this.props.navigation.getParam('firstRadioValue'),
      secondRadioValue: this.props.navigation.getParam('secondRadioValue'),
      wordFormRadio: this.props.navigation.getParam('wordFormRadio'),
      encoded: this.props.navigation.getParam('encoded'),
      subRadioValue: this.props.navigation.getParam('subRadioValue'),
      periodId: this.props.navigation.getParam('periodId'),
      subjectId: this.props.navigation.getParam('subjectId'),
      listType: this.props.navigation.getParam('listType'),
      authorId: this.props.navigation.getParam('authorId'),
      bookLanguage: this.props.navigation.getParam('bookLanguage'),
      isAudioAvailable: this.props.navigation.getParam('isAudioAvailable'),
    };
    this.renderItem = this.renderItem.bind(this);
    this.isFavourite = this.isFavourite.bind(this);
    this.pageInfo = this.pageInfo.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.sort = this.sort.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
      fromBookList: this.props.navigation.getParam('fromBookList'),
    });
  }

  sort() {
    if (!this.props.isLoading) {
      let sortOrder = this.state.sortOrder ? 'desc' : 'asc';
      this.props.dispatch(resetSearchResult());
      this.props.dispatch(
        fetchSearchResult(
          this.state.firstRadioValue,
          this.state.secondRadioValue,
          this.state.wordFormRadio,
          this.state.encoded,
          this.state.subRadioValue,
          this.state.periodId,
          sortOrder,
        ),
      );
      this.setState({sortOrder: !this.state.sortOrder});
    }
  }

  isFavourite(item, index) {
    this.setState({index: index, favourite: !this.state.favourite});
  }

  dataFetch = (bookId, page) => {
    this.setState({isLoading: true});
    Api('get', SEARCH_INTERMEDIATE, {
      language: this.props.locale == 'ar' ? 1 : 2,
      bookId: bookId,
      searchtext: this.state.encoded,
      option: this.state.secondRadioValue,
      offset: page,
      WordForm: this.state.wordFormRadio,
      AllOffset: 1,
    }).then(response => {
      if (response && response.statusCode == 200) {
        this.setState({
          intermediateResult: this.state.intermediateResult.concat(
            response.exsearchlist,
          ),
          isLastReached: response.isLastPage,
          page: page,
        });
      }
      this.setState({isLoading: false});
    });
  };

  onSearch() {
    this.props.dispatch(resetSearchModal(true));
  }

  pageInfo(item, firstRadioValue, index) {
    this.setState({intermediateResult: [], page: 1, isLastReached: true});
    if (firstRadioValue == 3) {
      this.props.navigation.navigate('Detailbuy', {data: item});
    } else if (firstRadioValue == 4) {
      this.props.navigation.navigate('Author', {data: item});
    } else if (firstRadioValue == 0) {
      // setTimeout(() => {
      // this.flatListRef.scrollToIndex({ animated: true, index: index });
      // }, 200);
      this.setState(
        {resultIndex: index, isVisible: !this.state.isVisible},
        this.myScroll.scrollTo({x: 0, y: 120.5 * index, animated: true}),
      );
      if (!this.state.isVisible) {
        this.dataFetch(item.bookid, 1);
      }
      // else {
      this.myScroll.scrollTo({x: 0, y: 120.5 * index, animated: true});
    } else {
      this.props.dispatch(
        fetchSearchBookPage(item, this.props.navigation, null, firstRadioValue),
      );
    }
  }

  loader() {
    return (
      <View>
        <Placeholder Animation={Shine}>
          <PlaceholderMedia
            style={[
              styles.loaderContain,
              {
                height:
                  this.state.firstRadioValue != 0 ? width / 7.5 : width / 4.5,
              },
            ]}
          />
        </Placeholder>
      </View>
    );
  }

  renderItem({item, index}) {
    let subjectName =
      this.props.locale == 'ar' ? item?.subjectName1 : item?.subjectName2;
    var firstRadioValue = this.state.firstRadioValue;
    var intermediateResult = this.state.intermediateResult;
    var resultIndex = this.state.resultIndex;
    var isVisible = this.state.isVisible;
    var base64 = require('base-64');
    var utf8 = require('utf8');
    if (item) {
      return (
        <View>
          <TouchableOpacity
            style={firstRadioValue == 0 ? styles.cardLibGrid : styles.cardGrid}
            onPress={() => this.pageInfo(item, firstRadioValue, index)}>
            <View style={styles.cardGridView}>
              {firstRadioValue != 1 &&
                firstRadioValue != 3 &&
                firstRadioValue != 4 && (
                  <View style={{flex: 1}}>
                    {this.state.firstRadioValue != 2 ? (
                      <Text style={styles.nameText} numberOfLines={2}>
                        {item.bookname ? item.bookname : item.name}(
                        <Text style={{color: 'red'}}>{item.totalpages}</Text>){' '}
                      </Text>
                    ) : (
                      <Text style={styles.nameText} numberOfLines={2}>
                        {item.bookname ? item.bookname : item.name}
                      </Text>
                    )}
                    <Text numberOfLines={2} style={styles.authorText}>
                      {item.author}
                    </Text>
                    <Text style={[styles.authorText]} numberOfLines={1}>
                      {item.period * 100}-{(item.period - 1) * 100} |{' '}
                      {subjectName}
                    </Text>
                  </View>
                )}
              {(firstRadioValue == 3 || firstRadioValue == 4) && (
                <Text style={styles.nameText} numberOfLines={2}>
                  {item.name ? item.name : item.authorName}
                </Text>
              )}
              {firstRadioValue == 1 && (
                <Text style={styles.nameText} numberOfLines={2}>
                  {index + 1} : {item.sura}
                </Text>
              )}
            </View>
            <Text style={styles.nameText1} numberOfLines={2}>
              : {index + 1}
              {'\n'}
              {firstRadioValue == 0 && (
                <FontAwesome
                  name={
                    index == resultIndex && isVisible
                      ? 'angle-up'
                      : 'angle-down'
                  }
                  color={TITLE_COLOR}
                  size={20}
                />
              )}
            </Text>
          </TouchableOpacity>
          {isVisible &&
            index == resultIndex &&
            intermediateResult &&
            intermediateResult.map((items, index) => {
              return (
                <TouchableOpacity
                  onPress={() =>
                    this.props.dispatch(
                      fetchSearchBookPage(
                        item,
                        this.props.navigation,
                        items.offset,
                        firstRadioValue,
                        items.offset,
                      ),
                    )
                  }
                  style={styles.radioContainer1}>
                  <Text style={styles.intermediateText}>{items.bookName}</Text>
                  <Text style={styles.authorText}>
                    Page no:{items.pageNumber}
                  </Text>
                  {items && items.page.length != 0 && (
                    <View style={styles.webViewContainer}>
                      <AutoHeightWebView
                        style={styles.autoWebView}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        scrollEnabled={false}
                        // scalesPageToFit={true}
                        // onShouldStartLoadWithRequest={event => {
                        //     if (event.url.slice(0, 4) === 'http') {
                        //         Linking.openURL(event.url)
                        //         return false
                        //     }
                        //     return true
                        // }}
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
                        source={{
                          html:
                            items &&
                            items.page &&
                            utf8.decode(base64.decode(items.page)),
                        }}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          {isVisible &&
            index == resultIndex &&
            intermediateResult &&
            intermediateResult.length == 0 &&
            !this.state.isLoading && (
              <View style={styles.radioContainer}>
                <Text style={[styles.intermediateText, {textAlign: 'center'}]}>
                  {I18n.t('No_Results_Found')}
                </Text>
              </View>
            )}
          {isVisible && this.state.isLoading && index == resultIndex && (
            <View style={styles.radioContainer}>
              <MaterialIndicator
                color={PRIMARY_COLOR}
                size={20}
                style={styles.signinIcon}
              />
            </View>
          )}
          {isVisible && index == resultIndex && !this.state.isLastReached && (
            <TouchableOpacity
              onPress={() => this.dataFetch(item.bookid, this.state.page + 1)}
              style={styles.radioContainer}>
              <Text
                style={[
                  styles.intermediateText,
                  {color: PRIMARY_COLOR, textAlign: 'center'},
                ]}>
                Load More
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    } else {
      return null;
    }
  }

  onLoad() {
    if (!this.props.isLoading && !this.props.isLastPage) {
      this.props.dispatch(
        fetchSearchResult(
          this.state.firstRadioValue,
          this.state.secondRadioValue,
          this.state.wordFormRadio,
          this.state.encoded,
          this.state.subRadioValue,
          this.state.periodId,
          null,
          this.state.subjectId,
          this.state.listType,
          this.state.authorId,
          this.state.bookLanguage,
          this.state.isAudioAvailable,
        ),
      );
    }
  }

  render() {
    var firstRadioValue = this.state.firstRadioValue;
    var headerText = ['Library', 'Quran', 'Lisan', 'Book_Names', 'authors'];
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={[
                styles.title,
                {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
              ]}>
              {I18n.t(headerText[firstRadioValue])}
              <Text style={styles.subTitle}>
                {' '}
                ({this.props.total ? this.props.total : 0})
              </Text>
            </Text>
            <FontAwesome5
              onPress={() => this.sort()}
              name={
                !this.state.sortOrder
                  ? 'sort-amount-down'
                  : 'sort-amount-up-alt'
              }
              color={TITLE_COLOR}
              size={20}
            />
          </View>
          <View style={styles.emptyContainer} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={1}
          ref={ref => {
            this.myScroll = ref;
          }}
          onMomentumScrollEnd={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              this.onLoad();
            }
          }}>
          {!this.props.isLoading &&
            this.props.searchList &&
            !this.props.searchList.length > 0 && (
              <View style={styles.infoContainer}>
                <AntDesign name="frown" color={'#ECECEC'} size={50} />
                <Text style={styles.infoText}>No Search Result Found!</Text>
              </View>
            )}
          <View>
            {this.props.searchList && this.props.searchList.length > 0 && (
              <FlatList
                style={styles.flatlistStyle}
                showsVerticalScrollIndicator={false}
                data={this.props.searchList}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
            {!this.props.isLastPage && this.props.isLoading && (
              <MaterialIndicator
                color={PRIMARY_COLOR}
                size={20}
                style={styles.signinIcon}
              />
            )}

            {this.props.isLoading && (
              <View style={styles.loadersContain}>
                {this.loader()}
                {this.loader()}
                {this.loader()}
                {this.loader()}
                {this.loader()}
                {this.loader()}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    searchList: state.searchpage.searchList,
    total: state.searchpage.total,
    isLoading: state.searchpage.isLoading,
    isLastPage: state.searchpage.isLastPage,
    locale: state.userLogin.locale,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  cardGrid: {
    padding: 5,
    flexDirection: 'row',
    borderRadius: 5,
    marginVertical: 5,
    elevation: 0.5,
    borderWidth: 0.1,
    borderColor: '#707070',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: '#FFFFFF',
  },
  cardLibGrid: {
    height: 110.5,
    padding: 5,
    flexDirection: 'row',
    borderRadius: 5,
    marginVertical: 5,
    elevation: 0.5,
    borderWidth: 0.1,
    borderColor: '#707070',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: '#FFFFFF',
  },
  card: {
    height: width / 5.5,
    width: width / 5.5,
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  cardContainer: {
    flex: 1,
  },
  cardGridView: {
    flexDirection: 'row',
    flex: 3,
    height: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    width: '95%',
    marginHorizontal: 10,
    marginTop: 10,
    textAlign: 'right',
  },
  nameText1: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    marginRight: 5,
    height: '100%',
    paddingVertical: 10,
    textAlign: 'right',
  },
  iconContainer: {
    justifyContent: 'center',
  },
  authorText: {
    fontSize: 12,
    opacity: 0.6,
    fontSize: 13,
    fontFamily: FONT_REGULAR,
    textAlign: 'right',
    paddingRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTextContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 10,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 15,
  },
  ratingTexts: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 15,
    color: '#605F5F',
  },
  title: {
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
  },
  subTitle: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontFamily: FONT_BOLD,
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 62,
    marginBottom: 10,
  },
  headerRightContainer: {
    marginRight: 15,
  },
  loaderContain: {
    width: '100%',
    borderRadius: 13,
    marginVertical: 5,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  infoContainer: {
    height: height / 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioContainer: {
    paddingVertical: 10,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    marginVertical: 5,
    elevation: 0.5,
    backgroundColor: '#FFFFFF',
  },
  radioContainer1: {
    paddingVertical: 10,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    marginVertical: 5,
    elevation: 0.5,
    backgroundColor: '#eaeaea',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#9c9c9c',
  },
  intermediateText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    width: '95%',
    marginHorizontal: 10,
    marginTop: 10,
    textAlign: 'right',
  },
  autoWebView: {
    width: width - 40,
    marginHorizontal: 10,
    marginTop: 5,
  },
});
