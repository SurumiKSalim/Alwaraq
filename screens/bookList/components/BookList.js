import * as React from 'react';
import {
  Text,
  View,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  PRIMARY_COLOR,
  TITLE_COLOR,
  SECONDARY_COLOR,
} from '../../../assets/color';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {ScrollView} from 'react-native-gesture-handler';
import Images from '../../../assets/images';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {resetBookList, fetchBookList, fetchSearch} from '../actions';
import {connect} from 'react-redux';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Search from '../../../components/Search';
import Modal from 'react-native-modal';
import I18n from '../../../i18n';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MaterialIndicator} from 'react-native-indicators';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ModalDropdown from 'react-native-modal-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {HeaderBackButton} from 'react-navigation-stack';
import {LanguageList} from '../../../components/languageList';
import {fetchSearchResult, resetSearchResult} from '../../searchPage/actions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {height, width} = Dimensions.get('screen');
const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};
var encoded = '';

const reportOptions = [
  {label: 'Library', index: 1},
  {label: 'Book_Names', index: 2},
  {label: 'authors', index: 3},
];

export class App extends React.Component {
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
        <View style={styles.headerView}>
          <Image
            style={styles.logo}
            source={Images.headerName}
            resizeMode="contain"
          />
        </View>
      ),
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center',
        color: TITLE_COLOR,
        fontSize: 30,
        fontFamily: FONT_SEMIBOLD,
        fontWeight: 'normal',
      },
      headerStyle: {
        borderBottomWidth: 0,
        marginRight: 15,
        elevation: 0,
        height: 60,
      },
      headerRight: (
        <View style={styles.headerRightContainer}>
          <Text style={styles.headerText}>
            {LanguageList[params?.bookLanguage]?.slice(0, 2)}
          </Text>
          {/* {params.this && params.this.props.navigation.getParam('fromLibrary') && */}
          <ModalDropdown
            options={LanguageList}
            scrollEnabled={true}
            style={styles.drop}
            dropdownStyle={styles.dropdown}
            dropdownTextStyle={styles.dropDownText}
            dropdownTextHighlightStyle={styles.highlighted}
            onSelect={(idx, value) =>
              params.this._dropdownOnSelect(idx, value)
            }>
            <View style={styles.category}>
              <FontAwesome5 name="globe-asia" color={PRIMARY_COLOR} size={25} />
            </View>
          </ModalDropdown>
          {/* {params.this && params.this.props.navigation.getParam('fromLibrary') && */}
          <TouchableOpacity
            style={{marginLeft: 8}}
            onPress={() => params.this.setState({modalVisible: true})}>
            <FontAwesome name="search" color={PRIMARY_COLOR} size={28} />
          </TouchableOpacity>
        </View>
      ),
    };
  };

  constructor(props) {
    super(props);
    let data = this.props.navigation.getParam('data');
    this.state = {
      subjuctIndex: null,
      authorId: this.props.navigation.getParam('authorId')
        ? this.props.navigation.getParam('authorId')
        : this.props.authorId,
      modalVisible: false,
      searchText: '',
      isSearchPage: false,
      bookLanguage: this.props.navigation.getParam('isJapanese')
        ? 5
        : undefined,
      onLoadLoader: false,
      listType: this.props.navigation.getParam('listType'),
      kind: data && data.kind,
      firstRadioValue: 1,
      isAudioAvailable: this.props.navigation.getParam('isAudioAvailable'),
      subjectId: this.props.navigation.getParam('subjectId')
        ? this.props.navigation.getParam('subjectId')
        : data?.subjectId,
      subjectName: this.props.navigation.getParam('authorName')
        ? this.props.navigation.getParam('authorName')
        : data && data.subjectName
        ? data.subjectName
        : this.props.navigation.getParam('listType') == 'free'
        ? I18n.t('FREE_BOOKS')
        : this.props.navigation.getParam('isJapanese')
        ? I18n.t('Book')
        : I18n.t('New_Set_Books'),
    };
    this.renderItem = this.renderItem.bind(this);
    this.loader = this.loader.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onReport = this.onReport.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this._dropdownOnSelect = this._dropdownOnSelect.bind(this);
  }

  fetchData(bookLanguage) {
    this.setState({isSearchPage: false, bookLanguage: bookLanguage});
    this.props.dispatch(resetBookList());
    this.props.dispatch(
      fetchBookList(
        this.state.subjectId,
        this.state.kind,
        this.props.locale == 'ar' ? 1 : 2,
        bookLanguage ? bookLanguage : this.state.bookLanguage,
        this.state.listType,
        this.state.authorId,
        this.state.isAudioAvailable,
      ),
    );
  }

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
      bookLanguage: this.state.bookLanguage,
    });
    if (this.props.navigation.getParam('isJapanese')) {
      this._dropdownOnSelect(4);
    } else {
      this.fetchData();
    }
  }

  onSearch() {
    if (this.state.searchText !== '') {
      let language = this.props.locale == 'ar' ? 1 : 2;
      this.setState({modalVisible: false, isSearchPage: true});
      var base64 = require('base-64');
      var utf8 = require('utf8');
      var text = this.state.searchText;
      var bytes = utf8.encode(text);
      encoded = base64.encode(bytes);
      console.log('firstRadioValue',this.state.firstRadioValue)
      if (this.state.firstRadioValue==1) {
        this.props.dispatch(resetSearchResult());
        this.props.dispatch(
          fetchSearchResult(
            0,
            1,
            1,
            encoded,
            1,
            null,
            null,
            this.state.subjectId,
            this.state.listType,
            this.state.authorId,
            this.state.bookLanguage,
            this.state.isAudioAvailable,
          ),
        );
        this.props.navigation.push('SearchPage', {
          firstRadioValue: 0,
          secondRadioValue: 1,
          wordFormRadio: 1,
          encoded: encoded,
          subRadioValue: 1,
          periodId: null,
          subjectId:this.state.subjectId,
          listType:this.state.listType,
          authorId:this.state.authorId,
          bookLanguage:this.state.bookLanguage,
          isAudioAvailable:this.state.isAudioAvailable,
          fromBookList:true
        });
      } else {
        this.props.dispatch(resetBookList());
        this.props.dispatch(
          fetchSearch(
            encoded,
            this.state.subjectId,
            language,
            this.state.listType,
            this.state.authorId,
            this.state.bookLanguage,
            this.state.firstRadioValue,
            this.state.isAudioAvailable,
          ),
        );
      }
    }
  }

  onReport(item) {
    if (this.state.firstRadioValue != item) {
      this.setState({firstRadioValue: item});
    }
  }

  _dropdownOnSelect(idx, value) {
    console.log('idx', idx);
    this.setState({bookLanguage: parseInt(idx) + 1});
    this.fetchData(parseInt(idx) + 1);
    this.props.navigation.setParams({
      this: this,
      bookLanguage: idx,
    });
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

  onLoad() {
    let language = this.props.locale == 'ar' ? 1 : 2;
    this.setState({onLoadLoader: true});
    if (!this.props.isLastPage) {
      if (!this.state.isSearchPage) {
        this.props.dispatch(
          fetchBookList(
            this.state.subjectId,
            this.state.kind,
            this.props.locale == 'ar' ? 1 : 2,
            this.state.bookLanguage,
            this.state.listType,
            this.state.authorId,
          ),
        );
      } else {
        this.props.dispatch(
          fetchSearch(
            encoded,
            this.state.subjectId,
            language,
            this.state.listType,
            this.state.authorId,
            this.state.bookLanguage,
          ),
        );
      }
    }
  }

  renderItem({item}) {
    return (
      <TouchableOpacity
        style={styles.cardGrid}
        onPress={() =>
          this.props.navigation.push('Detailbuy', {
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
          {item.memberid == 0 ? item.name : item.name.concat(item.memberid)}
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
            onPress={() =>
              item.inapp_free == 0
                ? this.props.navigation.push('Detailbuy', {
                    data: item,
                    fromPopular: true,
                  })
                : this.props.navigation.navigate('Subscribe')
            }
            style={[
              styles.prizeTextContainer,
              {
                width: I18n.locale == 'ar' ? 80 : 70,
                backgroundColor: Platform.OS == 'ios' ? '#F4E7E7' : '#fff',
              },
            ]}>
            <Text style={styles.prizeText}>
              {item.inapp_free == 0 ? I18n.t('Free') : I18n.t('PREMIUM')}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  renderModal = () => (
    <SafeAreaView style={styles.content}>
      {reportOptions.map((item, index) => {
        return (
          <TouchableOpacity
            onPress={() => this.onReport(item.index)}
            style={[
              styles.radioContainer,
              {
                flexDirection:
                  this.props.locale == 'ar' ? 'row-reverse' : 'row',
                marginHorizontal: 20,
              },
            ]}>
            <MaterialCommunityIcons
              name={
                this.state.firstRadioValue != item.index
                  ? 'circle-outline'
                  : 'circle-slice-8'
              }
              color={PRIMARY_COLOR}
              size={24}
            />
            <Text style={styles.searchOptionText}>{I18n.t(item.label)}</Text>
          </TouchableOpacity>
        );
      })}
      <View style={[styles.textInputContainer, {height: 40}]}>
        <TextInput
          style={styles.searchText}
          placeholder={I18n.t('Search')}
          ref={ref => (this.textInputRef = ref)}
          placeholderTextColor={'#9c9c9c'}
          bufferDelay={5}
          onChangeText={text => this.setState({searchText: text})}
        />
        <View>
          <TouchableOpacity
            style={styles.buyContainer}
            onPress={() => this.onSearch()}>
            <Text style={styles.buyText}>{I18n.t('Search')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.upIconStyle}>
        <TouchableOpacity onPress={() => this.setState({modalVisible: false})}>
          <Ionicons name="ios-arrow-up" size={30} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
            ]}>
            {this.props.authorId ? I18n.t('Book') : this.state.subjectName}
            <Text style={styles.subTitle}>
              {' '}
              ({this.props.total ? this.props.total : 0})
            </Text>
          </Text>
          <View
            style={[
              styles.emptyContainer,
              {
                alignSelf:
                  this.props.locale == 'ar' ? 'flex-end' : 'flex-start',
                width: this.state.subjectName
                  ? this.state.subjectName.length * 10
                  : 82,
              },
            ]}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={1}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={this.props.isLoading}
              onRefresh={() => this.fetchData()}
              colors={['#F47424']}
            />
          }
          onMomentumScrollEnd={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              this.onLoad();
            }
          }}>
          <View style={styles.FlatListContainer2}>
            {this.props.bookList &&
              (!this.props.isLoading || this.state.onLoadLoader) && (
                <FlatList
                  style={styles.flatlistStyle}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  data={this.props.bookList}
                  renderItem={this.renderItem}
                  numColumns={2}
                  extraData={this.state}
                  keyExtractor={(item, index) => index.toString()}
                />
              )}
            {this.props.isLoading && !this.state.onLoadLoader && (
              <View>
                {this.loader()}
                {this.loader()}
                {this.loader()}
                {this.loader()}
              </View>
            )}
            {!this.props.isLastPage &&
              this.props.isLoading &&
              this.state.onLoadLoader && (
                <MaterialIndicator color={PRIMARY_COLOR} size={20} />
              )}
            {!this.props.isLoading &&
              this.props.bookList &&
              this.props.bookList.length === 0 && (
                <View style={styles.errorTextContainer}>
                  <AntDesign name="frown" color={'#ECECEC'} size={50} />
                  <Text style={styles.infoText}>
                    {I18n.t('No_books_found')}
                  </Text>
                </View>
              )}
          </View>
        </ScrollView>
        <Search navigation={this.props.navigation} />
        <Modal
          isVisible={this.state.modalVisible}
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
          style={styles.bottomModal}>
          <View
            style={[styles.modal, {height: Platform.OS == 'ios' ? 240 : 220}]}>
            {this.renderModal()}
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    bookList: state.booklist.bookList,
    total: state.booklist.total,
    isLoading: state.booklist.isLoading,
    isLastPage: state.booklist.isLastPage,
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
    fontSize: 13,
    fontFamily: FONT_REGULAR,
    // width: '55%',
    flex: 1,
  },
  prizeText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontFamily: FONT_SEMIBOLD,
    backgroundColor: '#F4E7E7',
    width: '100%',
    borderRadius: 20,
    textAlign: 'center',
  },
  prizeTextContainer: {
    padding: 3,
    width: 70,
    borderRadius: 20,
    // backgroundColor: '#F4E7E7',
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
    backgroundColor: PRIMARY_COLOR,
    margin: -5,
    width: width / 6,
    marginLeft: width / 26,
    height: 3,
    zIndex: 1,
  },
  tabStyle: {
    height: 35,
    justifyContent: 'flex-start',
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: '#fff',
    marginRight: '50%',
  },
  bottomModal: {
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
  content: {
    paddingVertical: 15,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    justifyContent: 'flex-end',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
    flex: 1,
  },
  searchText: {
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
    justifyContent: 'center',
    height: height / 1.5,
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
    textAlign: 'left',
    width: '100%',
    fontFamily: FONT_SEMIBOLD,
    justifyContent: 'flex-start',
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 82,
    marginBottom: 10,
  },
  headerView: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  // drop: {
  //     width: 120,
  //     marginVertical: 5,
  //     backgroundColor: '#ededed',
  // },
  dropdown: {
    right: 15,
    height: 140,
    width: 130,
  },
  dropDownText: {
    marginVertical: 5,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    color: SECONDARY_COLOR,
    opacity: 0.9,
    textAlign: 'center',
  },
  highlighted: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    color: SECONDARY_COLOR,
  },
  headerRightContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: FONT_MEDIUM,
    color: PRIMARY_COLOR,
    fontSize: 18,
    marginRight: 8,
  },
  modal: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    marginTop: -50,
    height: 180,
  },
  // content: {
  //     marginHorizontal: 15,
  //     paddingTop: 35,
  //     borderBottomRightRadius: 25,
  //     borderBottomLeftRadius: 25,
  //     // borderTopWidth: 1,
  //     // borderLeftWidth: 1,
  //     // borderRightWidth: 1,
  //     borderColor: '#DDDDDD',
  //     flex: 1,
  // },
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
  upIconStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontFamily: FONT_BOLD,
  },
  titleContainer: {
    backgroundColor: '#fff',
  },
  radioContainer: {
    alignItems: 'center',
  },
  searchOptionText: {
    marginHorizontal: 5,
    fontFamily: FONT_REGULAR,
  },
});
