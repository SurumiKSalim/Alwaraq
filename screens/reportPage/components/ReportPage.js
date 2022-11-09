import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {View, Dimensions, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {FONT_REGULAR, FONT_SEMIBOLD} from '../../../assets/fonts';
import DynamicText, {DynamicView, IS_IPAD} from '../../../common/dynamicviews';
import Api from '../../../common/api';
import {BAD_COMMENTS} from '../../../common/endpoints';
import AlertModal from '../../../components/AlertModal';
import I18n from '../../../i18n';
import {PRIMARY_COLOR} from '../../../assets/color';

const reportOptions = [
  'Spam or misleading',
  'Harmful or dangerous content',
  'Violent content',
  'Hateful or abusive',
  'Sexual content',
];
const {width, height} = Dimensions.get('window');

const App = ({locale, navigation}) => {
  const data = navigation.getParam('item', null);
  const [report, setReport] = useState(null);
  const [isVisible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {}, []);

  const onReport = item => {
    if (report != item) {
      setReport(item);
    } else {
      setReport(0);
    }
  };

  const onSubmit = () => {
    if (report) {
      setLoading(true);
      let formdata = new FormData();
      formdata.append('action', 'add');
      formdata.append('appid', 1);
      formdata.append('entityId', data?.commentId);
      formdata.append('entityName', 'commentId');
      formdata.append('abuseType', report);
      Api('post', BAD_COMMENTS, formdata).then(response => {
        setLoading(false);
        if (response?.statusCode == 200) {
          setVisible(true);
        } else {
          Toast.show(I18n.t('Something_went_wrong_Try'));
        }
      });
    } else {
      Toast.show('Please select an option');
    }
  };

  const closeBack = () => {
    setVisible(false);
    // navigation.goBack()
  };

  return (
    <View style={styles.container}>
      <DynamicText style={styles.header}>Report Comment</DynamicText>
      <View style={styles.contentContainer}>
        {reportOptions.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={() => onReport(index + 1)}
              style={styles.content}>
              {locale == 'ar' && (
                <DynamicText style={styles.modalText}>{item}</DynamicText>
              )}
              <MaterialCommunityIcons
                name={report != index + 1 ? 'circle-outline' : 'circle-slice-8'}
                color={report != index + 1 ? '#d9d9d9' : PRIMARY_COLOR}
                size={24}
              />
              {locale !== 'ar' && (
                <DynamicText style={styles.modalText}>{item}</DynamicText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.secondryButtonContainer}>
          <DynamicText style={styles.secondryButton}>Cancel</DynamicText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSubmit()}
          style={styles.primaryButtonContainer}>
          {isLoading ? (
            <MaterialIndicator color={'#fff'} size={24} />
          ) : (
            <DynamicText style={styles.primaryButton}>Report</DynamicText>
          )}
        </TouchableOpacity>
      </View>
      <AlertModal
        isVisible={isVisible}
        onSubmit={closeBack}
        header={'Thanks for reporting'}
        butttonlabel={I18n.t('Ok')}
        title={I18n.t('Report_Description')}
      />
    </View>
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
    marginHorizontal: 15,
  },
  contentContainer: {
    marginTop: 30,
  },
  modalText: {
    lineHeight: 30,
    marginHorizontal: 5,
    flex: 1,
    fontFamily: FONT_REGULAR,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 20,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingVertical: 40,
    justifyContent: 'flex-end',
  },
  primaryButtonContainer: {
    backgroundColor: PRIMARY_COLOR,
    width: 120,
    alignItems: 'center',
    paddingVertical: 10,
    marginLeft: 10,
  },
  secondryButtonContainer: {
    borderColor: PRIMARY_COLOR,
    width: 120,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
  },
  primaryButton: {
    fontFamily: FONT_REGULAR,
    color: '#fff',
    fontSize: 14,
  },
  secondryButton: {
    fontFamily: FONT_REGULAR,
    color: PRIMARY_COLOR,
    fontSize: 14,
  },
});
