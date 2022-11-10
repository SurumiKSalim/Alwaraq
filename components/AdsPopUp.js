import React, {useEffect, useState} from 'react';
import {LinearTextGradient} from 'react-native-text-gradient';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Carousel from 'react-native-looped-carousel-improved';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import {HOME_NOTIFICATION} from '../common/endpoints';
import Api from '../common/api';
import {PRIMARY_COLOR} from '../assets/color';
import I18n from '../i18n';
import {FONT_REGULAR} from '../assets/fonts';

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
          autoplay={false}
          delay={2000}
          style={{width: '100%', height: '100%'}}>
          {data?.map(item => {
            return (
              <View style={styles.modalHeader}>
                <ImageBackground
                  blurRadius={0}
                  borderRadius={10}
                  resizeMode="stretch"
                  style={styles.imgStyle}
                  source={{uri: item?.coverImage}}
                />
                <View style={styles.content}>
                  {/* <LinearTextGradient
                    style={{fontWeight: 'bold', fontSize: 72}}
                    locations={[0, 1]}
                    colors={['red', 'blue']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}>
                    THIS IS TEXT GRADIENT
                  </LinearTextGradient> */}
                </View>
                <TouchableOpacity
                  onPress={() => onSubmit(item)}
                  style={styles.footer}>
                  <Text style={styles.footerText}>{I18n.t('Read_now')}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </Carousel>
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
    height: height * 0.8 - 180,
    width: width * 0.85,
  },
  footer: {
    backgroundColor: PRIMARY_COLOR,
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    marginVertical: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff',
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
    height: 100,
  },
});
