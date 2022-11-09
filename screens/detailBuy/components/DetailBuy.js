import React, {Component} from 'react';
import {
  Clipboard,
  View,
  Linking,
  Platform,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_BOLD,
  FONT_LIGHT,
} from '../../../assets/fonts';
import images from '../../../assets/images';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
} from '../../../assets/color';
import Images from '../../../assets/images';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import {connect} from 'react-redux';
import Share from 'react-native-share';
import {
  OFFLINE_DOWNLOAD,
  CHECK_FAVOURITES,
  DOCUMENT_INFOS,
  BOOK_BOUGHT,
  IS_BOOK_BOUGHT,
  APP_INFO,
} from '../../../common/endpoints';
import * as Progress from 'react-native-progress';
import Api from '../../../common/api';
import _ from 'lodash';
import {
  fetchBookDownload,
  resetBookDownload,
  fetchCoverImage,
  fetchIsBookBought,
  fetchPdfDownload,
  fetchCoverImg,
  fetchAudioDownload,
  fetchAudioRemove,
} from '../actions';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import Modal from 'react-native-modal';
import {MaterialIndicator} from 'react-native-indicators';
import I18n from '../../../i18n';
import RNFetchBlob from 'rn-fetch-blob';
import {fetchAddFavourites} from '../../favourites/actions';
import {HeaderBackButton} from 'react-navigation-stack';
import AudioPlay from '../../../components/audioPlay';
import CommentModal from '../../../components/CommentModal';
import Videoplay from '../../../components/videoPlay';
import PdfList from '../../../components/PdfList';
import {fetchLike, fetchCommentModal, resetLikeComment} from '../actions';
import openMap from 'react-native-open-maps';
import debounce from 'lodash/debounce';
import {LanguageList, languageFormat} from '../../../components/languageList';

const {height, width} = Dimensions.get('screen');
var counter = -1;
var audio_Array = [];
var videoPlayLink = '';

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
        <View style={styles.headerContainer}>
          {params.isVideoAvailable && (
            <TouchableOpacity
              onPress={() => params.this.audioPlay(true)}
              style={styles.headerRightContainer}>
              <Feather name="video" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          )}
          {params.isAudioAvailable && (
            <TouchableOpacity
              onPress={() => params.this.audioPlay()}
              style={styles.headerRightContainer}>
              {params.sound ? (
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
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() =>
              params.this.props.navigation.navigate('TimeLine', {
                data: params.this.state.data,
              })
            }>
            <MaterialCommunityIcons
              name={'timeline-clock-outline'}
              color={PRIMARY_COLOR}
              size={28}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() => params.this.share()}>
            <MaterialCommunityIcons
              name={'share-variant'}
              color={PRIMARY_COLOR}
              size={26}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerRightContainer}
            onPress={() => params.this.favourites()}>
            <MaterialIcons
              name={params.isFavouriste ? 'favorite' : 'favorite-border'}
              color={PRIMARY_COLOR}
              size={28}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => params.this.setState({moreInfo: true})}>
            <MaterialIcons
              name={'info-outline'}
              color={PRIMARY_COLOR}
              size={28}
            />
          </TouchableOpacity>
        </View>
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
    let data = this.props.navigation.getParam('data', null);
    let dataKey = [
      'publisher',
      'publishingdate',
      'publisheraddr',
      'researcher',
      'translator',
      'totalpages',
      'subject',
    ];
    let dataValue = data
      ? [
          data.publisher,
          data.publishingdate,
          data.publisheraddr,
          data.researcher,
          data.translator,
          data.totalpages,
          data.subjectName,
        ]
      : '';
    var url = [
      {
        latitude: parseFloat(data && data.latitude),
        longitude: parseFloat(data && data.longitude),
        query: data && data.locationName,
        zoom: 5,
      },
    ];
    // var url = Platform.select({
    //     ios: `${scheme}${label}@${latLng}`,
    //     android: `${scheme}${latLng}(${label})`
    // });
    //  var url = Platform.select({
    //     ios: `${scheme}${label}@${latLng}`,
    //     android: `${scheme}${latLng}(${label})`
    // });
    this.state = {
      percent: 0,
      popularDocumentList: '',
      data: data,
      bookAudios:
        data && data.audioArray ? data.audioArray : data && data.bookAudio,
      languageId: data ? data.language : 1,
      videoBook: data && data.bookVideos,
      isAudioAvailable: data && data.isAudioAvailable,
      isVideoAvailable: data && data.isVideoAvailable,
      bookId: data && data.bookid,
      videoModal: false,
      maxLimit: false,
      isVideo: false,
      dataValue: dataValue,
      dataKey: dataKey,
      audioModal: false,
      base64: null,
      audioLink: '',
      locationUrl: url,
      audioPlayer: false,
      message: '',
      moreInfo: false,
      isModalVisible: false,
      downloadStart: false,
      isFavouriste: null,
      downloadStop: false,
      isLoading: true,
      isBookBought: null,
      isAudioBought: null,
      pdfListModal: false,
      appInfo: [],
      isPlayAll: false,
    };
    this.renderItem = this.renderItem.bind(this);
    this.bookDownload = this.bookDownload.bind(this);
    this.downloadBook = this.downloadBook.bind(this);
    this.downloadCoverImage = this.downloadCoverImage.bind(this);
    this.downloadPdf = this.downloadPdf.bind(this);
    this.downloadAudio = this.downloadAudio.bind(this);
    this.readBook = this.readBook.bind(this);
    this.favourites = this.favourites.bind(this);
    this.audioPlay = this.audioPlay.bind(this);
    this.checkFavourites = this.checkFavourites.bind(this);
    this.renderAudioItem = this.renderAudioItem.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.goBack = this.goBack.bind(this);
    this.share = this.share.bind(this);
    this.getBase64FromUri = this.getBase64FromUri.bind(this);
    this.loader = this.loader.bind(this);
    this.checkBookBought = this.checkBookBought.bind(this);
    this.bookAction = this.bookAction.bind(this);
    this.bookCheck = this.bookCheck.bind(this);
    this.downloadInitiate = this.downloadInitiate.bind(this);
    this.goToMap = this.goToMap.bind(this);
    this.goToDownload = this.goToDownload.bind(this);
    this.fetchAppInfo = this.fetchAppInfo.bind(this);
    this.gotoSubject = this.gotoSubject.bind(this);
    this.bookFetch = this.bookFetch.bind(this);
    this.goToLogin = this.goToLogin.bind(this);
    this.addLike = this.addLike.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.closeVideoModal = this.closeVideoModal.bind(this);
    this.tooglePdfList = this.tooglePdfList.bind(this);
    this.startAudio = this.startAudio.bind(this);
  }

  goBack() {
    this.setState({downloadStop: true});
    if (this.props.navigation.getParam('fromNotification')) {
      this.props.navigation.navigate('HomePage');
    } else {
      if (this.props.navigation.getParam('fromSearch')) {
        this.props.navigation.navigate('Home');
      } else {
        this.props.navigation.goBack();
      }
    }
    this.props.dispatch(resetLikeComment());
  }

  loader() {
    return (
      <View style={styles.loaderContainer}>
        <Placeholder
          Animation={Shine}
          Left={props => (
            <PlaceholderMedia style={[styles.cardImage, {marginRight: 10}]} />
          )}
          Right={props => <PlaceholderMedia style={styles.loaderRight} />}>
          <PlaceholderMedia style={styles.cardImage} />
        </Placeholder>
      </View>
    );
  }

  startAudio(isVideo) {
    console.log('entr');
    if (isVideo) {
      this.setState({isVideo: true, audioModal: true});
    } else {
      this.setState({
        audioModal: this.state.audioLink ? false : true,
        audioPlayer: false,
        audioLink: false,
        isVideo: false,
        isPlayAll: false,
      });
      this.props.navigation.setParams({
        isAudioAvailable: this.state.isAudioAvailable,
        sound: false,
        this: this,
      });
    }
  }

  audioPlay(isVideo) {
    let data = this.state.data;
    if (data.isBoughtIndividually == 1) {
      if (this.state.isAudioBought) {
        this.startAudio(isVideo);
      } else {
        this.props.navigation.navigate('Purchase', {data});
      }
    } else if (data.inapp_free == 1) {
      if (this.props.isPremium) {
        this.startAudio(isVideo);
      } else {
        this.setState({maxLimit: true, message: 'Subscribe to read this book'});
      }
    } else {
        this.startAudio(isVideo);
    }
  }

  share() {
    if (this.state.data && this.state.appInfo) {
      var appInfo = this.state.appInfo;
      var appStoreLink = appInfo.appStoreLink ? appInfo.appStoreLink : '';
      var googleStoreLink = appInfo.googleStoreLink
        ? appInfo.googleStoreLink
        : '';
      var websitelink = appInfo.websitelink ? appInfo.websitelink : '';
      var name = this.state.data.name;
      var author = this.state.data.author;
      var description = this.state.data.addinfo;
      var subBody =
        name +
        '\n\n' +
        author +
        '\n\n' +
        description +
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
        'By Alwaraq Team ';
      var shareOptions = {
        title: this.state.data.name,
        subject: this.state.data.author,
        url: this.state.base64,
        message: subBody,
        // message: this.state.data && this.state.data.name + '\n\n' + this.state.data.description + '\n' + 'By Alwaraq Team '
      };
      Share.open(shareOptions);
      Clipboard.setString(subBody);
    }
  }

  goToLogin(isModalVisible) {
    this.setState({isModalVisible: isModalVisible});
    // setTimeout(() => {
    //     this.setState({ isModalVisible: isModalVisible })
    // }, 550)
  }

  addLike(initialFetch) {
    if (!this.props.isLoading) {
      let formdata = new FormData();
      formdata.append('bookId', this.state.data && this.state.data.bookid);
      if (!initialFetch) {
        formdata.append('action', this.props.isLiked ? 'delete' : 'add');
      }
      this.props.dispatch(fetchLike(formdata));
    }
  }

  getBase64FromUri(uri) {
    RNFetchBlob.fetch('GET', this.state.data && this.state.data.coverImage)
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

  async vimeoPlay(item) {
    if (item && item.videoLink.includes('vimeo')) {
      if (item.videoLink) {
        var url = item.videoLink;
        var regExp = /https:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;
        var match = url.match(regExp);
        if (match) {
          const VIMEO_ID = match[2];
          await fetch(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
            .then(res => res.json())
            .then(
              res =>
                (videoPlayLink =
                  res.request.files.hls.cdns[
                    res.request.files.hls.default_cdn
                  ].url.trim()),
            );
          return videoPlayLink;
        }
        // if (this.state.videoLink != videoLink) {
        //     this.setState({ videoLink: videoLink, videoName: item.videoTitle })
        // }
      }
    } else {
      return videoPlayLink;
    }
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

  async playVideo(item) {
    await this.vimeoPlay(item);
    this.setState({audioModal: false});
    setTimeout(() => {
      this.setState({videoModal: true});
    }, 500);
  }

  renderAudioItem(item, index) {
    return (
      <TouchableOpacity
        onPress={
          this.state.isVideo
            ? () => this.playVideo(item)
            : () => this.playAudio(item?.audioLink ? item.audioLink : item)
        }
        style={styles.audioContainer}>
        {this.state.isVideo ? (
          <Feather
            name="video"
            size={20}
            color={PRIMARY_COLOR}
            style={styles.audioContent}
          />
        ) : (
          <AntDesign
            name="sound"
            size={20}
            color={PRIMARY_COLOR}
            style={styles.audioContent}
          />
        )}
        {this.state.isVideo ? (
          <Text numberOfLines={1} style={styles.audioLink}>
            {'Video part'} :{index + 1}
          </Text>
        ) : (
          <Text numberOfLines={1} style={styles.audioLink}>
            {item?.audioTitle
              ? item.audioTitle
              : 'audio part ' + parseInt(index + 1)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  favourites() {
    if (this.props.user) {
      if (this.state.isFavouriste != null) {
        let actions = this.state.isFavouriste ? 'delete' : 'add';
        this.props.dispatch(
          fetchAddFavourites(
            actions,
            this.state.data && this.state.data.bookid,
          ),
        );
        if (actions == 'add') {
          this.setState({isFavouriste: true});
        } else {
          this.setState({isFavouriste: false});
        }
      }
    } else {
      this.props.navigation.navigate('Login', {goBack: true});
    }
  }

  checkFavourites() {
    if (this.props.user) {
      Api('get', CHECK_FAVOURITES, {
        bookId: this.state.data && this.state.data.bookid,
      }).then(response => {
        if (response) {
          this.setState({isFavouriste: response.isFavouriste});
        } else {
        }
      });
    }
  }

  checkBookBought() {
    if (this.props.user) {
      let formdata = new FormData();
      formdata.append('bookId', this.state.data && this.state.data.bookid);
      Api('post', IS_BOOK_BOUGHT, formdata).then(async response => {
        if (response) {
          this.setState({
            isBookBought: response.isBookBought,
            isAudioBought: response.isAudioBought,
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps, PrevState) {
    if (PrevState.data != this.state.data) {
      this.checkFavourites();
      this.checkBookBought();
    }
    if (prevProps.user != this.props.user) {
      this.checkFavourites();
      this.checkBookBought();
    }
    if (PrevState.isFavouriste != this.state.isFavouriste) {
      this.props.navigation.setParams({
        isFavouriste: this.state.isFavouriste,
      });
    }
  }

  fetchAppInfo() {
    Api('get', APP_INFO, {
      appId: 1,
      language: this.props.locale == 'ar' ? 1 : 2,
    }).then(response => {
      if (response) {
        this.setState({appInfo: response.appInfo});
        // console.log('APP_INFO', response.appInfo.applicationIcon)
        // if (response.appInfo && response.appInfo.applicationIcon) {
        //     this.getBase64FromUri(response.appInfo.applicationIcon)
        // }
        // this.props.dispatch(fetchAppInfo(response.appInfo))
      }
    });
  }

  bookFetch() {
    this.setState({isAudioLoading: true});
    Api('get', DOCUMENT_INFOS, {
      bookId: this.props.navigation.getParam('bookId'),
    }).then(response => {
      if (response.books && response.books[0]) {
        let data = response.books[0];
        this.setState({
          data: response.books[0],
          bookAudios: data?.bookAudio,
          videoBook: data?.bookVideos,
        });
        this.setState({
          dataValue: [
            data.publisher,
            data.publishingdate,
            data.publisheraddr,
            data.researcher,
            data.translator,
            data.totalpages,
            data.subjectName,
          ],
        });
        this.setState({
          locationUrl: [
            {
              latitude: parseFloat(data && data.latitude),
              longitude: parseFloat(data && data.longitude),
              query: data && data.locationName,
              zoom: 5,
            },
          ],
        });
        this.props.navigation.setParams({
          isVideoAvailable:
            response.books &&
            response.books[0] &&
            response.books[0].isVideoAvailable,
          isAudioAvailable:
            response.books &&
            response.books[0] &&
            response.books[0].isAudioAvailable,
        });
      }
    });
  }

  componentDidMount() {
    this.onPressMethod = debounce(this.onPressMethod.bind(this), 500);
    videoPlayLink = '';
    this.addLike(true);
    if (this.props.navigation.getParam('bookId')) {
      this.setState({bookId: this.props.navigation.getParam('bookId')});
      this.bookFetch();
    }
    this.props.dispatch(fetchAudioRemove());
    this.checkBookBought();
    Api('get', DOCUMENT_INFOS, {
      subjectId: this.state.data && this.state.data.subjectId,
      kind: this.state.data && this.state.data.kind,
    }).then(async response => {
      if (response) {
        this.setState({isLoading: false});
        this.setState({
          popularDocumentList: _.without(response.books, this.state.data),
        });
      }
      this.fetchAppInfo();
    });
    this.getBase64FromUri();
    this.props.navigation.setParams({
      isAudioAvailable: this.state.isAudioAvailable,
      isVideoAvailable: this.state.isVideoAvailable,
      this: this,
    });
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      if (this.props.offlineAudio && this.props.offlineAudio.length > 0) {
        this.setState({bookAudios: this.props.offlineAudio});
        this.props.dispatch(fetchAudioRemove());
      }
      this.checkFavourites();
      this.checkBookBought();
    });
  }

  downloadBook(data) {
    this.bookDownload(data, true);
  }

  bookDownload(data, reset, loop) {
    // let bookId=data.bookId
    if (!this.state.downloadStop) {
      let totalpages = this.state.data && this.state.data.totalpages;
      if (!this.props.offlinebook.find(o => o.bookid == data.bookid) || loop) {
        let page = this.props.page ? this.props.page : 1;
        if (reset) {
          this.props.dispatch(resetBookDownload());
          page = 1;
        }
        Api('get', OFFLINE_DOWNLOAD, {book: data.bookid, page: page}).then(
          response => {
            let percent =
              this.props.page / (totalpages / 10) < 1
                ? this.props.page / (totalpages / 10)
                : 1;
            this.setState({percent: percent});
            if (response) {
              this.props.dispatch(fetchBookDownload(response, data.bookid));
              if (this.props.isLastPage == false) {
                this.bookDownload(data, false, true);
              } else {
                // this.downloadCoverImage(data)
                // Api('get', this.props.tempBook[0].coverImageB).then((response) => {
                // let temp= { ...response, imgPath: data.imgPath}
                // console.log('response',response,temp)
                this.props.dispatch(fetchCoverImage(data.imgPath, data.bookid));
                // })
              }
            } else {
              console.log('failed', response);
            }
          },
        );
      }
    }
  }

  onPressMethod = () => {
    this.props.navigation.push('BookList', {data: this.state.data});
  };

  readBook(data) {
      console.log('item',)
    if (
      (data.isBoughtIndividually == 0 && this.props.isPremium) ||
      data.inapp_free == 0 ||
      this.state.isBookBought
    ) {
      this.props.navigation.navigate('BookPage', {
        data: data,
        fromSearch: false,
      });
    } else {
      this.setState({maxLimit: true, message: 'Subscribe to read this book'});
    }
  }

  gotoSubject(item, data) {
    console.log('data', data);
    this.setState({moreInfo: false});
    if (item == 'subject') {
      this.props.navigation.push('BookList', {data: this.state.data});
    }
    if (item == 'authorBooks') {
      this.props.navigation.push('BookList', data);
    }
  }

  renderModalMoreInfo = data => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
      <View style={styles.coverImgContainer}>
        <LinearGradient
          style={styles.card1}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.card1}
            source={
              data && data.coverImage ? {uri: data.coverImage} : Images.default
            }
          />
        </LinearGradient>
      </View>
      <View style={styles.titleContainer}>
        <Text numberOfLines={1} style={styles.nameTexts}>
          {data.name}
        </Text>
        <Text
          onPress={() =>
            this.gotoSubject('authorBooks', {
              authorId: data && data.authorid,
              authorName: data && data.author,
            })
          }
          numberOfLines={1}
          style={[styles.authorNameText, {textDecorationColor: 'red'}]}>
          {data.author}
        </Text>
        <Text
          onPress={() => this.gotoSubject('subject', data)}
          numberOfLines={1}
          style={styles.authorNameText}>
          {data.subjectName}
        </Text>
        <Text numberOfLines={1} style={styles.LanguageText}>
          {LanguageList[parseInt(this.state.languageId) - 1]}
        </Text>
        <TouchableOpacity onPress={() => this.goToMap(this.state.locationUrl)}>
          <MaterialIcons name={'location-on'} color={PRIMARY_COLOR} size={28} />
        </TouchableOpacity>
      </View>
      <View style={[styles.titleContainer]}>
        {this.state.dataKey.map((item, index) => {
          return (
            this.state.dataValue[index] != 'NA' &&
            this.state.dataValue[index] != '2000-01-01' && (
              <View
                style={[
                  styles.ratingContainer,
                  {
                    flexDirection:
                      this.props.locale == 'ar' ? 'row-reverse' : 'row',
                  },
                ]}>
                <Text numberOfLines={1} style={styles.authorNameText1}>
                  {I18n.t(item)} :
                </Text>
                <Text
                  onPress={() => this.gotoSubject(item, data)}
                  numberOfLines={1}
                  style={styles.nameTexts1}>
                  {this.state.dataValue[index]}
                </Text>
              </View>
            )
          );
        })}
        <View style={styles.moreInfoTextContainer}>
          <Text style={styles.moreInfoText1}>{data.addinfo}</Text>
        </View>
      </View>
    </ScrollView>
  );

  closeVideoModal() {
    this.setState({videoModal: false});
    videoPlayLink = '';
  }

  renderVideoModal = () => (
    <View showsVerticalScrollIndicator={false} style={styles.content}>
      <View style={{flex: 1, justifyContent: 'center'}}>
        {videoPlayLink != '' ? (
          <Videoplay
            navigation={this.props.navigation}
            videoLink={videoPlayLink}
          />
        ) : (
          <Text style={{fontFamily: FONT_SEMIBOLD, textAlign: 'center'}}>
            {I18n.t('Something_went_wrong_Try')}
          </Text>
        )}
      </View>
      <View style={styles.modalFooter1}>
        <TouchableOpacity
          style={styles.buttonCancel1}
          onPress={() => this.closeVideoModal()}>
          <Text style={styles.cancel}>{I18n.t('close')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  renderModalContent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalText}>{this.state.message}</Text>
      </View>
      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={styles.buttonCancel}
          onPress={() => this.setState({maxLimit: false})}>
          <Text style={styles.cancel}>Ok</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  renderItem({item}) {
    var memberid = '-' + item.memberid;
    return (
      <TouchableOpacity
        style={[styles.cardRelated, {marginHorizontal: 5}]}
        onPress={() =>
          this.props.navigation.replace('Detailbuy', {data: item})
        }>
        {/* onPress={() => this.setState({ popularDocumentList: _.without(this.state.popularDocumentList, item), data: item, videoBook: item && item.bookVideos, isBookBought: null })}> */}
        <LinearGradient
          style={styles.cardImage}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.cardImage}
            source={item.coverImage ? {uri: item.coverImage} : Images.default}
          />
        </LinearGradient>
        <Text
          style={[
            styles.nameText,
            {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
          ]}
          ellipsizeMode={'middle'}
          numberOfLines={2}>
          {item.memberid == 0 ? item.name : item && item.name.concat(memberid)}
        </Text>
        <View style={styles.prizeContainer}>
          <Text
            style={[
              styles.authorText,
              {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
            ]}
            numberOfLines={2}>
            {item.author}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  bookCheck(data, action, isDownloadCheck, dualoption) {
    if (data.isBoughtIndividually == 1) {
      if (this.state.isBookBought) {
        isDownloadCheck
          ? this.downloadInitiate(data, action)
          : this.bookAction(data, dualoption);
      } else {
        this.setState({maxLimit: true, message: 'You need to Buy this Book'});
      }
    } else if (data.inapp_free == 1) {
      if (this.props.isPremium) {
        isDownloadCheck
          ? this.downloadInitiate(data, action)
          : this.bookAction(data, dualoption);
      } else {
        this.setState({maxLimit: true, message: 'Subscribe to read this book'});
      }
    } else {
      isDownloadCheck
        ? this.downloadInitiate(data, action)
        : this.bookAction(data, dualoption);
    }
  }

  tooglePdfList(action) {
    this.setState({pdfListModal: action});
  }

  bookAction(data, dualoption) {
    if (data.isTextAvailable && !dualoption) {
      this.props.navigation.navigate('BookPage', {
        data: data,
        fromSearch: false,
      });
    } else if (data.isPdfAvailable) {
      this.tooglePdfList(true);
      // console.log('data.bookPDFs',data.bookPDFs)
      // this.props.navigation.navigate('PdfViewer', { data: data.bookPDFs })
    } else if (data.isAudioAvailable) {
      this.audioPlay();
    } else {
      this.setState({moreInfo: true});
    }
  }

  goToMap(data) {
    this.setState({moreInfo: false});
    this.props.navigation.navigate('Map', {data: data});
  }

  downloadCoverImage(data, action) {
    this.setState({percent: 0.01});
    RNFetchBlob.config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      fileCache: true,
      appendExt: 'png',
    })
      .fetch('GET', data.coverImage, {
        //some headers ..
      })
      .then(res => {
        if (action == 'Read_now') {
          let temp = {...data, imgPath: res.path()};
          this.downloadBook(temp);
        } else if (action == 'Read_Pdf') {
          this.downloadPdf(data, res.path());
        } else {
          this.downloadAudio(data, res.path());
        }
      });
  }

  downloadPdf(data, imgPath) {
    RNFetchBlob.config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      fileCache: true,
      appendExt: 'pdf',
    })
      .fetch(
        'GET',
        data.bookPDFs && data.bookPDFs[0] && data.bookPDFs[0].pdfFile,
        {
          //some headers ..
        },
      )
      .progress({count: 20}, (received, total) => {
        this.setState({percent: received / total});
      })
      .then(res => {
        this.props.dispatch(fetchPdfDownload(data, res.path(), imgPath));
        this.setState({percent: 1});
        // the temp file path
        // this.downloadCoverImage(data)
        console.log('The file saved to ', res.path());
      });
  }

  downloadAudio(data, imgPath) {
    counter = parseInt(counter) + 1;
    if (data && data.bookAudio && data.bookAudio.length > 0) {
      RNFetchBlob.config({
        // add this option that makes response data to be stored as a file,
        // this is much more performant.
        fileCache: true,
        appendExt: 'mp3',
      })
        .fetch('GET', data.bookAudio[counter]?.audioLink, {
          //some headers ..
        })
        .progress({count: 10}, (received, total) => {
          let temp = received / total / counter;
          this.setState({
            percent:
              counter / data.bookAudio.length +
              received / total / data.bookAudio.length,
          });
        })
        .then(res => {
          if (counter < data.bookAudio.length) {
            this.downloadAudio(data, imgPath);
            audio_Array = audio_Array.concat(res.path());
            if (audio_Array.length == data.bookAudio.length) {
              this.props.dispatch(
                fetchAudioDownload(data, audio_Array, imgPath),
              );
            }
          }
        });
    }
  }

  downloadInitiate(data, action) {
    if (!this.props.offlinebook.find(o => o.bookid == data.bookid)) {
      if (this.props.offlinebook.length < 5) {
        this.downloadCoverImage(data, action);
      } else {
        this.setState({
          maxLimit: true,
          message:
            'You can only download maximum 5 books. please delete any books from download to add new',
        });
      }
    } else if (this.props.offlinebook.find(o => o.bookid == data.bookid)) {
      this.props.navigation.navigate('Downloads', {
        onReturn: item => {
          this.setState({
            bookAudios:
              item && item.audioArray ? item.audioArray : this.state.bookAudios,
          });
        },
      });
    }
  }

  goToDownload(data, action) {
    if (this.state.percent == 0 || this.state.percent == 1) {
      this.bookCheck(data, action, true);
      // if (!this.props.offlinebook.find(o => o.bookid == data.bookid)) {
      //     if (this.props.offlinebook.length < 5) {
      //         console.log('haha', this.props.offlinebook.length)
      //         this.downloadCoverImage(data, action)
      //     }
      //     else
      //         this.setState({ maxLimit: true, message: 'You can only download maximum 5 books. please delete any books from download to add new' })
      // }
      // else if (this.props.offlinebook.find(o => o.bookid == data.bookid)) {
      //     this.props.navigation.navigate('Downloads', {
      //         onReturn: (item) => {
      //             this.setState({ bookAudios: item && item.audioArray ? item.audioArray : this.state.bookAudios })
      //         }
      //     })
      // }
    }
  }

  render() {
    let data = this.state.data;
    let dualoption =
      data?.isPdfAvailable && data?.isTextAvailable ? true : false;
    let price = 0;
    if (data) {
      price =
        data.price != 0
          ? data.price
          : data.hardcoverprice != 0
          ? data.hardcoverprice
          : data.hardcoverAndPdfPrice;
      var action = '';
      var memberid = '-' + this.state.data.memberid;
      if (data.isTextAvailable) {
        action = 'Read_now';
      } else if (data.isPdfAvailable) {
        action = 'Read_Pdf';
      } else if (data.isAudioAvailable) {
        action = 'Play_audio';
      } else {
        action = 'summary';
      }
    }
    return data ? (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.ScrollContainer}>
          <View style={styles.subContainer}>
            <View style={styles.coverImgContainer}>
              <Image
                style={styles.card}
                resizeMode="contain"
                source={
                  data.coverImage ? {uri: data.coverImage} : Images.default
                }
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.nameTexts}>
                {data.memberid == 0 ? data.name : data.name.concat(memberid)}
              </Text>
              <Text
                onPress={() =>
                  this.props.navigation.push('AuthorDetail', {
                    authorId: data && data.authorid,
                  })
                }
                numberOfLines={1}
                style={[
                  styles.authorNameText,
                  {textDecorationColor: TITLE_COLOR, color: TITLE_COLOR},
                ]}>
                {data.author}
              </Text>
              <Text
                onPress={() => this.gotoSubject('subject', data)}
                numberOfLines={1}
                style={styles.authorNameText}>
                {data.subjectName}
              </Text>
              {data.isBoughtIndividually == 1 && (
                <View>
                  {this.state.isBookBought ? (
                    <Text style={styles.prizeText1}>
                      You Have Already Purchased This Book
                    </Text>
                  ) : (
                    <Text style={styles.prizeText1}>
                      {data.inapp_free == 0
                        ? I18n.t('Free_book')
                        : I18n.t('Price') + ': $' + price}
                    </Text>
                  )}
                </View>
              )}
              <View style={{flexDirection: 'row'}}>
                {data.isBoughtIndividually == 1 &&
                  data.inapp_free != 0 &&
                  (this.state.isBookBought != null || !this.props.user) &&
                  !this.state.isBookBought && (
                    <TouchableOpacity
                      style={styles.subscribeContainer}
                      onPress={
                        this.props.user
                          ? () =>
                              this.props.navigation.navigate('Purchase', {data})
                          : () =>
                              this.props.navigation.navigate('Login', {
                                goBack: true,
                              })
                      }>
                      <Text style={styles.prizeText}>
                        {I18n.t('Buy_this_Book')}
                      </Text>
                    </TouchableOpacity>
                  )}
                {data.isBoughtIndividually == 0 && (
                  <TouchableOpacity
                    style={styles.subscribeContainer}
                    onPress={() =>
                      !this.props.isPremium &&
                      this.props.navigation.navigate('Subscribe')
                    }>
                    <Text style={styles.prizeText}>
                      {!this.props.isPremium
                        ? I18n.t('Subscribe')
                        : I18n.t('Subscribed')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={styles.statusContainer}>
                <Text numberOfLines={5} style={styles.statusText}>
                  {data.status}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.likeCommentContainer}>
              <TouchableOpacity
                onPress={
                  this.props.user
                    ? () => this.addLike()
                    : () => this.setState({isModalVisible: true})
                }
                style={styles.likeContainer}>
                <Text
                  style={[
                    styles.likeCountText,
                    {color: this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'},
                  ]}>
                  {this.props.totalLikes ? this.props.totalLikes : 0}
                </Text>
                <AntDesign
                  name={this.props.isLiked ? 'like1' : 'like2'}
                  size={22}
                  color={this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'}
                />
                <Text
                  style={[
                    styles.commentText,
                    {color: this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'},
                  ]}>
                  {I18n.t('like')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.props.dispatch(fetchCommentModal(true))}
                style={styles.likeContainer}>
                <Text style={styles.likeCountText}>
                  {this.props.totalComments ? this.props.totalComments : 0}
                </Text>
                <MaterialCommunityIcons
                  name="comment-outline"
                  size={22}
                  color="#9c9c9c"
                />
                <Text style={styles.commentText}>{I18n.t('comments')}</Text>
              </TouchableOpacity>
            </View>
            {this.props.modalAction && (
              <CommentModal
                goToLogin={this.goToLogin}
                modalAction={this.props.modalAction}
                movieId={this.state.bookId}
                book={data}
                navigation={this.props.navigation}
                modalClose={this.modalClose}
              />
            )}
            {!this.props.modalAction && (
              <CommentModal
                goToLogin={this.goToLogin}
                modalAction={this.props.modalAction}
                movieId={this.state.bookId}
                book={data}
                navigation={this.props.navigation}
                modalClose={this.modalClose}
              />
            )}
            {/* <CommentModal goToLogin={this.goToLogin} modalAction={this.props.modalAction} movieId={this.state.bookId} book={data} /> */}
          </View>
          <Text
            style={[
              styles.relatedBooks,
              {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
            ]}>
            {I18n.t('Related_books')}
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
          {!this.state.isLoading && this.state.popularDocumentList != '' ? (
            <View>
              <FlatList
                horizontal={true}
                style={styles.flatlistStyle}
                showsHorizontalScrollIndicator={false}
                data={this.state.popularDocumentList}
                renderItem={this.renderItem}
                inverted={this.props.locale == 'ar' ? true : false}
                extraData={this.state}
                ListFooterComponent={
                  <TouchableOpacity
                    style={[
                      styles.cardImage,
                      {backgroundColor: '#ECECEC', marginLeft: 5},
                    ]}
                    onPress={() => this.onPressMethod()}>
                    <Text style={styles.nameText} numberOfLines={2}>
                      {I18n.t('see_more')}
                    </Text>
                  </TouchableOpacity>
                }
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
          ) : (
            <View
              style={{
                flexDirection:
                  this.props.locale == 'ar' ? 'row-reverse' : 'row',
              }}>
              {this.loader()}
            </View>
          )}
          <View style={styles.emptyContainer1} />
        </ScrollView>
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
              onPress={() => this.audioPlay()}
              size={24}
              color={PRIMARY_COLOR}
            />
          </View>
        )}
        {this.state.percent > 0 && this.state.percent < 1 && (
          <View style={styles.progressContainer}>
            <Progress.Bar
              progress={this.state.percent}
              width={width + 5}
              color={PRIMARY_COLOR}
              borderColor={'#fff'}
              height={6}
            />
          </View>
        )}
        <View style={styles.footerContainer}>
          <View style={styles.footer}>
            <View style={styles.footerPrizeContainer}>
              <TouchableOpacity
                onPress={
                  this.props.user
                    ? () => this.addLike()
                    : () => this.setState({isModalVisible: true})
                }
                style={styles.footerRatingContainer}>
                <Text
                  style={[
                    styles.likeCountText,
                    {color: this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'},
                  ]}>
                  {this.props.totalLikes ? this.props.totalLikes : 0}
                </Text>
                <AntDesign
                  name={this.props.isLiked ? 'like1' : 'like2'}
                  size={22}
                  color={this.props.isLiked ? PRIMARY_COLOR : '#9c9c9c'}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* {action=='Read_now'&& */}
          {action == 'Read_now' || action == 'Read_Pdf' ? (
            <TouchableOpacity
              style={styles.buyContainer}
              onPress={() => this.goToDownload(data, action)}>
              <AntDesign name={'download'} color={'#515456'} size={18} />
              {this.state.percent > 0 && this.state.percent < 1 ? (
                <Text style={styles.percentContainer}>
                  {Math.floor(this.state.percent * 100)}%
                </Text>
              ) : (
                <Text style={styles.downloadText}>
                  {!this.props.offlinebook.find(o => o.bookid == data.bookid)
                    ? I18n.t('Download')
                    : I18n.t('Downloads')}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={{width: 65}} />
          )}
          {dualoption && (
            <TouchableOpacity
              style={styles.buyContainer2}
              onPress={() => this.bookCheck(data, null, null, true)}>
              <AntDesign name={'pdffile1'} color={'#fff'} size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.buyContainer1, {width: dualoption ? '30%' : '40%'}]}
            onPress={() => this.bookCheck(data)}>
            {action == 'Read_Pdf' && (
              <AntDesign
                name={'pdffile1'}
                style={{marginRight: 8}}
                color={'#fff'}
                size={26}
              />
            )}
            <Text style={styles.buyText}>
              {action == 'Read_Pdf' ? I18n.t('Read_now') : I18n.t(action)}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          isVisible={this.state.maxLimit}
          hideModalContentWhileAnimating={true}
          animationIn="zoomIn"
          animationOut="zoomOut"
          useNativeDriver={true}
          animationOutTiming={300}
          onBackButtonPress={() => this.setState({maxLimit: false})}
          onBackdropPress={() => this.setState({maxLimit: false})}
          style={styles.modal}>
          <View style={styles.modalContainer}>{this.renderModalContent()}</View>
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
            {!this.state.isVideo &&
              this.state.bookAudios &&
              this.state.bookAudios.length == 0 && (
                <Text style={styles.audioInfoText}>No Audios Found</Text>
              )}
            <ScrollView style={styles.modalHeaderLinks}>
              {!this.state.isVideo &&
                this.state.bookAudios &&
                this.state.bookAudios.length > 1 && (
                  <TouchableOpacity
                    onPress={() =>
                      this.playAudio(
                        this.state.bookAudios[0]?.audioLink
                          ? this.state.bookAudios[0]?.audioLink
                          : this.state.bookAudios[0],
                        true,
                      )
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
                data={
                  this.state.isVideo
                    ? this.state.videoBook
                    : this.state.bookAudios
                }
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
        <Modal
          isVisible={this.state.moreInfo}
          hideModalContentWhileAnimating={true}
          animationIn="zoomIn"
          animationOut="zoomOut"
          useNativeDriver={true}
          hasBackdrop={true}
          backdropColor="black"
          backdropTransitionOutTiming={0}
          backdropOpacity={0.5}
          onBackButtonPress={() => this.setState({moreInfo: false})}
          onBackdropPress={() => this.setState({moreInfo: false})}
          style={styles.modal}>
          <View style={styles.modalStyle}>
            {this.renderModalMoreInfo(this.state.data)}
          </View>
        </Modal>
        <Modal
          isVisible={this.state.videoModal}
          hideModalContentWhileAnimating={true}
          animationIn="zoomIn"
          animationOut="zoomOut"
          useNativeDriver={true}
          hasBackdrop={true}
          backdropColor="black"
          backdropTransitionOutTiming={0}
          backdropOpacity={0.5}
          onBackButtonPress={() => this.setState({videoModal: false})}
          onBackdropPress={() => this.setState({videoModal: false})}
          style={styles.modal}>
          <View style={[styles.modalStyle, {height: '80%'}]}>
            {this.renderVideoModal()}
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Login to continue</Text>
              <Text style={styles.modalText}>
                Registering with the app will enable the user to access the
                content from any of their devices. Once logged in, the user can
                participate in all the interactive features of the app like
                giving their likes, comments...etc
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.buttonCancel, {borderRightWidth: 1}]}
                onPress={() => this.setState({isModalVisible: false})}>
                <Text style={styles.cancel}>{I18n.t('CANCEL')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('Profile') &&
                  this.setState({isModalVisible: false})
                }
                style={styles.buttonCancel}>
                <Text style={styles.subscribe}>{I18n.t('Login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <PdfList
          pdfListModal={this.state.pdfListModal}
          data={data.bookPDFs}
          tooglePdfList={this.tooglePdfList}
          navigation={this.props.navigation}
        />
      </SafeAreaView>
    ) : (
      <MaterialIndicator color={PRIMARY_COLOR} size={20} />
    );
  }
}

const mapStateToProps = state => {
  return {
    offlinebook: state.offlinebook.offlinebook,
    isLastPage: state.offlinebook.isLastPage,
    page: state.offlinebook.page,
    offlinebook: state.offlinebook.offlinebook,
    offlineAudio: state.offlinebook.offlineAudio,
    tempBook: state.offlinebook.tempBook,
    isPremium:
      state.userLogin.isPremium ||
      (state.userLogin.user && state.userLogin.user.isPremium),
    user: state.userLogin.user,
    appInfo: state.dashboard.appInfo,
    locale: state.userLogin.locale,
    modalAction: state.offlinebook.modalAction,
    isLiked: state.offlinebook.isLiked,
    totalLikes: state.offlinebook.totalLikes,
    totalComments: state.offlinebook.totalComments,
    isLoading: state.offlinebook.isLoading,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  subContainer: {},
  ScrollContainer: {
    flex: 10,
    marginHorizontal: 10,
    marginTop: 10,
  },
  coverImgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    height: height / 3.5,
    width: height / 4.5,
    borderRadius: 15,
    marginBottom: 4,
  },
  card1: {
    height: height / 8,
    width: height / 8,
    borderRadius: 15,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeContainer: {
    marginHorizontal: 5,
    padding: 5,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  prizeTextContainer: {
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeTextContainer1: {
    padding: 3,
    width: 70,
    borderRadius: 20,
    backgroundColor: '#F4E7E7',
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  prizeText: {
    fontSize: 17,
    color: '#fff',
    fontFamily: FONT_REGULAR,
    alignSelf: 'center',
  },
  prizeText1: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
  },
  ratingText: {
    marginHorizontal: 10,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 15,
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 100,
    marginBottom: 10,
  },
  cardGrid: {
    width: 121,
    height: 176,
    paddingHorizontal: 5,
  },
  cardRelated: {
    width: 130,
    borderRadius: 0,
    marginBottom: 4,
  },
  cardImage: {
    height: 160,
    width: 130,
    borderRadius: 4,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_REGULAR,
  },
  authorText: {
    fontSize: 17,
    opacity: 0.6,
    fontSize: 13,
    fontFamily: FONT_REGULAR,
    marginBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  authorNameText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONT_REGULAR,
    opacity: 0.6,
    color: '#0000EE',
    textDecorationLine: 'underline',
    width: '80%',
    marginVertical: 5,
  },
  LanguageText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONT_REGULAR,
    color: '#9c9c9c',
    width: '80%',
    marginBottom: 5,
  },
  nameTexts: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: FONT_SEMIBOLD,
    width: '80%',
    marginVertical: -4,
  },
  authorNameText1: {
    width: '50%',
    textAlign: 'right',
    fontSize: 15,
    fontFamily: FONT_LIGHT,
    opacity: 0.6,
  },
  nameTexts1: {
    width: '50%',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONT_REGULAR,
    marginVertical: -4,
  },
  statusContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  statusText: {
    fontFamily: FONT_REGULAR,
    fontSize: 14,
    textAlign: 'center',
  },
  relatedBooks: {
    fontSize: 18,
    fontFamily: FONT_MEDIUM,
    marginTop: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    elevation: 10,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: -4},
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footer: {
    alignItems: 'center',
    flex: 1,
  },
  footerPrizeContainer: {
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  footerTextContainer: {
    flexDirection: 'row',
  },
  footerPrizeText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    marginLeft: 20,
  },
  footerBookText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    color: '#605F5F',
  },
  footerRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  footerRatingText: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    marginLeft: 5,
    marginTop: -3,
  },
  footerRatingCount: {
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    color: '#605F5F',
    marginTop: -3,
  },
  buyContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    margin: 10,
    // shadowOpacity: .2
  },
  buyContainer1: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 10,
    shadowOpacity: 0.2,
  },

  buyContainer2: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    flexDirection: 'row',
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 10,
    shadowOpacity: 0.2,
  },
  buyText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    backgroundColor: '#fff',
  },
  modalText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  buttonCancel: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderColor: '#DDDDDD',
  },
  buttonCancel1: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  buttonModal: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  progressContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 8,
    marginBottom: -2,
  },
  infoText: {
    fontFamily: FONT_REGULAR,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  infoText1: {
    marginBottom: 8,
    fontFamily: FONT_MEDIUM,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  infoText2: {
    fontFamily: FONT_SEMIBOLD,
    color: '#fff',
    paddingVertical: 5,
  },
  emptyContainer1: {
    height: 50,
  },
  indicatorStyle: {
    elevation: 20,
  },
  percentContainer: {
    fontSize: 10,
    color: '#515456',
    marginTop: 4,
    fontFamily: FONT_REGULAR,
  },
  downloadText: {
    fontSize: 10,
    color: '#515456',
    marginTop: 4,
    fontFamily: FONT_REGULAR,
  },
  headerRightContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
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
  videoContainer: {
    height: 130,
    marginBottom: 10,
  },
  audioClose: {
    position: 'absolute',
    right: 5,
    top: -30,
  },
  modalStyle: {
    width: width * 0.9,
    height: '60%',
    shadowOpacity: 0.1,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    width: width * 0.9,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  moreInfoText: {
    textAlign: 'center',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontFamily: FONT_REGULAR,
  },
  moreInfoText1: {
    textAlign: 'right',
    fontSize: 15,
    fontFamily: FONT_LIGHT,
    marginTop: 5,
  },
  moreInfoTextContainer: {
    marginTop: 15,
  },
  loaderRight: {
    width: 0,
    height: 0,
  },
  loaderContainer: {
    backgroundColor: '#fff',
  },
  headerIcon: {
    height: 25,
    width: 25,
  },
  likeCommentContainer: {
    height: 50,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDEDED',
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeCountText: {
    fontSize: 16,
    color: '#9c9c9c',
    fontFamily: FONT_REGULAR,
    marginRight: 10,
  },
  commentText: {
    fontSize: 16,
    color: '#9c9c9c',
    fontFamily: FONT_REGULAR,
    marginLeft: 5,
    marginRight: 8,
  },
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: FONT_MEDIUM,
    color: TITLE_COLOR,
  },
  audioInfoText: {
    backgroundColor: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
});
