import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {connect} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import AlertModal from './AlertModal';
import ErrorMsg from './ErrorMsg';
import DynamicText, {DynamicView} from '../common/dynamicviews';
import I18n from '../i18n';
import Images from '../assets/images';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_LIGHT,
  FONT_MEDIUM,
} from '../assets/fonts';
import {
  PRIMARY_COLOR,
  TITLE_COLOR,
  INPUT_BACKGROUND_COLOR,
  WHITE_COLOR,
} from '../assets/color';
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Shine,
} from 'rn-placeholder';

const App = ({
  data,
  isLoading,
  itemStyle,
  locale,
  groupType,
  isPremium,
  navigation,
  isSwapImg
}) => {
  const [isVisible, setModal] = useState(false);

  const closeModal = () => {
    setModal(false);
  };

  const onSubmit = () => {
    setModal(false);
    navigation.navigate('Subscribe');
  };

  const onClick = (action, params, item) => {
    if (!item.isPremium || item.isAvailableToday == 1 || isPremium) {
      navigation.navigate(action, params);
    } else {
      setModal(true);
    }
  };

  const placeHolder = () => {
    return (
      <Placeholder Animation={Shine} style={{flexDirection: 'row'}}>
        <View style={styles.placeholder}>
          <View
            style={{
              marginLeft: locale == 'en' ? 0 : 20,
              marginRight: locale == 'en' ? 20 : 0,
            }}>
            <PlaceholderMedia style={styles.placeHolderCard} />
            <PlaceholderLine height={12} style={styles.placeholderLine} />
          </View>
          <View>
            <PlaceholderMedia style={styles.placeHolderCard} />
            <PlaceholderLine height={12} style={styles.placeholderLine} />
          </View>
        </View>
      </Placeholder>
    );
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => onClick('Detailbuy', {bookId: item?.bookId}, item)}
        style={
          itemStyle
            ? itemStyle
            : locale == 'ar'
            ? styles.invertItem
            : styles.item
        }>
        <LinearGradient
          style={styles.card}
          colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image
            style={styles.card}
            defaultSource={Images.logo}
            source={isSwapImg?item?.authorImage ? {uri: item.authorImage} : Images.default:
              item?.coverImage ? {uri: item.coverImage} : Images.default}
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
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        inverted={locale == 'ar' ? true : false}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      {isLoading && !data && placeHolder()}
      {!isLoading && data?.length == 0 && (
        <ErrorMsg height={160} msg={I18n.t('Something_Went_Wrong')} />
      )}
      <AlertModal
        isVisible={isVisible}
        closeModal={closeModal}
        onSubmit={onSubmit}
        header={I18n.t('SUBSCRIBE')}
        butttonlabel={I18n.t('SUBSCRIBE')}
        title={'You need to have Premium Account to view this content'}
      />
    </View>
  );
};
const mapStateToProps = state => {
  return {
    locale: state.userLogin.locale,
    isPremium:
      state.userLogin.isPremium ||
      (state.userLogin.user && state.userLogin.user.isPremium),
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    width: 160,
    marginRight: 15,
  },
  invertItem: {
    width: 160,
    marginLeft: 15,
  },
  placeHolderCard: {
    height: 265,
    width: 159,
  },
  card: {
    height: 200,
    width: 159,
    borderRadius: 5,
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
  placeholderLine: {
    marginTop: 5,
    width: 160,
  },
  placeholder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
