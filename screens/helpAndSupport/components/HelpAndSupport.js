import React, {useEffect, useState} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';
import Toast from 'react-native-simple-toast';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {PRIMARY_COLOR} from '../../../assets/color';
import Api from '../../../common/api';
import Accordian from '../../../components/Accordian';
import {APP_HELP_SUPPORT} from '../../../common/endpoints';
import {FONT_BOLD, FONT_SEMIBOLD} from '../../../assets/fonts';
import Images from '../../../assets/images';
import I18n from '../../../i18n';

const {width, height} = Dimensions.get('window');
let data = [];
const App = ({navigation}) => {
  const [data, setdata] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Api('get', APP_HELP_SUPPORT, {appId: 1}).then(response => {
      if (response?.supports?.[0]) {
        setdata(response);
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
      setLoading(false);
    });
  };
  useEffect(() => {
    fetchData();
  }, []);


  const renderAccordians = () => {
    console.log('qqq',data.supports)
    const items = [];
    {
      data?.supports?.map((item, index) => {
        console.log('item',item)
        items.push(
          <Accordian
            len={data?.length}
            index={index}
            title={item.name}
            data={item.description}
            navigation={navigation}
            item={item}
          />,
        );
      });
    }
    return items;
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {/* <Image style={styles.logo} source={Images.ibn} resizeMode="contain" /> */}
          <Text style={styles.title}>{I18n.t('Help_Support')}</Text>
        </View>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name={'close-circle-outline'}
            size={30}
            color={PRIMARY_COLOR}
          />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {data?.supports?.length > 0 && renderAccordians()}
      </ScrollView>
        {isLoading&& (
          <BarIndicator
            style={styles.loaderContainer}
            color={PRIMARY_COLOR}
            size={34}
          />
        )}
    </SafeAreaView>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    height: 40,
    flexDirection: 'row',
    width: width - 30,
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginRight: 10,
    flexShrink: 1,
    fontFamily: FONT_BOLD,
    fontSize: 18,
    color: PRIMARY_COLOR,
    marginRight: 8,
    marginLeft: 40,
  },
  icon: {
    width: 30,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  loaderContainer: {
    height: height * 0.5,
    position:'absolute',
    alignSelf:'center'
  },
});
