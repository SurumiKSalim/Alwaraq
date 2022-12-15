import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, StyleSheet, FlatList} from 'react-native';
import Toast from 'react-native-simple-toast';
import ListSection from './ListSection';
import Api from '../../../common/api';
import {IB_AWARDS_BY_TYPE} from '../../../common/endpoints';
import I18n from '../../../i18n';
import SectionBox from './SessionBox';
import {connect} from 'react-redux';
import CustomHeader from '../../../components/CustomHeader';
import LanguageModal from '../../../components/languageModal';

const App = ({navigation, locale, dispatch}) => {
  const [data, setData] = useState(['']);
  const [isLoading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Api('get', IB_AWARDS_BY_TYPE).then(response => {
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
  }, [locale]);

  const toogleSearchModal = () => {
    console.log('item');
  };

  const renderItem = ({item}) => {
    return (
      <SectionBox
        onPress={() => navigation.navigate('Article')}
        locale={locale}
        fromHome
        title={item?.typeName}>
        <ListSection
          isLoading={isLoading}
          data={item}
          navigation={navigation}
        />
      </SectionBox>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        dispatch={dispatch}
        navigation={navigation}
        toogleSearchModal={toogleSearchModal}
      />
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <LanguageModal fromHome={true} />
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
});
