import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import {FONT_SEMIBOLD} from '../assets/fonts';
import {DASHBOARD_CATEGORY} from '../common/endpoints';
import Api from '../common/api';
import {
  BallIndicator,
  BarIndicator,
  MaterialIndicator,
} from 'react-native-indicators';
import {PRIMARY_COLOR} from '../assets/color';

const {width, height} = Dimensions.get('window');

const App = ({selection}) => {
  const [data, setData] = useState('');
  const [children, setChildren] = useState('');
  const [modalVisible, setVisible] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Api('get', DASHBOARD_CATEGORY, {isAudioAvailable: 1}).then(response => {
      if (response?.statusCode == 200) {
        setData(response.subjects);
      }
      setLoading(false);
    });
  };

  const handleClick =(item)=>{
    setVisible(false)
    selection(item)
  }

  const onClick = item => {
    if (item.children && item.children.length > 0) {
      setVisible(true);
      setChildren(item.children);
    } else {
      setVisible(false);
      selection(item);
    }
  };

  const renderChildItem=({ item, index })=> {
    console.log('item',item)
    return (
        <TouchableOpacity onPress={() => handleClick(item)} style={styles.containerContent1}>
            <View style={styles.renderItemImg}>
                <Image style={styles.card} source={{ uri: item.picture }}></Image>
            </View>
            <View style={styles.renderItemText}>
                <Text style={styles.categoryNameText}>{item.subjectName}</Text>
                {/* <Text style={styles.statusText}>{item.status}</Text> */}
            </View>
        </TouchableOpacity>
    )
}

  const renderModalContent = () => (
    <View style={styles.content}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          style={styles.FlatListStyle}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={children}
          renderItem={renderChildItem}
          extraData={children}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </View>
  );

  const renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => onClick(item)}
        style={styles.containerContent}>
        <View style={styles.renderItemImg}>
          <Image style={styles.card} source={{uri: item.picture}} />
        </View>
        <View style={styles.renderItemText}>
          <Text
            style={styles.categoryNameText}
            numberOfLines={2}
            ellipsizeMode={'middle'}>
            {item.subjectName}
          </Text>
          {/* <Text style={styles.statusText}>{item.status}</Text> */}
        </View>
      </TouchableOpacity>
    );
  };

  return !isLoading ? (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        extraData={data}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
      />
      <Modal
        isVisible={modalVisible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        hasBackdrop={true}
        backdropColor="black"
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        backdropOpacity={0.5}
        onBackButtonPress={() => setVisible(false)}
        onBackdropPress={() => setVisible(false)}
        style={styles.modal}>
        <View style={styles.modalStyle}>{renderModalContent()}</View>
      </Modal>
    </View>
  ) : (
    <BarIndicator
      style={styles.loaderContainer}
      color={PRIMARY_COLOR}
      size={34}
    />
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerContent: {
    height: width / 2.3,
    margin: width / 50,
    width: width / 2.3 - 1,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 13,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    elevation: 1,
    borderWidth: 0.01,
    borderColor: '#fff',
  },
  renderItemImg: {
    flex: 2,
    justifyContent: 'center',
  },
  card: {
    width: width / 7,
    height: width / 7,
  },
  renderItemText: {
    justifyContent: 'flex-start',
    padding: 2,
  },
  categoryNameText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 16,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    height: height * 0.5,
    width: width - 30,
    zIndex: 20,
  },
  containerContent1: {
      height: width / 2.6,
      margin: width / 52,
      width: width / 2.6+10,
      padding: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: 13,
      backgroundColor: '#fff',
      shadowOpacity: .1,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      borderWidth: .01,
      borderColor: '#fff',
  },
  modal: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff00'
  },
  modalStyle: {
      height: height * .6,
      width: width * .9,
      shadowOpacity: .1,
      borderRadius: 20,
      backgroundColor: '#fff',
  },
});
