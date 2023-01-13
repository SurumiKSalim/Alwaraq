import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {Placeholder, PlaceholderMedia, Shine} from 'rn-placeholder';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import Api from '../../../common/api';
import {IB_AWARDS} from '../../../common/endpoints';
import CustomHeader from '../../../components/CustomHeader';
import SectionBox from '../../ibnAwards/components/SessionBox';
import DynamicText, {DynamicView} from '../../../common/dynamicviews';
import I18n from '../../../i18n';
import Images from '../../../assets/images';
import {FONT_LIGHT, FONT_MEDIUM, FONT_SEMIBOLD} from '../../../assets/fonts';
import {PRIMARY_COLOR, TITLE_COLOR} from '../../../assets/color';
import AlertModal from '../../../components/AlertModal';
import FBCollage from 'react-native-fb-collage';
import {ImageGallery} from '@georstat/react-native-image-gallery';

const {width, height} = Dimensions.get('window');

const App = ({dispatch, navigation, locale}) => {
  let galleryList = [];
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [isVisible, setModal] = useState(false);
  const [isSwapImg, setSwapImg] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [groupType, setType] = useState(navigation.getParam('groupType'));

  const closeModal = () => {
    setModal(false);
  };

  const closeGallery = () => setIsOpen(false);

  const onSubmit = () => {
    setModal(false);
    navigation.navigate('Subscribe');
  };

  const toogleSwapImage = () => {
    setSwapImg(!isSwapImg);
  };

  const fetchData = () => {
    setLoading(true);
    if (navigation.getParam('searchText')) {
      var base64 = require('base-64');
      var utf8 = require('utf8');
      var text = navigation.getParam('searchText');
      var bytes = utf8.encode(text);
      var encoded = base64.encode(bytes);
    }
    Api('get', IB_AWARDS, {
      categoryId:
        groupType == 'year' ? undefined : navigation.getParam('categoryId'),
      searchText: encoded,
      year: groupType == 'year' ? navigation.getParam('categoryId') : undefined,
    }).then(response => {
      setLoading(false);
      if (response) {
        setData(response);
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
    });
  };

  const onClick = (action, params, item) => {
    if (!item.isPremium || item.isAvailableToday == 1 || isPremium) {
      navigation.navigate(action, params);
    } else {
      setModal(true);
    }
  };

  const loader = () => {
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
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => onClick('Detailbuy', {bookId: item?.bookId}, item)}
        style={styles.cardGrid}>
        <LinearGradient
          style={styles.card}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.card}
            defaultSource={Images.logo}
            source={
              isSwapImg
                ? item?.authorImage
                  ? {uri: item.authorImage}
                  : Images.default
                : item?.coverImage
                ? {uri: item.coverImage}
                : Images.default
            }
          />
          {item.isPremium == 1 && (
            <FontAwesome5
              style={styles.crown}
              name="crown"
              size={20}
              color={'#FFD700'}
            />
          )}
        </LinearGradient>
        <DynamicText textAlign={'left'} numberOfLines={2} style={styles.title}>
          {item?.bookName}
        </DynamicText>
        <DynamicText
          textAlign={'left'}
          numberOfLines={2}
          style={styles.categoryName}>
          {groupType == 'year' ? item?.categoryName : item?.year}
        </DynamicText>
        <DynamicText
          textAlign={'left'}
          numberOfLines={2}
          style={styles.authorName}>
          {item?.authorName}
        </DynamicText>
      </TouchableOpacity>
    );
  };

  const imageCollage = () => {
    imagesList = data?.photos?.map(({picture}) => picture);
    galleryList = imagesList.map(url => ({url}));
    return (
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.collageContainer}>
        <FBCollage images={imagesList} imageOnPress={() => setIsOpen(true)} />
      </TouchableOpacity>
    );
  };

  const renderHeaderComponent = () => {
    return (
      <SafeAreaView style={styles.closeContainer}>
        <AntDesign
          onPress={() => closeGallery()}
          name={'closecircleo'}
          color={'#fff'}
          size={30}
        />
      </SafeAreaView>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        toogleSwapImage={toogleSwapImage}
        isSwapImg={isSwapImg}
        dispatch={dispatch}
        navigation={navigation}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionBox
          locale={locale}
          hideSeeAll
          count={data?.items?.length ? data?.items?.length : 0}
          title={
            navigation.getParam('searchText')
              ? 'Search (' + navigation.getParam('searchText') + ')'
              : navigation.getParam('title')
              ? navigation.getParam('title')
              : ''
          }>
          {data?.items && (
            <FlatList
              style={styles.flatlistStyle}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              data={data?.items}
              renderItem={renderItem}
              numColumns={2}
              extraData={data?.items}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
          {data?.photos?.[0] && (
            <SectionBox
              locale={locale}
              hideSeeAll
              count={data?.photos?.length ? data?.photos?.length : 0}
              title={'Gallery'}>
              {imageCollage()}
            </SectionBox>
          )}
          {isLoading && !data?.items && (
            <View>
              {loader()}
              {loader()}
              {loader()}
              {loader()}
            </View>
          )}
        </SectionBox>
        <ImageGallery
          thumbSize={60}
          close={closeGallery}
          isOpen={isOpen}
          images={galleryList}
          renderHeaderComponent={renderHeaderComponent}
        />
        <AlertModal
          isVisible={isVisible}
          closeModal={closeModal}
          onSubmit={onSubmit}
          header={I18n.t('SUBSCRIBE')}
          butttonlabel={I18n.t('SUBSCRIBE')}
          title={'You need to have Premium Account to view this content'}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const mapStateToProps = state => {
  return {
    locale: state.userLogin.locale,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    height: height / 4,
    width: '100%',
    borderRadius: 13,
    marginBottom: 4,
  },
  cardGrid: {
    flex: 1 / 2,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  title: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    color: TITLE_COLOR,
    marginTop: 8,
    lineHeight: 17,
    width: 157,
  },
  categoryName: {
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
    color: PRIMARY_COLOR,
    lineHeight: 18,
    marginTop: 4,
  },
  authorName: {
    fontFamily: FONT_LIGHT,
    fontSize: 14,
    color: TITLE_COLOR,
    lineHeight: 18,
    opacity: 0.73,
    marginTop: 4,
  },
  crown: {
    padding: 15,
    position: 'absolute',
  },
  collageContainer: {
    backgroundColor: '#fff',
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowOffset: {width: 0, height: 0},
    marginBottom: 15,
    marginHorizontal: -10,
    elevation: 2,
  },
  closeContainer: {
    marginHorizontal: 20,
    alignItems: 'flex-end',
  },
});
