import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import ListSection from './ListSection';
import Api from '../../../common/api';
import {IB_AWARDS_BY_TYPE} from '../../../common/endpoints';
import I18n from '../../../i18n';
import SectionBox from './SessionBox';
import {connect} from 'react-redux';
import CustomHeader from '../../../components/CustomHeader';
import LanguageModal from '../../../components/languageModal';
import DynamicText from '../../../common/dynamicviews';
import {PRIMARY_COLOR} from '../../../assets/color';
import {FONT_REGULAR} from '../../../assets/fonts';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';

const {width, height} = Dimensions.get('window');
const App = ({navigation, locale, dispatch}) => {
  const [data, setData] = useState(['']);
  const [isLoading, setLoading] = useState(true);
  const [groupType, setType] = useState('year');

  const fetchData = () => {
    setLoading(true);
    Api('get', IB_AWARDS_BY_TYPE, {groupType: groupType}).then(response => {
      setLoading(false);
      if (response?.awards?.length > 0) {
        setData(response?.awards);
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, [locale, groupType]);

  const toogleSearchModal = () => {
    console.log('item');
  };

  const renderItem = ({item}) => {
    return (
      <SectionBox
        onPress={() => navigation.navigate('Article')}
        locale={locale}
        fromHome
        count={item?.winners?.length}
        title={item?.typeName}>
        <ListSection
          isLoading={isLoading}
          data={item}
          groupType={groupType}
          navigation={navigation}
        />
      </SectionBox>
    );
  };

  const sortItemRender = () => (
    <View style={styles.sortContain}>
      <TouchableOpacity
        onPress={() => setType('year')}
        style={[
          styles.sortContainer,
          {backgroundColor: groupType == 'year' ? PRIMARY_COLOR : '#fff'},
        ]}>
        <DynamicText
          style={[
            styles.sort,
            {color: groupType != 'year' ? PRIMARY_COLOR : '#fff'},
          ]}>
          By Year
        </DynamicText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setType('categoryId')}
        style={[
          styles.sortContainer,
          {backgroundColor: groupType != 'year' ? PRIMARY_COLOR : '#fff'},
        ]}>
        <DynamicText
          style={[
            styles.sort,
            {color: groupType == 'year' ? PRIMARY_COLOR : '#fff'},
          ]}>
          By Category
        </DynamicText>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        dispatch={dispatch}
        navigation={navigation}
        toogleSearchModal={toogleSearchModal}
      />
      {sortItemRender()}
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <LanguageModal fromHome={true} />
      {isLoading&&
      <BarIndicator
        style={styles.loaderContainer}
        color={PRIMARY_COLOR}
        size={34}
      />}
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
    marginVertical: 15,
  },
  sortContainer: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 0.5,
    marginHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 4,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sort: {
    color: PRIMARY_COLOR,
    fontFamily: FONT_REGULAR,
    fontSize: 12,
  },
  sortContain: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loaderContainer: {
    position: 'absolute',
    top: 100,
    height: height * 0.5,
    width: width,
    zIndex: 20,
  },
});
