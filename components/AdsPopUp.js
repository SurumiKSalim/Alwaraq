import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Carousel from 'react-native-snap-carousel'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import {HOME_NOTIFICATION} from '../common/endpoints';
import Api from '../common/api';
import {PRIMARY_COLOR} from '../assets/color';
import I18n from '../i18n';
import {FONT_MEDIUM, FONT_REGULAR, FONT_SEMIBOLD} from '../assets/fonts';

const {width, height} = Dimensions.get('window');
const App = ({navigation}) => {
  const [data, setData] = useState(null);
  const [isVisible, setVisible] = useState(false);

  const fetchData = () => {
    Api('get', HOME_NOTIFICATION).then(response => {
      if (response?.statusCode == 200 && response?.data) {
        setData(response?.data);

        setTimeout(() => {
          setVisible(true);
        }, 2000);
        console.log('ads', response?.data);
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = item => {
    setVisible(false);
    navigation.navigate('Detailbuy', {bookId: item?.bookid});
  };

  
  const _renderItem = ({item,index}) => {
    console.log('_renderItem',item)
    return(
    <View style={styles.modalHeader}>
                <Image
                  resizeMode="stretch"
                  style={styles.imgStyle}
                  source={{uri: item?.coverImage}}
                />
                <View style={styles.content}>
                    <Text numberOfLines={1} style={styles.title}>{item?.name}</Text>
                    <Text numberOfLines={1} style={styles.subTitle}>{item?.author}</Text>
                    <Text numberOfLines={2} style={styles.desc}>{item?.addinfo}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => onSubmit(item)}
                  style={styles.footer}>
                  <Text style={styles.footerText}>{I18n.t('Read_now')}</Text>
                </TouchableOpacity>
              </View>
  )
  }

  const renderItem = () => {
    console.log('Carousel', data);
    return (
      <View style={styles.modalContainer}>
        <AntDesign
          style={styles.closeButton}
          name="closecircleo"
          size={30}
          color={'#fff'}
          onPress={() => setVisible(false)}
        />
        <Carousel
              data={data}
              autoplay
              loop
              renderItem={_renderItem}
              sliderWidth={width * 0.85}
              itemWidth={width * 0.85}
            />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Modal
        isVisible={isVisible}
        hideModalContentWhileAnimating={true}
        animationIn="zoomIn"
        animationOut="zoomOut"
        useNativeDriver={true}
        backdropOpacity={0.9}
        animationOutTiming={300}
        onBackButtonPress={() => setVisible(false)}
        // onBackdropPress={() => setVisible(false)}
        style={styles.modal}>
        {data && renderItem()}
      </Modal>
    </View>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  modal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.8,
    borderRadius: 10,
  },
  modalHeader: {
    borderBottomColor: '#DDDDDD',
    height: height * 0.8,
    width: width * 0.85,
  },
  imgStyle: {
    height: height * 0.8 - 250,
    width: width * 0.85,
    backgroundColor:'#fff',
    borderRadius:10
    // borderTopLeftRadius:10,
    // borderTopRightRadius:10
  },
  footer: {
    backgroundColor: PRIMARY_COLOR,
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    marginVertical:8,
    fontFamily:FONT_SEMIBOLD,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily:FONT_MEDIUM,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#fff',
    marginTop:5,
    fontFamily:FONT_REGULAR,
    textAlign: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: FONT_REGULAR,
  },
  closeButton: {
    height: 40,
    alignSelf: 'flex-end',
  },
  content: {
    height: 120,
  },
});
