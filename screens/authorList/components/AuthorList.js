import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  RefreshControl,
} from 'react-native';
import {connect} from 'react-redux';
import I18n from '../../../i18n';
import Images from '../../../assets/images';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  FONT_REGULAR,
  FONT_BOLD,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
} from '../../../assets/fonts';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import {
  PERIOD_LIST,
  AUTHORS_LIST,
  AUTHORS_SEARCH,
} from '../../../common/endpoints';
import Api from '../../../common/api';
import LinearGradient from 'react-native-linear-gradient';
import {TabView, TabBar} from 'react-native-tab-view';
import {MaterialIndicator} from 'react-native-indicators';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import {HeaderBackButton} from 'react-navigation-stack';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
          onPress={() => params.this.props.navigation.goBack()}
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
        <SafeAreaView style={{flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => params.this.OnSearch()}
            style={styles.headerRightContainer}>
            <FontAwesome name="search" color={PRIMARY_COLOR} size={26} />
          </TouchableOpacity>
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
      author: [],
      page: 1,
      isLastBookPage: false,
      isLoading: true,
      searchVisible: false,
      searchText: null,
    };
    this.fetchBook = this.fetchBook.bind(this);
    this.renderBookItem = this.renderBookItem.bind(this);
    this.bookLoader = this.bookLoader.bind(this);
    this.OnSearch = this.OnSearch.bind(this);
    this.onSearchPage = this.onSearchPage.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      this: this,
    });
    this.fetchBook(true);
  }

  fetchBook(reset) {
    this.setState({
      isLoading: true,
      searchText: null,
      author: reset ? [] : this.state.author,
    });
    Api('get', AUTHORS_LIST, {page: reset ? 1 : this.state.page}).then(
      async response => {
        if (response) {
          this.setState({
            author: this.state.author.concat(response.authors),
            fromOnLoad: true,
            isLastBookPage: response.isLastPage,
            isLoading: false,
            page: reset ? 2 : this.state.page + 1,
          });
        }
      },
    );
  }

  onSearchPage(reset) {
    if (this.state.searchText?.length > 0) {
      this.setState({
        searchVisible: false,
        author: reset ? [] : this.state.author,
        isLoading: true,
      });
      var base64 = require('base-64');
      var utf8 = require('utf8');
      var text = this.state.searchText;
      var bytes = utf8.encode(text);
      var encoded = base64.encode(bytes);
      Api('get', AUTHORS_SEARCH, {
        searchtext: encoded,
        page: reset ? 1 : this.state.page,
      }).then(response => {
        if (response) {
          this.setState({
            author: this.state.author.concat(response.items),
            isLastBookPage: response.isLastPage,
            isLoading: false,
            page: reset ? 2 : this.state.page + 1,
          });
        }
        this.setState({isLoading: false});
      });
    }
  }

  OnSearch() {
    this.setState({searchVisible: true,searchText:null});
  }

  renderSearchModal = () => (
    <View style={styles.content2}>
      <View style={styles.renderModalContent} />
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
            onPress={() => this.onSearchPage(true)}>
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

  renderBookItem({item, index}) {
    return (
      <TouchableOpacity
        style={styles.cardGrid}
        onPress={() =>
          this.props.navigation.navigate('AuthorDetail', {
            authorId: item && item.authorId,
          })
        }>
        <LinearGradient
          style={styles.card}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.card}
            source={item.picture ? {uri: item.picture} : Images.default}
          />
        </LinearGradient>
        <Text
          style={[
            styles.nameText,
            {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
          ]}
          ellipsizeMode={'middle'}
          numberOfLines={1}>
          {item.authorName}
        </Text>
        {/* <View style={[styles.prizeContainer, { flexDirection: this.props.locale == 'ar' ? 'row-reverse' : 'row' }]}> */}
        <View style={styles.dateContainer}>
          <Text
            style={[styles.authorText, {textAlign: 'left'}]}
            numberOfLines={1}>
            {' '}
            {item.birthDate}
          </Text>
          <Text
            style={[styles.authorText, {textAlign: 'right'}]}
            numberOfLines={1}>
            {item.deathDate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  bookLoader() {
    return (
      <View>
        <Placeholder
          Animation={Shine}
          Left={props => <PlaceholderMedia style={styles.loaderLeft1} />}
          Right={props => <PlaceholderMedia style={styles.loaderRight1} />}>
          <PlaceholderMedia style={styles.loaderContain1} />
        </Placeholder>
      </View>
    );
  }

  onLoad() {
    if (!this.state.isLoading && !this.state.isLastBookPage) {
      if (this.state.searchText) {
        this.onSearchPage();
      } else {
        this.fetchBook();
      }
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text
          style={[
            styles.title,
            {textAlign: this.props.locale == 'ar' ? 'right' : 'left'},
          ]}>
          {I18n.t('Author')}
        </Text>
        <View
          style={[
            styles.emptyContainer,
            {alignSelf: this.props.locale == 'ar' ? 'flex-end' : 'flex-start'},
          ]}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={1}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isLoading}
              onRefresh={() => this.fetchBook(true)}
              colors={['#F47424']}
            />
          }
          onMomentumScrollEnd={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              this.onLoad();
            }
          }}>
          <FlatList
            style={styles.flatList}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            data={this.state.author}
            numColumns={2}
            scrollEnabled={false}
            renderItem={this.renderBookItem}
            extraData={this.state}
            keyExtractor={(item, index) => index.toString()}
          />
          {!this.state.isLastBookPage &&
            this.state.author &&
            this.state.author.length > 0 && (
              <View style={styles.indicatorContainer}>
                <MaterialIndicator color={PRIMARY_COLOR} size={20} />
              </View>
            )}
          {this.state.isLoading &&
            this.state.author &&
            this.state.author.length == 0 && (
              <View style={styles.loaderContainerStyle1}>
                {this.bookLoader()}
                {this.bookLoader()}
                {this.bookLoader()}
                {this.bookLoader()}
              </View>
            )}
          {!this.state.isLoading &&
            this.state.author &&
            this.state.author.length === 0 && (
              <View style={styles.errorTextContainer}>
                <AntDesign name="frown" color={'#ECECEC'} size={50} />
                <Text style={styles.infoText}>{I18n.t('No_books_found')}</Text>
              </View>
            )}
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
            hideModalContentWhileAnimating={true}
            animationInTiming={1000}
            animationOutTiming={800}
            style={styles.bottomModal1}>
            <View style={[styles.modal1, {height: 180}]}>
              {this.renderSearchModal()}
            </View>
          </Modal>
        </ScrollView>
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
    margin: 10,
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
  renderContainer: {
    padding: 8,
    width: 100,
    flexDirection: 'row',
    marginVertical: 6,
    borderWidth: 0.1,
    shadowOpacity: 0.2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    borderRightWidth: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
    marginLeft: 5,
  },
  headerRightContainer: {
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
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
    height: 40,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  upIconStyle: {
    alignItems: 'center',
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
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 75,
    marginBottom: 10,
    marginLeft: 5,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: FONT_SEMIBOLD,
  },
  iconContainer: {
    height: height / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorStyle: {
    backgroundColor: PRIMARY_COLOR,
    margin: -5,
    width: width / 5.5,
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
    marginRight: '40%',
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
  labelStyle: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 50,
  },
  cardGrid: {
    flex: 1 / 2,
    paddingHorizontal: 5,
    marginBottom: 12,
  },
  card: {
    height: height / 4,
    width: '100%',
    borderRadius: 13,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  renderModalContent: {
    height: 50,
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
  authorText: {
    fontSize: 12,
    opacity: 0.6,
    fontSize: 13,
    textAlign: 'right',
    fontFamily: FONT_REGULAR,
    flex: 1,
    marginBottom: 2,
  },
  prizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'flex-end',
    marginTop: -4,
  },
  loaderLeft: {
    width: 70,
    height: 30,
    marginLeft: 5,
    marginRight: 5,
  },
  loaderRight: {
    width: 70,
    height: 30,
    marginRight: 5,
  },
  loaderContain: {
    height: 30,
    width: 70,
    marginRight: 5,
  },
  loaderLeft1: {
    borderRadius: 13,
    width: width / 2 - 20,
    height: height / 4,
    marginLeft: 5,
    marginBottom: 30,
  },
  loaderRight1: {
    width: 0,
    height: 0,
  },
  loaderContain1: {
    width: width / 2 - 20,
    height: height / 4,
    marginHorizontal: 10,
    borderRadius: 13,
    marginBottom: 30,
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
  loaderContainerStyle: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  loaderContainerStyle1: {
    marginVertical: 15,
  },
  indicatorContainer: {
    height: 30,
    marginBottom: 60,
  },
  whiteContainer: {
    backgroundColor: '#fff',
  },
  flatList: {
    marginTop: 10,
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
  errorTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height / 1.5,
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
});
