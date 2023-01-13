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
import {
  IB_AWARDS_ABOUT,
  IB_AWARDS_CONDITIONS,
  IB_AWARDS_STATEMENTS,
} from '../../../common/endpoints';
import {FONT_BOLD, FONT_SEMIBOLD} from '../../../assets/fonts';
import Images from '../../../assets/images';

const {width, height} = Dimensions.get('window');
let data = [];
const App = ({navigation}) => {
  const [about, setAbout] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const fetchAbout = () => {
    setLoading(true);
    Api('get', IB_AWARDS_ABOUT).then(response => {
      if (response?.page) {
        fetchConditions();
        data.push(response?.page);
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
    });
  };

  const fetchConditions = () => {
    setLoading(true);
    Api('get', IB_AWARDS_CONDITIONS).then(response => {
      if (response?.page) {
        fetchStatement();
        data.push(response?.page);
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
    });
  };

  const getValue = async response => {
    // Assign a value to a variable asynchronously
    await data.push(response?.page);
    // Set the state variable with the value of the variable
    setAbout(data);
  };

  const fetchStatement = () => {
    setLoading(true);
    Api('get', IB_AWARDS_STATEMENTS).then(response => {
      setLoading(false);
      if (response?.page) {
        getValue(response);
        //    await data.push(response?.page);
        //     setAbout(data)
      } else {
        Toast.show(I18n.t('Something_went_wrong_Try'));
      }
    });
  };

  useEffect(() => {
    data = [];
    fetchAbout();
  }, []);

  const renderAccordians = () => {
    const items = [];
    {
      about?.map((item, index) => {
        items.push(
          <Accordian
            len={about?.length}
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
          <Text style={styles.title}>IB AWARDS</Text>
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
        {isLoading&&
      <BarIndicator
      style={styles.loaderContainer}
      color={PRIMARY_COLOR}
      size={34}
    />}
        {about?.length > 0 && renderAccordians()}
      </ScrollView>
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
    justifyContent:'center'
  },
  title: {
    textAlign: 'center',
    marginRight: 10,
    flexShrink: 1,
    fontFamily: FONT_BOLD,
    fontSize: 18,
    color: PRIMARY_COLOR,
    marginRight:8,
    marginLeft:40
  },
  icon: {
    width: 30,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  loaderContainer:{
    height:height*.5
  }
});
