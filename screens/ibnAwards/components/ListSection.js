import React, {useEffect, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';
import DynamicText, {DynamicView, IS_IPAD} from '../../../common/dynamicviews';
import SectionBox from './SessionBox';
import HorizontalFlatlist from '../../../components/HorizontalFlatlist';
import I18n from '../../../i18n';
import Images from '../../../assets/images';
import {
  FONT_BOLD,
  FONT_MEDIUM,
  FONT_REGULAR,
  FONT_SEMIBOLD,
} from '../../../assets/fonts';
import {PRIMARY_COLOR} from '../../../assets/color';

const {width, height} = Dimensions.get('window');

const App = ({data, navigation, isLoading,groupType}) => {
  return (
    <View style={styles.container}>
      <HorizontalFlatlist
          navigation={navigation}
          data={data?.winners}
          groupType={groupType}
          action={'ArticleDetails'}
          isLoading={isLoading}
        />
    </View>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    height: height / 4,
    width: width - 60,
    borderRadius: 13,
    marginBottom: 4,
  },
  authorCard: {
    height: 40,
    width: 40,
    borderRadius: 5,
    marginRight: 8,
  },
  contentContainer: {
    width: width - 60,
    marginHorizontal: 4,
  },
  cardGrid: {
    paddingRight: 10,
    marginTop: 15,
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    marginBottom: 3,
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD,
  },
  headerLine: {
    height: 6,
    width: 50,
    backgroundColor: PRIMARY_COLOR,
  },
  subText: {
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    flexShrink: 1,
    flexWrap: 'wrap',
    color: '#272727',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    marginHorizontal: 2,
    width: width - 60,
  },
  authorText: {
    fontSize: 12,
    fontFamily: FONT_REGULAR,
    flexShrink: 1,
    flexWrap: 'wrap',
    color: '#9c9c9c',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  bookContent: {
    justifyContent: 'center',
    width: width - 110,
  },
  authorContent: {
    marginTop: 4,
  },
});
