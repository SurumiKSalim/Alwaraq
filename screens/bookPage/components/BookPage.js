import React, {Component} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {
  BOOK_PAGE,
  SEARCH_BOOK_PAGE,
  DOCUMENT_INFOS,
  IS_BOOK_BOUGHT,
  BOOK_READ,
  BOOKMARK,
  NEW_BOOK_PAGE,
} from '../../../common/endpoints';
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import {fetchBookTree, fetchBookMark} from '../actions';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import {
  UIActivityIndicator,
  DotIndicator,
  MaterialIndicator,
  BallIndicator,
  BarIndicator,
} from 'react-native-indicators';
import DateCalc from '../../../components/DateCalc';
import Api from '../../../common/api';
import Tts from 'react-native-tts';
import I18n from '../../../i18n';
import AudioPlay from '../../../components/audioPlay';
import {HeaderBackButton} from 'react-navigation-stack';
import translate from 'translate-google-api';
import {LanguageList, languageFormat} from '../../../components/languageList';

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
      gesturesEnabled: false,
      headerLeft: (
        <HeaderBackButton
          tintColor={PRIMARY_COLOR}
          onPress={() => params.this.goBack()}
        />
      ),
      headerRight: (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => params.this.toogleLanguageModal()}
            style={styles.headerRightContainer}>
            <MaterialCommunityIcons
              name="google-translate"
              color={PRIMARY_COLOR}
              size={26}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => params.this.dateCalc(true)}
            style={styles.headerRightContainer}>
            <Fontisto name="date" color={PRIMARY_COLOR} size={22} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => params.this.bgColorToogle()}
            style={styles.headerRightContainer}>
            <FontAwesome name="eye" color={PRIMARY_COLOR} size={26} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => params.this.fontToogle()}
            style={styles.headerRightContainer}>
            <Text style={styles.fontText}>{params.font}</Text>
          </TouchableOpacity>
          {params.fromSearch && params.radioValue != 2 && (
            <TouchableOpacity
              onPress={() => params.this.goHome()}
              style={styles.headerRightContainer}>
              <FontAwesome5 name="book" color={PRIMARY_COLOR} size={26} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => params.this.goBookMark()}
            style={styles.headerRightContainer}>
            <FontAwesome name="bookmark" color={PRIMARY_COLOR} size={26} />
          </TouchableOpacity>
          {!params.offlineData && (
            <TouchableOpacity
              onPress={() => params.this.OnSearch()}
              style={styles.headerRightContainer}>
              <FontAwesome name="search" color={PRIMARY_COLOR} size={26} />
            </TouchableOpacity>
          )}
        </View>
      ),
      headerTitleStyle: {},
      headerStyle: {
        borderBottomWidth: 0,
        height: 60,
        elevation: 0,
        backgroundColor: params.bgColor,
      },
    };
  };

  constructor(props) {
    super(props);
    let data = this.props.navigation.getParam('data', null);
    let item = this.props.navigation.getParam('item', null);
    let fromSearch = this.props.navigation.getParam('fromSearch', null);
    let totalpages = this.props.navigation.getParam('totalpages', null);
    let offlineData = this.props.navigation.getParam('offlineData', null);
    this.state = {
      page: this.props.navigation.getParam('pageNo', 1),
      temp_page: 0,
      zoomIndex: 0,
      bgColorIndex: 0,
      toLanguage: 'en',
      languageModal: false,
      totalpages: fromSearch ? totalpages : data && data.totalpages,
      pageModal: false,
      visibleModal: false,
      isModalVisible: false,
      bookMarkModal: false,
      bookMarkList: [],
      bookMarkLoading: true,
      encoded: this.props.navigation.getParam('item')?.searchtext,
      isbookMarkLastPage: true,
      bookNote: '',
      searchText: '',
      searchVisible: false,
      exsearchpage: '',
      secondRadioValue: 1,
      wordFormRadio: 1,
      visible: false,
      Text: null,
      bookRenderId: 'initial',
      tempsearchResult: [],
      bookAudios: data && data.bookAudio,
      isAudioAvailable: data && data.isAudioAvailable,
      fromSearch: fromSearch,
      offline: this.props.navigation.getParam('offline'),
      fromSearchPageId: this.props.navigation.getParam('page', null),
      offlineData: offlineData,
      audioRead: false,
      invaliedPage: false,
      bookMarkPage: 1,
      pageIndex: 0,
      audioLink: '',
      chapter: false,
      audioModal: false,
      webLoad: false,
      languageId: data ? data.language : item && item.language,
      audioPlayer: false,
      webError: false,
      dateCalculator: false,
      bookId: data
        ? data.bookid
        : item
        ? item.bookid
        : offlineData && offlineData.bookid,
      translatedText: null,
      pageAudioLoading: null,
      pageAudioUrl: '',
      htmlPage: '',
      pageStriped: '',
      isPlayAll: false,
    };
    this.pageLeft = this.pageLeft.bind(this);
    this.pageRight = this.pageRight.bind(this);
    this.leftMost = this.leftMost.bind(this);
    this.rightMost = this.rightMost.bind(this);
    this.onSwipeDown = this.onSwipeDown.bind(this);
    this.onSwipeLeft = this.onSwipeLeft.bind(this);
    this.onSwipeRight = this.onSwipeRight.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.renderPageModal = this.renderPageModal.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.pageSelect = this.pageSelect.bind(this);
    this.chapterSelect = this.chapterSelect.bind(this);
    this.chapterBack = this.chapterBack.bind(this);
    this.onClose = this.onClose.bind(this);
    this.goToPage = this.goToPage.bind(this);
    this.goToBook = this.goToBook.bind(this);
    this.onLoadStart = this.onLoadStart.bind(this);
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onError = this.onError.bind(this);
    this.audioPlay = this.audioPlay.bind(this);
    this.readBook = this.readBook.bind(this);
    this.stopRead = this.stopRead.bind(this);
    this.renderAudioItem = this.renderAudioItem.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.OnSearch = this.OnSearch.bind(this);
    this.onSearchPage = this.onSearchPage.bind(this);
    this.goHome = this.goHome.bind(this);
    this.getBookPage = this.getBookPage.bind(this);
    this.goBookMark = this.goBookMark.bind(this);
    this.fontToogle = this.fontToogle.bind(this);
    this.dateCalc = this.dateCalc.bind(this);
    this.bgColorToogle = this.bgColorToogle.bind(this);
    this.pageTranlate = this.pageTranlate.bind(this);
    this.translate = this.translate.bind(this);
    this.fetchResume = this.fetchResume.bind(this);
    // this.bookPageAudioFetch = this.bookPageAudioFetch.bind(this)
    this.toogleLanguageModal = this.toogleLanguageModal.bind(this);
    this.bookPageFetch = this.bookPageFetch.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  goBack() {
    this.stopRead();
    let userId = this.props.user ? this.props.user.userid : 0;
    let temp_arr = this.props.bookMark;
    if (this.props.bookMark && this.props.bookMark.length > 0) {
      let obj = temp_arr.find((o, i) => {
        if (o.userId == userId) {
          // temp[i] = { name: 'new string', value: 'this', other: 'that' };
          let result =
            temp_arr &&
            temp_arr[i] &&
            temp_arr[i].bookMark &&
            temp_arr[i].bookMark.find((o, i) => {
              if (parseInt(o.bookId) == parseInt(this.state.bookId)) {
                o.page = this.state.page;
                return true; // stop searching
              }
            });
          if (!result) {
            temp_arr &&
              temp_arr[i] &&
              temp_arr[i].bookMark &&
              temp_arr[i].bookMark.push({
                bookId: parseInt(this.state.bookId),
                page: this.state.page,
              });
          }
          this.props.dispatch(fetchBookMark(temp_arr));
          return true; // stop searching
        } else {
          temp_arr = [
            {
              userId: userId,
              bookMark: [
                {bookId: parseInt(this.state.bookId), page: this.state.page},
              ],
            },
          ];
          this.props.dispatch(fetchBookMark(temp_arr));
        }
      });
    } else {
      let temp = [
        {
          userId: userId,
          bookMark: [{bookId: this.state.bookId, page: this.state.page}],
        },
      ];
      this.props.dispatch(fetchBookMark(temp));
    }
    this.props.navigation.goBack();
  }

  audioPlay() {
    this.setState({
      audioModal: this.state.audioLink ? false : true,
      isPlayAll: false,
      audioPlayer: false,
      audioLink: false,
      sound: false,
    });
    this.props.navigation.setParams({
      isAudioAvailable: this.state.isAudioAvailable,
      sound: false,
      this: this,
    });
  }

  dateCalc(flag) {
    this.setState({dateCalculator: flag});
  }

  fontToogle() {
    switch (this.state.zoomIndex) {
      case 0:
        this.setState({zoomIndex: 1});
        this.props.navigation.setParams({
          font: '1.2x',
        });
        break;
      case 1:
        this.setState({zoomIndex: 2});
        this.props.navigation.setParams({
          font: '1.5x',
        });
        break;
      case 2:
        this.setState({zoomIndex: 0});
        this.props.navigation.setParams({
          font: '1x',
        });
        break;
    }
  }

  bgColorToogle() {
    let bgColors = ['#fff', '#fed7b2', '#e1e1e1'];
    switch (this.state.bgColorIndex) {
      case 0:
        this.setState({bgColorIndex: 1});
        this.props.navigation.setParams({
          bgColor: bgColors[1],
        });
        break;
      case 1:
        this.setState({bgColorIndex: 2});
        this.props.navigation.setParams({
          bgColor: bgColors[2],
        });
        break;
      case 2:
        this.setState({bgColorIndex: 0});
        this.props.navigation.setParams({
          bgColor: bgColors[0],
        });
        break;
    }
  }

  goHome() {
    Api('get', DOCUMENT_INFOS, {bookId: this.state.bookId}).then(response => {
      if (response) {
        this.setState({
          totalpages: response.books[0].totalpages,
          fromSearch: false,
        });
        this.props.navigation.navigate('Detailbuy', {
          data: response.books[0],
          fromSearch: true,
        });
      }
    });
  }

  goBookMark() {
    if (this.props.user) {
      this.setState({bookMarkModal: true});
    } else {
      this.setState({isModalVisible: true});
    }
  }

  stopRead() {
    Tts.stop();
    this.setState({sound: false});
  }

  async translate(data, to) {
    this.setState({webLoad: true});
    let translatedText = '';
    let from = languageFormat[parseInt(this.state.languageId) - 1];
    // let to = this.state.toLanguage
    let tempData = data.match(/.{1,500}(\s|$)/g);
    for (let i = 0; i < tempData.length; i++) {
      const result = await translate(tempData[i], {
        from: from,
        to: to,
      });
      translatedText = translatedText + result;
    }
    this.setState({translatedText: translatedText, webLoad: false});
  }

  toogleLanguageModal() {
    if (this.state.translatedText) {
      this.setState({translatedText: '</div>'});
    }
    this.setState({languageModal: true});
  }

  pageTranlate(toLanguage) {
    // if (this.state.translatedText) {
    //     this.setState({ translatedText: null })
    // }
    // else {
    this.setState({
      toLanguage: languageFormat[toLanguage],
      languageModal: false,
    });
    this.translate(this.state.pageStriped, languageFormat[toLanguage]);
    // Api('get', BOOK_READ, { bookId: this.state.bookId, page: this.state.fromSearch ? this.state.fromSearchPageId : this.state.page }).then((response) => {
    //     if (response) {
    //         this.translate(response.pageStriped)
    //     }
    //     else {
    //         this.setState({ webLoad: false })
    //     }
    // })
    // }
  }

  readBook() {
    this.stopRead();
    if (
      !this.state.sound &&
      this.state.pageStriped &&
      this.state.pageStriped.length > 0
    ) {
      Tts.getInitStatus().then(() => {
        Tts.speak(this.state.pageStriped);
      });
      // this.props.navigation.setParams({
      //     sound: true,
      // })
      this.setState({sound: true});
      //     }
      // })
    } else {
      this.setState({sound: false});
    }
  }

  OnSearch() {
    this.setState({searchVisible: true});
  }

  onSwipeDown(gestureState) {
    this.setState({visibleModal: false});
  }

  onSwipeLeft(gestureState) {
    this.pageRight();
  }

  onSwipeRight(gestureState) {
    this.pageLeft();
  }

  getBookPage() {
    let userId = this.props.user ? this.props.user.userid : 0;
    if (this.props.bookMark && this.props.bookMark.length > 0) {
      let obj = this.props.bookMark.find((o, i) => {
        if (o.userId == userId) {
          this.props.bookMark[i] &&
            this.props.bookMark[i].bookMark &&
            this.props.bookMark[i].bookMark.find((o, i) => {
              if (o.bookId == this.state.bookId) {
                if (o.page != 1) {
                  this.setState({temp_page: o.page, pageModal: true});
                }
                return true; // stop searching
              }
            });
        }
      });
    }
  }

  bookPageFetch(page) {
    this.setState({webLoad: true});
    Api('get', NEW_BOOK_PAGE, {bookId: this.state.bookId, page: page}).then(
      response => {
        if (response) {
          this.setState({
            htmlPage: response.page,
            pageAudioUrl: response.bookAudio,
            pageStriped: response.pageStriped,
          });
        }
      },
    );
  }

  componentDidMount() {
    this.bookPageFetch(this.state.page);
    if (!this.state.fromSearch) {
      this.getBookPage();
    }
    Tts.addEventListener('tts-finish', event => this.setState({read: true}));
    this.props.navigation.setParams({
      radioValue: this.props.navigation.getParam('radioValue'),
      isAudioAvailable: this.state.isAudioAvailable,
      languageId: this.state.languageId,
      this: this,
      font: '1x',
    });
    if (this.state.fromSearch) {
      this.setState({
        bookId:
          this.props.navigation.getParam('item') &&
          this.props.navigation.getParam('item').bookid,
      });
    }
    if (!this.props.navigation.getParam('offline')) {
      this.props.dispatch(fetchBookTree(this.state.bookId));
    } else {
      this.setState({totalpages: this.state.offlineData.totalpages});
    }
  }

  // bookPageAudioFetch() {
  //     if (this.state.pageAudioLoading == null) {
  //         this.setState({ pageAudioLoading: true })
  //         let inputUrl = 'https://www.alwaraq.net/json_bookpage.php' + '?book=' + this.state.bookId + '&page=' + this.state.page
  //         Api('get', inputUrl).then((response) => {
  //             this.setState({ pageAudioLoading: false })
  //             if (response && response.bookAudios) {
  //                 this.setState({
  //                     pageAudioUrl: response.bookAudios,
  //                     audioModal: true,
  //                     audioPlayer: false,
  //                     audioLink: false,
  //                     sound: false
  //                 })
  //             }
  //         })
  //     }
  //     else
  //         this.setState({
  //             pageAudioLoading: null,
  //             audioPlayer: false,
  //             audioLink: false,
  //             sound: false
  //         })
  // }

  componentWillUnmount() {
    Tts.stop();
  }

  pageRight() {
    this.setState({translatedText: null});
    this.stopRead();
    let page = parseInt(this.state.page) - 1;
    if (this.state.page > 1) {
      this.setState({
        page: this.state.page - 1,
        pageIndex: parseInt(this.state.pageIndex) - 1,
      });
      if (!this.state.fromSearch) {
        this.bookPageFetch(page);
      }
    }
    // if (
    //   this.state.fromSearch &&
    //   page > 0 &&
    //   this.props.navigation.getParam('item')
    // ) {
    //   this.props.dispatch(
    //     fetchSearchBookPage(
    //       this.props.navigation.getParam('item'),
    //       this.props.navigation,
    //       page,
    //       this.props.navigation.getParam('radioValue'),
    //       null,
    //       this.state.encoded,
    //     ),
    //   );
    // }
    if (this.state.fromSearch && this.state.page > 1) {
      this.onSearchPage(this.state.page - 1);
    }
  }

  pageLeft() {
    this.setState({translatedText: null});
    this.stopRead();
    let page = parseInt(this.state.page) + 1;
    if (this.state.page < parseInt(this.state.totalpages)) {
      this.setState({
        page: parseInt(this.state.page) + 1,
        pageIndex: parseInt(this.state.pageIndex) + 1,
      });
      if (!this.state.fromSearch) {
        this.bookPageFetch(page);
      }
    }
    // if (
    //   this.state.fromSearch &&
    //   page <= this.state.totalpages &&
    //   this.props.navigation.getParam('item')
    // ) {
    //   this.props.dispatch(
    //     fetchSearchBookPage(
    //       this.props.navigation.getParam('item'),
    //       this.props.navigation,
    //       page,
    //       this.props.navigation.getParam('radioValue'),
    //       null,
    //       this.state.encoded
    //     ),
    //   );
    // }
    if (
      this.state.fromSearch &&
      this.state.page < parseInt(this.state.totalpages)
    ) {
      this.onSearchPage(this.state.page + 1);
    }
  }

  leftMost() {
    console.log('item', this.state.page, this.state.totalpages);
    this.stopRead();
    this.setState({
      page: this.state.totalpages,
      pageIndex: this.state.totalpages - 1,
      translatedText: null,
    });
    if (
      !this.state.fromSearch &&
      this.state.page < parseInt(this.state.totalpages)
    ) {
      console.log('22qq');
      this.bookPageFetch(this.state.totalpages);
    }
    // if (
    //   this.state.fromSearch &&
    //   this.state.page < parseInt(this.state.totalpages) &&
    //   this.props.navigation.getParam('item')
    // ) {
    //   this.props.dispatch(
    //     fetchSearchBookPage(
    //       this.props.navigation.getParam('item'),
    //       this.props.navigation,
    //       this.state.totalpages,
    //       this.props.navigation.getParam('radioValue'),
    //       null,
    //       this.state.encoded,
    //     ),
    //   );
    // }
    if (
      this.state.fromSearch &&
      this.state.page < parseInt(this.state.totalpages)
    ) {
      console.log('qqqq');
      this.onSearchPage(parseInt(this.state.totalpages));
    }
  }

  rightMost() {
    // this.setState({translatedText:null})
    this.stopRead();
    this.setState({page: 1, pageIndex: 0, translatedText: null});
    if (!this.state.fromSearch&&this.state.page > 1) {
      this.bookPageFetch(1);
    }
    // if (
    //   this.state.fromSearch &&
    //   this.state.page > 1 &&
    //   this.props.navigation.getParam('item')
    // ) {
    //   this.props.dispatch(
    //     fetchSearchBookPage(
    //       this.props.navigation.getParam('item'),
    //       this.props.navigation,
    //       1,
    //       this.props.navigation.getParam('radioValue'),
    //       null,
    //       this.state.encoded,
    //     ),
    //   );
    // }
    if (this.state.fromSearch && this.state.page > 1) {
      this.onSearchPage(1);
    }
  }

  pageSelect(pageid) {
    this.stopRead();
    this.setState({
      page: pageid,
      visibleModal: false,
      pageIndex: pageid - 1,
      translatedText: null,
    });
    this.bookPageFetch(pageid);
  }

  chapterSelect(url) {
    this.stopRead();
    this.props.dispatch(fetchBookTree(this.state.bookid, url));
    this.setState({chapter: true, translatedText: null});
  }

  chapterBack() {
    this.stopRead();
    this.props.dispatch(fetchBookTree(this.state.bookId));
    this.setState({chapter: false, translatedText: null});
  }

  onClose() {
    this.stopRead();
    this.setState({visibleModal: null, translatedText: null});
    this.chapterBack();
  }

  onLoadStart() {
    if (!this.state.webLoad) {
      this.setState({webLoad: true});
    }
    if (this.state.webError) {
      this.setState({webError: false});
    }
  }

  onError() {
    if (this.state.webLoad) {
      this.setState({webLoad: false});
    }
    if (!this.state.webError) {
      this.setState({webError: true});
    }
  }

  onLoadEnd() {
    if (this.state.webLoad) {
      this.setState({webLoad: false});
    }
  }

  goToPage() {
    this.setState({translatedText: null});
    var txt = parseInt(this.state.Text);
    this.stopRead();
    // this.setState({ page: this.state.totalpages})
    if (txt > 0 && txt <= this.state.totalpages && !this.state.fromSearch) {
      this.setState({
        page: txt,
        visible: false,
        invaliedPage: false,
        pageIndex: txt - 1,
      });

      if (!this.state.fromSearch) {
        this.bookPageFetch(txt);
      }
    }
    // if (
    //   this.state.fromSearch &&
    //   txt <= parseInt(this.state.totalpages) &&
    //   this.props.navigation.getParam('item')
    // ) {
    //   this.setState({page: txt, visible: false, invaliedPage: false});
    //   this.props.dispatch(
    //     fetchSearchBookPage(
    //       this.props.navigation.getParam('item'),
    //       this.props.navigation,
    //       txt,
    //       this.props.navigation.getParam('radioValue'),
    //       null,
    //       this.state.encoded,
    //     ),
    //   );
    // }
    if (this.state.fromSearch && txt < parseInt(this.state.totalpages)) {
      this.setState({page: txt, visible: false, invaliedPage: false});
      this.onSearchPage(txt);
    } else {
      this.setState({invaliedPage: true});
    }
  }

  goToBook(pageInfo) {
    this.setState({translatedText: null});
    this.stopRead();
    let formdata = new FormData();
    formdata.append('bookId', this.state.bookId);
    Api('get', DOCUMENT_INFOS, {bookId: this.state.bookId}).then(response => {
      if (response) {
        Api('post', IS_BOOK_BOUGHT, formdata).then(res => {
          if (res) {
            if (
              response.books[0].inapp_free == 0 ||
              (response.books[0].isBoughtIndividually == 0 &&
                this.props.isPremium) ||
              res.isBookBought
            ) {
              this.setState({
                fromSearch: false,
                totalpages: pageInfo.totalpages,
                page: pageInfo.pageid,
              });
              this.bookPageFetch(pageInfo.pageid);
            } else {
              this.props.navigation.navigate('Detailbuy', {
                data: response.books[0],
                fromSearch: true,
              });
            }
          }
        });
      }
    });
    this.props.dispatch(fetchBookTree(this.state.bookId));
  }

  renderItem({item}) {
    return (
      <View>
        {item.child == 0 ? (
          <View style={styles.renderItemContainer}>
            <TouchableOpacity
              style={styles.renderItemSubContainer}
              onPress={() => this.pageSelect(item.pageid)}>
              {!this.props.isBookTreeLoading ? (
                <Text style={styles.nameText}>{item.name}</Text>
              ) : (
                <View style={styles.dotIndicatorContainer}>
                  <DotIndicator
                    color={PRIMARY_COLOR}
                    size={10}
                    style={styles.indicator}
                  />
                </View>
              )}
              <View style={styles.iconContainer}>
                {!this.props.isBookTreeLoading ? (
                  <FontAwesome5 name="readme" color={PRIMARY_COLOR} size={20} />
                ) : (
                  <UIActivityIndicator
                    color={PRIMARY_COLOR}
                    size={18}
                    style={styles.indicator}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.renderItemContainer}>
            <TouchableOpacity
              style={styles.renderItemSubContainer}
              onPress={() => this.chapterSelect(item.child)}>
              {!this.props.isBookTreeLoading ? (
                <Text style={styles.nameText}>{item.name}</Text>
              ) : (
                <View style={styles.dotIndicatorContainer}>
                  <DotIndicator
                    color={PRIMARY_COLOR}
                    size={10}
                    style={styles.indicator}
                  />
                </View>
              )}
              <View style={styles.iconContainer}>
                {!this.props.isBookTreeLoading ? (
                  <FontAwesome5
                    name="book-reader"
                    color={PRIMARY_COLOR}
                    size={20}
                  />
                ) : (
                  <UIActivityIndicator
                    color={PRIMARY_COLOR}
                    size={18}
                    style={styles.indicator}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  async playAudio(item, isPlayAll) {
    await this.setState({Text: item?.pageId});
    this.goToPage();
    this.setState({
      audioModal: false,
      audioLink: item?.audioLink ? item.audioLink : item,
      audioPlayer: true,
      sound: true,
      translatedText: null,
      isPlayAll: isPlayAll,
    });
    this.props.navigation.setParams({
      sound: true,
    });
  }

  renderLanguageList(item, index) {
    return (
      <TouchableOpacity
        onPress={() => this.pageTranlate(index)}
        style={styles.audioContainer}>
        {/* <AntDesign name='sound' size={20} color={PRIMARY_COLOR} style={styles.audioContent} /> */}
        <Text
          numberOfLines={1}
          style={[styles.audioLink, {textAlign: 'center'}]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  }

  renderAudioItem(item, index) {
    return (
      <TouchableOpacity
        onPress={() => this.playAudio(item)}
        style={styles.audioContainer}>
        <AntDesign
          name="sound"
          size={20}
          color={PRIMARY_COLOR}
          style={styles.audioContent}
        />
        <Text numberOfLines={1} style={styles.audioLink}>
          {item?.audioTitle
            ? item.audioTitle
            : 'audio part ' + parseInt(index + 1)}
        </Text>
      </TouchableOpacity>
    );
  }

  renderBookMarkItem(item, index) {
    return (
      <TouchableOpacity
        onPress={() =>
          this.setState({
            page: item.pageId,
            bookMarkModal: false,
            bookRenderId: 'initial',
          })
        }
        style={styles.audioContainer}>
        <Text style={{justifyContent: 'flex-start', height: '100%'}}>
          {index + 1} :
        </Text>
        <View style={{flex: 1}}>
          <Text numberOfLines={1} style={styles.audioLink}>
            {' '}
            {I18n.t('Page_No')}:{item.pageId}{' '}
          </Text>
          {item.note != '' && (
            <Text
              numberOfLines={1}
              style={[styles.audioLink, {color: PRIMARY_COLOR}]}>
              {' '}
              {I18n.t('Note')}:{item.note}
            </Text>
          )}
        </View>
        <AntDesign
          onPress={() => this.bookMark('delete', item.bookmarkId)}
          name="delete"
          size={20}
          color={PRIMARY_COLOR}
          style={styles.audioContent}
        />
      </TouchableOpacity>
    );
  }

  renderModal = () => (
    <View style={styles.content}>
      <View style={[styles.modalClose, {paddingHorizontal: 15}]}>
        {this.state.chapter && !this.props.isBookTreeLoading && (
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => this.chapterBack()}>
            <MaterialCommunityIcons
              name="arrow-left-bold-circle"
              color={PRIMARY_COLOR}
              size={30}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => this.onClose()}>
          <Icon name="md-close-circle" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
      <View>
        {!this.props.navigation.getParam('offline') ? (
          <FlatList
            style={{marginBottom: 60}}
            showsVerticalScrollIndicator={false}
            data={this.props.bookTree}
            renderItem={this.renderItem}
            extraData={this.state}
            keyExtractor={(item, index) => index.toString()}
          />
        ) : (
          <View style={styles.iconContainer2}>
            <AntDesign name="frown" color={'#ECECEC'} size={50} />
            <Text style={styles.infoText}>{I18n.t('Sorry_Offline_Info')}</Text>
          </View>
        )}
      </View>
    </View>
  );

  bookMark(action, bookmarkId, bookMarkPage) {
    this.setState({
      bookMarkLoading: true,
      bookRenderId: action,
      translatedText: null,
    });
    let formdata = new FormData();
    formdata.append('action', action);
    formdata.append('bookId', this.state.bookId);
    formdata.append('pageId', this.state.page);
    formdata.append('page', bookMarkPage ? bookMarkPage : 1);
    formdata.append('note', this.state.bookNote);
    formdata.append('bookmarkId', bookmarkId);
    Api('post', BOOKMARK, formdata).then(response => {
      this.setState({bookMarkLoading: false});
      if (response) {
        this.setState({
          bookMarkList: bookMarkPage
            ? this.state.bookMarkList.concat(response.bookmarks)
            : response.bookmarks,
          isbookMarkLastPage: response.isLastPage,
          bookMarkPage: bookMarkPage ? bookMarkPage : 1,
        });
        if (action == 'add') {
          if (response.statusCode == 200) {
            this.setState({bookRenderId: 'success'});
          } else {
            this.setState({bookRenderId: 'failed'});
          }
        }
      }
    });
  }

  renderBookModal = () =>
    this.state.bookRenderId == 'initial' ? (
      <View style={styles.bookContent}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              bookMarkModal: false,
              bookRenderId: 'initial',
              bookMarkList: [],
              bookMarkPage: 1,
            })
          }
          style={{alignSelf: 'flex-end', height: 20}}>
          <AntDesign name="closecircle" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text
          style={styles.bookMarkText}
          onPress={() => this.setState({bookRenderId: 'add'})}>
          {I18n.t('Add_Bookmark')}
        </Text>
        <Text style={styles.bookMarkText} onPress={() => this.bookMark()}>
          {I18n.t('View_Bookmarks')}
        </Text>
      </View>
    ) : this.state.bookRenderId == 'add' ? (
      <View style={[styles.bookContent, {height: 180}]}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              bookMarkModal: false,
              bookRenderId: 'initial',
              bookMarkList: [],
              bookMarkPage: 1,
            })
          }
          style={{alignSelf: 'flex-end', height: 20}}>
          <AntDesign name="closecircle" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={[styles.bookMarkText, {color: '#9c9c9c'}]}>
          {I18n.t('Add_Bookmark')}
        </Text>
        <TextInput
          ref={ref => (this.textInputRef = ref)}
          placeholderTextColor={'#9c9c9c'}
          placeholder={I18n.t('Add_note')}
          bufferDelay={5}
          maxLength={100}
          style={[styles.gotoText, {paddingHorizontal: 5}]}
          onChangeText={Text => this.setState({bookNote: Text})}
        />
        <View
          style={[
            styles.submitContainer,
            {flexDirection: 'row', justifyContent: 'space-around'},
          ]}>
          {/* <TouchableOpacity onPress={() => this.setState({ bookMarkModal: false, bookRenderId: 'initial', bookMarkList: [], bookMarkPage: 1 })} style={styles.submitSubContainer1}>
                            <Text style={styles.submitText}>Close</Text>
                        </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => this.bookMark('add')}
            style={styles.submitSubContainer1}>
            <Text style={styles.submitText}>{I18n.t('Add')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : this.state.bookRenderId == 'success' ? (
      <View style={styles.bookContent}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              bookMarkModal: false,
              bookRenderId: 'initial',
              bookMarkList: [],
              bookMarkPage: 1,
            })
          }
          style={{alignSelf: 'flex-end', height: 20}}>
          <AntDesign name="closecircle" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={[styles.bookMarkText, {color: '#9c9c9c'}]}>Success</Text>
        <Text style={[styles.bookMarkText, {color: '#9c9c9c'}]}>
          BookMark Added
        </Text>
      </View>
    ) : this.state.bookRenderId == 'failed' ? (
      <View style={styles.bookContent}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              bookMarkModal: false,
              bookRenderId: 'initial',
              bookMarkList: [],
              bookMarkPage: 1,
            })
          }
          style={{alignSelf: 'flex-end', height: 20}}>
          <AntDesign name="closecircle" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={[styles.bookMarkText, {color: '#9c9c9c'}]}>Failed</Text>
        <Text style={[styles.bookMarkText, {color: '#9c9c9c'}]}>
          Something Went Wrong
        </Text>
      </View>
    ) : (
      <View style={[styles.bookContent, {height: height * 0.6}]}>
        <TouchableOpacity
          onPress={() =>
            this.setState({
              bookMarkModal: false,
              bookRenderId: 'initial',
              bookMarkList: [],
              bookMarkPage: 1,
            })
          }
          style={{alignSelf: 'flex-end', height: 20}}>
          <AntDesign name="closecircle" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text
          style={[styles.bookMarkText, {color: '#9c9c9c'}]}
          onPress={() => this.bookMark('add')}>
          BookMarks
        </Text>
        {this.state.bookMarkList && this.state.bookMarkList.length != 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{paddingBottom: 30}}
            scrollEventThrottle={1}
            onMomentumScrollEnd={({nativeEvent}) => {
              if (isCloseToBottom(nativeEvent)) {
                if (
                  !this.state.bookMarkLoading &&
                  !this.state.isbookMarkLastPage
                ) {
                  this.bookMark(
                    null,
                    null,
                    parseInt(this.state.bookMarkPage) + 1,
                  );
                }
              }
            }}>
            <FlatList
              data={this.state.bookMarkList}
              scrollEnabled={false}
              ItemSeparatorComponent={this.renderHeader}
              renderItem={({item, index}) =>
                this.renderBookMarkItem(item, index)
              }
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
            />
          </ScrollView>
        ) : (
          <View style={{flex: 1}} />
        )}
        {this.state.bookMarkLoading && (
          <MaterialIndicator color={PRIMARY_COLOR} size={30} />
        )}
      </View>
    );

  fetchResume() {
    this.setState({
      page: this.state.temp_page,
      pageIndex: this.state.temp_page - 1,
      pageModal: false,
    });
    this.bookPageFetch(this.state.temp_page);
  }

  renderTempPageModal = () => (
    <View style={styles.pageContent}>
      <View style={styles.modalClose}>
        <TouchableOpacity
          onPress={() =>
            this.setState({pageModal: false, invaliedPage: false})
          }>
          <Icon name="ios-close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageResume}>{I18n.t('Do_you_wish_resume')}</Text>
      <View
        style={[
          styles.submitContainer,
          {flexDirection: 'row', justifyContent: 'space-around'},
        ]}>
        <TouchableOpacity
          onPress={() => this.setState({pageModal: false})}
          style={styles.submitSubContainer1}>
          <Text style={styles.submitText}>{I18n.t('Start_Over')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.fetchResume()}
          style={styles.submitSubContainer1}>
          <Text style={styles.submitText}>{I18n.t('Resume')}</Text>
        </TouchableOpacity>
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
        <Text>{I18n.t('Go_to_Page')} </Text>
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
        <Text style={styles.invaliedPage}>
          {I18n.t('Enter_valid_numbers_in_English')}
        </Text>
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

  onSearchPage(page) {
    console.log('entered', this.state.encoded);
    this.setState({searchVisible: false, webLoad: true, translatedText: null});
    var base64 = require('base-64');
    var utf8 = require('utf8');
    var text = this.state.searchText;
    var bytes = utf8.encode(text);
    var encoded = base64.encode(bytes);
    // this.props.dispatch(fetchSearchBookPage(this.props.navigation.getParam('data'), this.props.navigation, 1, 0, this.state.secondRadioValue, this.state.wordFormRadio, encoded))
    Api('get', SEARCH_BOOK_PAGE, {
      book: this.state.bookId,
      WordForm: this.state.wordFormRadio,
      option: parseInt(this.state.secondRadioValue),
      offset: page ? page : 1,
      searchtext:
        this.state.searchText?.length > 0 ? encoded : this.state.encoded,
      totalpages: this.state.totalpages,
    }).then(response => {
      if (response) {
        this.setState({
          webLoad: false,
          page: page == undefined ? 1 : this.state.page,
          tempsearchResult: response.exsearchpage[0],
          exsearchpage: response.exsearchpage[0].pagecontent,
          fromSearch: true,
          totalpages: response.exsearchpage[0].totalSearchPages,
          fromSearchPageId: response.exsearchpage[0].pageid,
        });
      } else {
      }
    });
  }

  renderSearchModal = () => (
    <View style={styles.content2}>
      <View style={styles.renderModalContent} />
      <View style={styles.radioContainerContent}>
        <Text style={styles.searchTextContent}>{I18n.t('Search')}</Text>
        <View style={styles.flexContainer}>
          <TouchableOpacity
            onPress={() => {
              this.setState({secondRadioValue: 1});
            }}
            style={styles.radioContainer}>
            <MaterialCommunityIcons
              name={
                this.state.secondRadioValue == 1
                  ? 'circle-slice-8'
                  : 'circle-outline'
              }
              color={PRIMARY_COLOR}
              size={24}
            />
            <Text style={styles.searchOptionText}>{I18n.t('Any')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setState({secondRadioValue: 2});
            }}
            style={styles.radioContainer}>
            <MaterialCommunityIcons
              name={
                this.state.secondRadioValue == 1
                  ? 'circle-outline'
                  : 'circle-slice-8'
              }
              color={PRIMARY_COLOR}
              size={24}
            />
            <Text style={styles.searchOptionText}>
              {I18n.t('Exact_Phrase')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.radioContainerContent}>
        <Text style={styles.searchTextContent}>{I18n.t('Search_Options')}</Text>
        <View style={styles.flexContainer}>
          <TouchableOpacity
            onPress={() => {
              this.setState({wordFormRadio: 1});
            }}
            style={styles.radioContainer}>
            <MaterialCommunityIcons
              name={
                this.state.wordFormRadio == 1
                  ? 'circle-slice-8'
                  : 'circle-outline'
              }
              color={PRIMARY_COLOR}
              size={24}
            />
            <Text style={styles.searchOptionText}>{I18n.t('Complete')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.setState({wordFormRadio: 2});
            }}
            style={styles.radioContainer}>
            <MaterialCommunityIcons
              name={
                this.state.wordFormRadio == 1
                  ? 'circle-outline'
                  : 'circle-slice-8'
              }
              color={PRIMARY_COLOR}
              size={24}
            />
            <Text style={styles.searchOptionText}>
              {I18n.t('With_Suffix_and_prefix')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.searchText1}
          placeholder={I18n.t('Search')}
          ref={ref => (this.textInputRef = ref)}
          placeholderTextColor={'#9c9c9c'}
          bufferDelay={5}
          onChangeText={text => this.setState({searchText: text})}
        />
        <View>
          <TouchableOpacity
            style={styles.buyContainer}
            onPress={() =>this.state.searchText?.trim()&& this.onSearchPage()}>
            <Text style={styles.buyText}>{I18n.t('Search')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.upIconStyle}>
        <TouchableOpacity onPress={() => this.setState({searchVisible: false})}>
          <Icon name="ios-arrow-up" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );

  renderContent() {
    let audioUrl =
      this.state.audioModal == 'pageAudio'
        ? this.state.pageAudioUrl
        : this.state.bookAudios;
    let pageAudioLoading = this.state.pageAudioLoading;
    let zoom = [
      "<div style='zoom:1.0;'>",
      "<div style='zoom:1.5;'>",
      "<div style='zoom:2;'>",
      "<div style='zoom:2.5;'>",
    ];
    let bgColor = [
      "<div style='background-color:#fff;'>",
      "<div style='background-color:#fed7b2;'>",
      "<div style='background-color:#e1e1e1;'>",
    ];
    let bgColors = ['fff', 'fed7b2', 'e1e1e1'];
    let translaterTextStyle =
      this.state.toLanguage == 'ar'
        ? '<div dir="rtl" style="line-height:100px;font-weight:500;font-size:50px;text-align: justify">'
        : '<div dir="ltr" style="line-height:100px;font-weight:500;font-size:50px;text-align: justify">';
    let pageInfo = this.props.navigation.getParam('itemResponse');
    var base64 = require('base-64');
    var utf8 = require('utf8');
    var response = this.props.navigation.getParam('response', null);
    let preStyle =
      zoom[this.state.zoomIndex] + bgColor[this.state.bgColorIndex];

    return (
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: '#' + bgColors[this.state.bgColorIndex]},
        ]}>
        <DateCalc
          dateCalc={this.dateCalc}
          dateCalculator={this.state.dateCalculator}
        />
        <View style={styles.subContainer}>
          {this.state.webLoad && (
            <View
              style={[
                styles.activityIndicatorContainer,
                {backgroundColor: '#' + bgColors[this.state.bgColorIndex]},
              ]}>
              <UIActivityIndicator
                color={PRIMARY_COLOR}
                size={30}
                style={styles.activityIndicator}
              />
            </View>
          )}
          {this.state.webError && (
            <View style={styles.webErrorContainer}>
              <Text style={styles.webErrorText}>Something Went Wrong!</Text>
            </View>
          )}
          {this.state.translatedText ? (
            <View
              style={{
                flex: 1,
                marginBottom: this.state.audioLink
                  ? height * 0.1 + 130
                  : height * 0.1,
              }}>
              <WebView
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                zo
                onError={this.onError}
                onLoadStart={this.onLoadStart}
                onLoadEnd={this.onLoadEnd}
                mixedContentMode="compatibility"
                showsHorizontalScrollIndicator={false}
                source={{
                  html:
                    translaterTextStyle + this.state.translatedText + '</div',
                }}
              />
            </View>
          ) : !this.props.navigation.getParam('offline') ? (
            <View
              style={{
                height: this.state.webLoad ? '50%' : '100%',
                marginBottom: this.state.audioLink
                  ? height * 0.1 + 130
                  : height * 0.1,
              }}>
              {this.state.fromSearch !== 'failed' ? (
                <WebView
                  showsVerticalScrollIndicator={false}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  onError={this.onError}
                  style={{
                    marginBottom: this.state.audioLink
                      ? height * 0.1 + 130
                      : height * 0.1,
                  }}
                  onLoadStart={this.onLoadStart}
                  onLoadEnd={this.onLoadEnd}
                  mixedContentMode="compatibility"
                  showsHorizontalScrollIndicator={false}
                  source={
                    this.state.fromSearch
                      ? {
                          html: this.state.exsearchpage
                            ? preStyle +
                              utf8.decode(
                                base64.decode(this.state.exsearchpage),
                              )
                            : preStyle + utf8.decode(base64.decode(response)),
                        }
                      : {html: preStyle + this.state.htmlPage}
                  }
                />
              ) : (
                <Text style={styles.errorMessage}>Some Thing Went Wrong!</Text>
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                marginBottom: this.state.audioLink
                  ? height * 0.1 + 130
                  : height * 0.1,
              }}>
              <WebView
                showsVerticalScrollIndicator={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onError={this.onError}
                onLoadStart={this.onLoadStart}
                onLoadEnd={this.onLoadEnd}
                mixedContentMode="compatibility"
                showsHorizontalScrollIndicator={false}
                source={{
                  html:
                    preStyle +
                    utf8.decode(
                      base64.decode(
                        this.state.offlineData.page[this.state.pageIndex].page,
                      ),
                    ),
                }}
              />
            </View>
          )}
          <View
            style={{
              height: this.state.audioLink ? height * 0.1 + 130 : height * 0.1,
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
            }}>
            {this.state.audioPlayer && (
              <View style={styles.videoContainer}>
                <AudioPlay
                  navigation={this.props.navigation}
                  audioArray={audioUrl}
                  isPlayAll={this.state.isPlayAll}
                  videoLink={this.state.audioLink}
                />
                <AntDesign
                  style={styles.audioClose}
                  name="closecircle"
                  onPress={() =>
                    this.setState({
                      audioPlayer: false,
                      audioLink: '',
                      sound: false,
                    })
                  }
                  size={24}
                  color={PRIMARY_COLOR}
                />
              </View>
            )}
            {/* <View style={styles.videoContainer}>
                        <VideoPlayer
                            ref={ref => {
                                this.player = ref;
                            }}
                            source={{ uri: this.state.audioLink }}
                            navigator={this.props.navigator}
                            toggleResizeModeOnFullscreen={false}
                            audioOnly={true}
                            disableFullscreen={true}
                            resizeMode={'cover'}
                            disableBack={true}
                            onBack={() => this.setState({ isVideoVisible: false })}
                        />
                    </View> */}

            {this.props.navigation.getParam('radioValue') != 2 && (
              <View
                style={[
                  styles.bottomContainer,
                  {
                    height: height * 0.1,
                    backgroundColor: '#' + bgColors[this.state.bgColorIndex],
                  },
                ]}>
                {/* {!this.state.isAudioAvailable &&
                                <View style={styles.emptyContainer}></View>} */}
                <View style={styles.bottomSubContainer}>
                  {this.state.isAudioAvailable && (
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
                  {!this.state.isAudioAvailable &&
                    this.state.languageId == 2 && (
                      <TouchableOpacity onPress={() => this.readBook()}>
                        {this.state.sound ? (
                          <MaterialCommunityIcons
                            name="account-tie-voice-off"
                            size={28}
                            color={PRIMARY_COLOR}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            name="account-tie-voice"
                            size={28}
                            color={PRIMARY_COLOR}
                          />
                        )}
                      </TouchableOpacity>
                    )}
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
                  {this.state.fromSearch !== 'failed' && (
                    <TouchableOpacity
                      onPress={() =>
                        this.setState({visible: true, invaliedPage: false})
                      }
                      style={styles.pageContainer}>
                      <Text>
                        {this.state.page}/{this.state.totalpages}
                      </Text>
                    </TouchableOpacity>
                  )}
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
                  <TouchableOpacity
                    onPress={() =>
                      this.state.fromSearch
                        ? this.goToBook(
                            pageInfo ? pageInfo : this.state.tempsearchResult,
                          )
                        : this.setState({visibleModal: true})
                    }>
                    <Fontisto
                      name={this.state.fromSearch ? 'navigate' : 'sourcetree'}
                      color={PRIMARY_COLOR}
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
                {/* <View style={styles.bookTreeContainer}>
                                <TouchableOpacity onPress={() => this.state.fromSearch ? this.goToBook(pageInfo ? pageInfo : this.state.tempsearchResult) : this.setState({ visibleModal: true })}>
                                    <Fontisto name={this.state.fromSearch ? 'navigate' : 'sourcetree'} color={PRIMARY_COLOR} size={30} />
                                </TouchableOpacity>
                            </View> */}
              </View>
            )}
          </View>
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
            isVisible={this.state.pageModal}
            hasBackdrop={true}
            backdropOpacity={0.02}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            animationOutTiming={1000}
            style={styles.bottomPageModal}>
            <View style={styles.modalContain}>
              {this.renderTempPageModal()}
            </View>
          </Modal>
          <Modal
            isVisible={this.state.bookMarkModal}
            hasBackdrop={true}
            backdropOpacity={0.02}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            animationOutTiming={1000}
            style={styles.bottomPageModal}>
            <View style={styles.bookModalContain}>
              {this.renderBookModal()}
            </View>
          </Modal>
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
            isVisible={this.state.audioModal}
            hideModalContentWhileAnimating={true}
            animationIn="zoomIn"
            animationOut="zoomOut"
            hasBackdrop={true}
            backdropColor="black"
            backdropOpacity={0.5}
            onBackButtonPress={() =>
              this.setState({audioModal: false, pageAudioLoading: null})
            }
            onBackdropPress={() =>
              this.setState({audioModal: false, pageAudioLoading: null})
            }
            style={styles.modal}>
            <View style={styles.modalContainer1}>
              <ScrollView style={styles.modalHeaderLinks}>
                {pageAudioLoading != null && this.state.pageAudioUrl == 0 ? (
                  <View style={styles.audioContainer}>
                    <Text style={styles.translateInfo}>No audio found</Text>
                  </View>
                ) : (
                  <View>
                    {audioUrl && audioUrl.length > 1 && this.state.audioModal && (
                      <TouchableOpacity
                        onPress={() => this.playAudio(audioUrl[0], true)}
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
                      data={this.state.audioModal ? audioUrl : []}
                      ItemSeparatorComponent={this.renderHeader}
                      renderItem={({item, index}) =>
                        this.renderAudioItem(item, index)
                      }
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
              </ScrollView>
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={() =>
                    this.setState({audioModal: false, pageAudioLoading: null})
                  }>
                  <Text style={styles.cancel}>CLOSE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.languageModal }
            hideModalContentWhileAnimating={true}
            animationIn="zoomIn"
            animationOut="zoomOut"
            hasBackdrop={true}
            backdropColor="black"
            backdropOpacity={0.5}
            onBackButtonPress={() => this.setState({languageModal: false})}
            onBackdropPress={() => this.setState({languageModal: false})}
            style={styles.modal}>
            <View style={styles.modalContainer1}>
              <View style={styles.modalHeaderLinks}>
                <View style={styles.audioContainer}>
                  <Text numberOfLines={1} style={styles.translateInfo}>
                    Translate to
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({translatedText: null, languageModal: false})
                  }
                  style={styles.audioContainer}>
                  <Text
                    numberOfLines={1}
                    style={[styles.audioLink, {textAlign: 'center'}]}>
                    Default
                  </Text>
                </TouchableOpacity>
                <FlatList
                  data={LanguageList}
                  ItemSeparatorComponent={this.renderHeader}
                  renderItem={({item, index}) =>
                    this.renderLanguageList(item, index)
                  }
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                />
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.buttonCancel}
                    onPress={() => this.setState({languageModal: false})}>
                    <Text style={styles.cancel}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            isVisible={this.state.searchVisible}
            animationIn={'slideInDown'}
            animationOut={'slideOutUp'}
            onSwipeComplete={() => this.close()}
            hasBackdrop={true}
            backdropOpacity={0.02}
            backdropTransitionOutTiming={0}
            backdropColor={'black'}
            useNativeDriver={true}
            animationInTiming={770}
            animationOutTiming={770}
            hideModalContentWhileAnimating={true}
            style={styles.bottomModal1}>
            <View style={[styles.modal1, {height: 280}]}>
              {this.renderSearchModal()}
            </View>
          </Modal>
          <Modal
            isVisible={this.state.isModalVisible}
            hideModalContentWhileAnimating={true}
            animationIn="zoomIn"
            animationOut="zoomOut"
            useNativeDriver={true}
            animationOutTiming={300}
            onBackButtonPress={() => this.setState({isModalVisible: false})}
            onBackdropPress={() => this.setState({isModalVisible: false})}
            style={styles.modal}>
            <View style={styles.loginModalContainer}>
              <View style={styles.loginModalHeader}>
                <Text style={styles.modalHeaderText}>Login to continue</Text>
                <Text style={styles.modalText}>
                  Registering with the app will enable the user to access the
                  content from any of their devices. Once logged in, the user
                  can participate in all the interactive features of the app
                  like giving their likes, comments...etc
                </Text>
              </View>
              <View style={styles.loginModalFooter}>
                <TouchableOpacity
                  style={[styles.loginButtonCancel, {borderRightWidth: 1}]}
                  onPress={() => this.setState({isModalVisible: false})}>
                  <Text style={styles.cancel}>{I18n.t('CANCEL')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate('Profile') &&
                    this.setState({isModalVisible: false})
                  }
                  style={styles.loginButtonCancel}>
                  <Text style={styles.subscribe}>{I18n.t('Login')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        {this.state.pageAudioUrl && this.state.pageAudioUrl.length > 0 ? (
          <Icon
            name={
              this.state.audioPlayer
                ? 'md-volume-mute-outline'
                : 'md-volume-high-outline'
            }
            onPress={() =>
              this.setState({
                audioModal: this.state.audioPlayer ? false : 'pageAudio',
                isPlayAll: false,
                audioPlayer: false,
                audioLink: '',
              })
            }
            style={styles.soundContainer}
            color={PRIMARY_COLOR}
            size={28}
          />
        ) : null}
      </SafeAreaView>
    );
  }

  render() {
    let bgColors = ['fff', 'fed7b2', 'e1e1e1'];
    const config = {
      velocityThreshold: 0.3,
      directionalOffsetThreshold: 80,
    };
    return Platform.OS == 'ios' ? (
      <GestureRecognizer
        onSwipeDown={this.onSwipeDown}
        onSwipeLeft={this.onSwipeLeft}
        onSwipeRight={this.onSwipeRight}
        config={config}
        style={[
          styles.gestureContainer,
          {backgroundColor: '#' + bgColors[this.state.bgColorIndex]},
        ]}>
        {this.renderContent()}
      </GestureRecognizer>
    ) : (
      <View
        style={[
          styles.gestureContainer,
          {backgroundColor: '#' + bgColors[this.state.bgColorIndex]},
        ]}>
        {this.renderContent()}
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    bookTree: state.bookpage.bookTree,
    isBookTreeLoading: state.bookpage.isBookTreeLoading,
    bookMark: state.bookpage.bookMark,
    isPremium:
      state.userLogin.isPremium ||
      (state.userLogin.user && state.userLogin.user.isPremium),
    user: state.userLogin.user,
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
  bottomModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  bottomPageModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // modalHeaderLinks: {
  //     backgroundColor: '#fff'
  // },
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
  pageContent: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'space-between',
    height: 180,
  },
  bookContent: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'space-between',
    height: 120,
  },
  modalClose: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  modalCloseIcon: {
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    height: '100%',
    marginTop: 10,
  },
  renderItemContainer: {
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 0.1,
    padding: 15,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    backgroundColor: '#fff',
  },
  renderItemSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    textAlign: 'right',
    flex: 1,
  },
  dotIndicatorContainer: {
    width: '90%',
    alignItems: 'flex-end',
  },
  indicator: {
    zIndex: 10,
  },
  iconContainer: {
    width: 25,
    marginLeft: 10,
  },
  backIcon: {
    flex: 1,
  },
  closeIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  closeIcons: {
    alignItems: 'flex-end',
  },
  renderModalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  textInput: {
    width: '20%',
  },
  gotoText: {
    height: 30,
    marginHorizontal: 5,
    paddingVertical: 0,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  invaliedPage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 5,
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
  submitSubContainer1: {
    height: 30,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  gestureContainer: {
    flex: 1,
  },
  submitText: {
    textAlign: 'center',
    color: '#fff',
  },
  subContainer: {
    flex: 1,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    height: height * 0.7,
    width: width,
    zIndex: 10,
    alignSelf: 'center',
    paddingHorizontal: 5,
  },
  activityIndicator: {
    zIndex: 10,
  },
  webErrorContainer: {
    height: '5%',
    position: 'absolute',
    top: '35%',
    backgroundColor: '#FFF',
    zIndex: 10,
    width: '100%',
  },
  webErrorText: {
    textAlign: 'center',
  },
  textTranslated: {
    fontFamily: FONT_MEDIUM,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'justify',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOpacity: 0.1,
    backgroundColor: '#fff',
    borderTopWidth: Platform.OS != 'ios' ? 0.1 : 0,
    borderColor: '#9c9c9c',
    marginHorizontal: -15,
    zIndex: 50,
  },
  emptyContainer: {
    flex: 0.5,
    backgroundColor: 'yellow',
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  bottomSubContainer: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '75%',
    marginHorizontal: 20,
  },
  bookTreeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  pageContainer: {
    borderWidth: 0.5,
    padding: 5,
    borderRadius: 5,
    borderColor: PRIMARY_COLOR,
  },
  modalContain: {
    height: height > 750 ? '20%' : '25%',
    width: '95%',
  },
  bookModalContain: {
    justifyContent: 'center',
    width: width * 0.95,
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  modalContainer1: {
    width: '80%',
    borderRadius: 10,
    backgroundColor: '#fff',
    maxHeight: height * 0.8,
  },
  modalHeaderLinks:{
    maxHeight: height * 0.7,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  errorMessage: {
    textAlign: 'center',
    fontFamily: FONT_BOLD,
    marginTop: 30,
  },
  headerRightContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderColor: '#DDDDDD',
  },
  modalHeader: {
    borderBottomColor: '#DDDDDD',
  },
  content1: {
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  cancel: {
    paddingRight: 25,
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontFamily: FONT_SEMIBOLD,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  audioLink: {
    marginRight: 15,
    flex: 1,
  },
  translateInfo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  audioContainer: {
    width: '100%',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#9c9c9c',
  },
  videoContainer: {
    height: 130,
    marginHorizontal: -15,
    marginBottom: 10,
  },
  audioClose: {
    position: 'absolute',
    right: 5,
    top: -30,
  },
  audioContent: {
    marginLeft: 15,
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  iconContainer2: {
    height: height / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomModal1: {
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
  modal1: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    marginTop: -50,
  },
  content2: {
    paddingHorizontal: 15,
    paddingTop: 35,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    flex: 1,
  },
  buyContainer: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    shadowOpacity: 0.2,
  },
  buyText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    paddingHorizontal: 4,
  },
  searchText1: {
    fontSize: 18,
    fontFamily: FONT_REGULAR,
    color: TITLE_COLOR,
    backgroundColor: '#fff',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: .15,
    // elevation: 1,
    flex: 0.9,
    height: 35,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  renderModalContent: {
    height: 50,
  },
  flexContainer: {
    flex: 1,
  },
  searchTextContent: {
    fontSize: 16,
    flex: 0.5,
    fontFamily: FONT_SEMIBOLD,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchOptionText: {
    marginLeft: 5,
    fontFamily: FONT_REGULAR,
  },
  upIconStyle: {
    alignItems: 'center',
  },
  textInputContainer: {
    elevation: 1,
    margin: 10,
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.15,
    elevation: 1,
  },
  radioSubContainer: {
    marginLeft: 40,
  },
  radioContainerContent: {
    flexDirection: 'row',
  },
  pageResume: {
    fontFamily: FONT_MEDIUM,
    fontSize: 16,
  },
  bookMarkText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  loginModalContainer: {
    width: '80%',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loginModalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    backgroundColor: '#fff',
  },
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: FONT_MEDIUM,
    color: TITLE_COLOR,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  loginModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  dropdownTextStyle: {
    textAlign: 'center',
    fontSize: 15,
  },
  dropdownStyle: {
    height: 97,
    width: 140,
    borderWidth: 1,
    elevation: 0.1,
    shadowOffset: {width: 1, height: 1},
    shadowColor: 'black',
    shadowOpacity: 0.3,
  },
  fontText: {
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: PRIMARY_COLOR,
  },
  soundContainer: {
    position: 'absolute',
    right: 10,
    backgroundColor: '#ffffff00',
  },
});
