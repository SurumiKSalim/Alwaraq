import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import DropDownPicker from 'react-native-dropdown-picker';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import ActionSheet from 'react-native-actionsheet';
import Toast from 'react-native-simple-toast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
} from '../../../assets/color';
import {FONT_BOLD, FONT_REGULAR, FONT_SEMIBOLD} from '../../../assets/fonts';
import I18n from '../../../i18n';
import {fetchCountryList} from '../../AddressManager/actions';
import RNFetchBlob from 'rn-fetch-blob';

const {width, height} = Dimensions.get('window');
const keyArray = [
  'Name',
  'literary name',
  'Manuscript name',
  'e-mail',
  'Country of Residence',
  'Phone',
  'Nationality',
  'nickname',
  'About the manuscript',
  'About the participant',
];

const App = ({country, dispatch, navigation}) => {
  // let inputData = {};
  const [doc, setDoc] = useState(null);
  const [inputData, setInputData] = useState({});
  const [id, setId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [param, setParam] = useState(null);
  const actionSheetRef = useRef();

  useEffect(() => {
    dispatch(fetchCountryList());
  }, []);

  const fetchInput = (key, text) => {
    let obj = {};

    switch (key) {
      case keyArray[0]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[1]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[2]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[3]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[4]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[5]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[6]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[7]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[8]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
      case keyArray[9]:
        obj[key] = text;
        setInputData({...inputData, ...obj});
        break;
    }
  };

  const normalize = path => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const filePrefix = 'file://';
      if (path.startsWith(filePrefix)) {
        path = path.substring(filePrefix.length);
        try {
          path = decodeURI(path);
        } catch (e) {}
      }
    }
    return path;
  };

  const imagePicker = index => {
    let image_temp = null;
    switch (index) {
      case 0:
        ImagePicker.openCamera({
          width: 400,
          height: 400,
          cropping: true,
        }).then(image => {
          image_temp = {uri: image.path, type: image.mime, name: 'test.jpg'};
          if (param == 'id') {
            setId({uri: image.path, type: image.mime, name: 'test.png'});
          } else {
            setPhoto({uri: image.path, type: image.mime, name: 'test.png'});
          }
          // this.submitImage(image_temp);
        });
        break;
      case 1:
        ImagePicker.openPicker({
          width: 400,
          height: 400,
          cropping: true,
        }).then(image => {
          image_temp = {uri: image.path, type: image.mime, name: 'test.jpg'};
          if (param == 'id') {
            setId({uri: image.path, type: image.mime, name: 'test.png'});
          } else {
            setPhoto({uri: image.path, type: image.mime, name: 'test.png'});
          }
          // this.submitImage(image_temp);
        });
        break;
    }
  };

  const selectDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      const base64 = await RNFetchBlob.fs.readFile(
        normalize(res[0].fileCopyUri),
        'base64',
      );
      let obj = {base64: base64};
      let temp_obj = {...res[0], ...obj};
      setDoc(temp_obj);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Toast.show('User cancelled picker');
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const InputData = placeholder => {
    return (
      <View style={styles.email}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={TITLE_COLOR}
          onChangeText={text => fetchInput(placeholder, text)}
          style={
            placeholder == keyArray[8] || placeholder == keyArray[9]
              ? styles.multiLineTextField
              : styles.textField
          }
          multiline={placeholder == keyArray[8] || placeholder == keyArray[9]}
          keyboardType={
            placeholder == keyArray[3]
              ? 'email-address'
              : placeholder == keyArray[5]
              ? 'number-pad'
              : ''
          }
          autoCompleteType={placeholder == keyArray[3] ? 'email' : ''}
        />
      </View>
    );
  };

  const RenderDropdown = placeholder => {
    return (
      <DropDownPicker
        items={country}
        // defaultValue={this.state.country}
        labelStyle={styles.dropDownText}
        style={styles.dropDownContainer}
        itemStyle={styles.itemStyle}
        placeholder={placeholder}
        onChangeItem={(item, index) => fetchInput(placeholder, item)}
      />
    );
  };

  const showActionsheet = async index => {
    await setParam(index);
    actionSheetRef.current.show();
  };

  const renderDocFetch = () => (
    <View>
      <Text style={styles.subTitle}>
        An electronic copy of the manuscript (PDF / Word)
      </Text>
      <TouchableOpacity onPress={() => selectDocument()} style={styles.email}>
        <Text numberOfLines={1} style={styles.textField}>
          {doc ? doc?.name : 'Upload file'}
        </Text>
        <Text style={styles.uploadButton}>Choose file</Text>
      </TouchableOpacity>
      <Text style={styles.desc}>Allowed types: pdf, doc, docx</Text>
    </View>
  );

  const renderIdFetch = () => (
    <View>
      <Text style={styles.subTitle}>
        A copy of the passport or identity card
      </Text>
      <TouchableOpacity
        onPress={() => showActionsheet('id')}
        style={styles.email}>
        <Text style={styles.textField}>
          {id ? 'Passport or ID' : 'Upload file'}
        </Text>
        <Text style={styles.uploadButton}>Choose file</Text>
      </TouchableOpacity>
      <Text style={styles.desc}>Allowed types: jpg, png</Text>
    </View>
  );

  const renderPhotoFetch = () => (
    <View>
      <Text style={styles.subTitle}>A print-sized personal photo</Text>
      <TouchableOpacity
        onPress={() => showActionsheet('photo')}
        style={styles.email}>
        <Text style={styles.textField}>{photo ? 'Photo' : 'Upload file'}</Text>
        <Text style={styles.uploadButton}>Choose file</Text>
      </TouchableOpacity>
      <Text style={styles.desc}>Allowed types: jpg, png</Text>
    </View>
  );

  const actionSheet = item => {
    return (
      <ActionSheet
        ref={actionSheetRef}
        title={'Pick Image'}
        options={['Take Photo', 'Choose from Library', 'Cancel']}
        cancelButtonIndex={2}
        destructiveButtonIndex={2}
        onPress={index => {
          imagePicker(index);
        }}
      />
    );
  };

  const header = () => (
    <View style={styles.header}>
      <HeaderBackButton
        tintColor={PRIMARY_COLOR}
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.headerTitle}>Apply IB Award</Text>
    </View>
  );

  const checkProperties = obj => {
    for (let key in obj) {
      console.log(key, obj[key]);
      if (obj[key] == null || obj[key] == '') {
        Toast.show(` * ${key} field required`);
        return false
      }
    }
    return true
  };

  const validate = () => {
    if (Object.keys(inputData).length == 10) {
      if(checkProperties(inputData)){
        if(id && photo && doc){
          Toast.show('Suceess');
        }
        else{
          Toast.show('Please Upload all 3 files');
        }
      }
    } else {
      Toast.show('Please fill all fields');
      console.log('item', inputData);
    }
  };

  return (
    <SafeAreaView style={styles.contain}>
      {header()}
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        {keyArray?.map((item, index) => {
          {
            if (index == 4 || index == 6) {
              return RenderDropdown(keyArray[index]);
            } else {
              return InputData(item);
            }
          }
        })}
        {renderDocFetch()}
        {renderIdFetch()}
        {renderPhotoFetch()}
        {actionSheet()}
        <TouchableOpacity onPress={() => validate()} style={styles.button}>
          <Text style={styles.submit}>Submit</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const mapStateToProps = state => {
  return {
    country: state.address.country,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  contain: {
    flex: 1,
  },
  header: {
    height: 50,
    marginHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: FONT_BOLD,
    color: PRIMARY_COLOR,
  },
  email: {
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    flexDirection: 'row',
  },
  textField: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    paddingLeft: 15,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  desc: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT_REGULAR,
    paddingLeft: 15,
    color: '#9c9c9c',
    paddingVertical: 8,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: -14,
  },
  subTitle: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT_SEMIBOLD,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  multiLineTextField: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    paddingLeft: 15,
    paddingVertical: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  dropDownText: {
    // marginTop: 10,
    // marginBottom: 10,
    paddingVertical: 7,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    opacity: 0.9,
  },
  dropDownContainer: {
    borderColor: SECONDARY_COLOR,
    marginBottom: 15,
  },
  itemStyle: {
    justifyContent: 'flex-start',
  },
  uploadButton: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 0.5,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: FONT_REGULAR,
    color: PRIMARY_COLOR,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  button: {
    height: 50,
    width: width - 60,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    margin: 15,
  },
  submit: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    color: TITLE_COLOR,
    color: '#FFFFFF',
    textAlign: 'center',
    paddingRight: 15,
  },
});
