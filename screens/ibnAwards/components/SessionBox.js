import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD} from '../../../assets/fonts';
import {PRIMARY_COLOR, WHITE_COLOR, TITLE_COLOR} from '../../../assets/color';
import {connect} from 'react-redux';
import I18n from '../../../i18n';
import DynamicText, {DynamicView} from '../../../common/dynamicviews';
import AntDesign from 'react-native-vector-icons/AntDesign';

const {width, height} = Dimensions.get('window');
const App = ({
  children,
  title,
  locale,
  hideSeeAll,
  onPress,
  style,
  fromHome,
  count
}) => {
  return (
    <View
      style={
        style
          ? style
          : fromHome
          ? locale == 'ar'
            ? styles.arabicContainer
            : styles.container
          : styles.contentContainer
      }>
      {title && (
        <DynamicView style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.underline}>
              <Text numberOfLines={1} style={styles.titleText}>
                {title}
              </Text>
            </View>
            <Text  style={[styles.titleText,{fontSize:14}]}>{' ('+count+')'}</Text>
          </View>
          {!hideSeeAll && (
            <TouchableOpacity
              // onPress={onPress}
              style={styles.contain}>
              <Text style={styles.seeAllText}>
                {hideSeeAll ? '' : I18n.t('See_All')}
              </Text>
            </TouchableOpacity>
          )}
        </DynamicView>
      )}
      {children}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  container: {
    flex: 1,
    marginVertical: 15,
    paddingLeft: 15,
  },
  arabicContainer: {
    flex: 1,
    marginVertical: 15,
    paddingRight: 15,
  },
  contain: {flexDirection: 'row'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    paddingBottom: 2,
    borderColor: PRIMARY_COLOR,
    // width: width - 150,
    marginRight: 10,
    flexDirection:'row'
  },
  seeAllText: {
    fontFamily: FONT_REGULAR,
    fontSize: 19,
    color: TITLE_COLOR,
    margin: 2,
    opacity: 0.6,
    marginHorizontal: 15,
  },
  titleText: {
    fontSize: 20,
    fontFamily: FONT_MEDIUM,
    color: PRIMARY_COLOR,
    lineHeight: 24,
  },
  underline: {
    borderBottomWidth: 2,
    marginBottom: 10,
    borderColor: PRIMARY_COLOR,
  },
  left: {
    marginRight: 5,
    marginLeft: 10,
  },
  right: {
    marginLeft: 5,
    marginRight: 10,
  },
});
