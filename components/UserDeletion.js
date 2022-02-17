import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import {
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_LIGHT,
} from '../assets/fonts';
import {
  PRIMARY_COLOR
} from '../assets/color';
import AlertModal from './AlertModal';
import Api from '../common/api';
import { USER_DELETE } from '../common/endpoints';
import I18n from '../i18n';
import { changeEmail } from '../screens/login/actions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from "react-native-vector-icons/Ionicons"

const App = ({ user, dispatch }) => {
  const [isVisible, setModal] = useState(false);
  const [resultVisible, setResult] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const closeModal = () => {
    setModal(false);
    setResult(false);
  };

  const onSubmit = () => {
    setLoading(true);
    closeModal();
    let formData = new FormData();
    formData.append('appId', 1);
    formData.append('action', user?.markDeletion == 0 ? 'delete' : 'undelete');
    Api('post', USER_DELETE, formData).then((response) => {
      setLoading(false);
      console.log('response', response);
      if (response?.statusCode == 200) {
        setResult('success');
        setError(response?.errormessage);
        let user_updated = {
          ...user,
          markDeletion: response.userinfo?.markDeletion,
        };
        console.log('user_updated', user_updated);
        dispatch(changeEmail(user_updated));
      } else {
        setResult('failed');
        setError(response?.errormessage);
      }
    });
  };

  return (
    <TouchableOpacity style={styles.subContainerContents} onPress={() => setModal(true)}>
      <MaterialCommunityIcons name={user?.markDeletion == 0 ? 'delete-outline' : 'restore'} color={PRIMARY_COLOR} size={28} style={styles.notificationIcon} />
      {/* <Text style={styles.optionText}>{I18n.t("Sign_Out")}</Text> */}
      {isLoading ? <Text style={styles.optionText}>
        Please Wait . . .
      </Text> :
        <Text style={styles.optionText}>
          {user?.markDeletion == 0
            ? 'Delete Account'
            : 'Restore Account'}
        </Text>}
      <View style={styles.arrowIcon}>
        <Ionicons name={'ios-arrow-forward'} color={PRIMARY_COLOR} size={30} />
      </View>
      <AlertModal
        isVisible={isVisible}
        closeModal={closeModal}
        onSubmit={onSubmit}
        header={user?.markDeletion == 0 ? 'Delete Account' : 'Restore Account'}
        butttonlabel={user?.markDeletion == 0 ? 'Delete' : 'Restore'}
        title={
          user?.markDeletion == 0
            ? 'Your account data will be deleted in 30 days, you can suspend deletion with in this time period'
            : 'Your delete request will be cancelled and Account will be Restored'
        }
      />
      <AlertModal
        isVisible={resultVisible == 'success'}
        onSubmit={closeModal}
        header={I18n.t('SUCCESS')}
        butttonlabel={I18n.t('Ok')}
        title={error}
      />
      <AlertModal
        isVisible={resultVisible == 'failed'}
        onSubmit={closeModal}
        header={I18n.t('FAILED')}
        butttonlabel={I18n.t('Ok')}
        title={error}
      />
    </TouchableOpacity>
    // <View style={styles.container}>

    // </View>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.userLogin.user,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subContainerContents: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
  },
  notificationIcon: {
    flex: 1,
  },
  optionText: {
    textAlign: 'left',
    flex: 6,
    fontFamily: FONT_MEDIUM
  },
});
