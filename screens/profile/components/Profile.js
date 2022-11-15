import React, {Component} from 'react';
import {
  View,
  Linking,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Switch,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import {TouchableOpacity as Touch} from 'react-native-gesture-handler';
import {
  PRIMARY_COLOR,
  TITLE_COLOR,
  SECONDARY_COLOR,
} from '../../../assets/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  FONT_REGULAR,
  FONT_SEMIBOLD,
  FONT_MEDIUM,
  FONT_LIGHT,
} from '../../../assets/fonts';
import Images from '../../../assets/images';
import ActionSheet from 'react-native-actionsheet';
import {
  resetUser,
  postChangeProfileImage,
  postNotificationToggle,
  sendFCMToken,
  postChangeLanguage,
  fetchChangeName,
  promoSubscription,
} from '../../login/actions';
import ImagePicker from 'react-native-image-crop-picker';
import Login from '../../login';
import {connect} from 'react-redux';
import I18n from '../../../i18n';
import DeviceInfo from 'react-native-device-info';
import {postChangePassword, locationNotificationEnable} from '../actions';
import {fetchResetLoaders} from '../../login/actions';
import Modal from 'react-native-modal';
import RadioButton from '../../../components/radioButton';
import Feather from 'react-native-vector-icons/Feather';
import firebase from 'react-native-firebase';
import {PROMO_COUNTER, HELP_AND_SUPPORT} from '../../../common/endpoints';
import Api from '../../../common/api';
import UserDeletion from '../../../components/UserDeletion';
import EmailEditor from '../../../components/EmailEditor';
import Toast from 'react-native-simple-toast';

const options = [
  {
    key: 'en',
    text: 'English',
  },
  {
    key: 'ar',
    text: 'العربية',
  },
];
const {height, width} = Dimensions.get('screen');

class App extends Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerTitle: (
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={Images.headerName}
            resizeMode="contain"
          />
        </View>
      ),
      headerStyle: {
        borderBottomWidth: 0,
        elevation: 0,
        height: 60,
      },
    };
  };
  getUsedTranslation = () => {
    return this.state.currentLanguage
      ? this.state.currentLanguage
      : this.state.user && this.state.user.language;
  };

  constructor(props) {
    super(props);
    this.state = {
      accInfo: false,
      optionSelected: '',
      visibleModal: false,
      isVisible: false,
      selection: 0,
      user: null,
      language: null,
      updateUserName: null,
      currentLanguage: null,
      currentpassword: null,
      newpassword: null,
      confirmpassword: null,
      switchValue: false,
      usernameEditField: null,
      promoCode: '',
      promoLoading: false,
      languageId: this.props.locale == 'ar' ? 1 : 2,
    };
    this.changePofilePic = this.changePofilePic.bind(this);
    this.imagePicker = this.imagePicker.bind(this);
    this.onLanguageChangeProps = this.onLanguageChangeProps.bind(this);
    this.signOut = this.signOut.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.submitImage = this.submitImage.bind(this);
    this.configureFCM = this.configureFCM.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.getUsedTranslation = this.getUsedTranslation.bind(this);
    this.changeFullname = this.changeFullname.bind(this);
    this.onPromoSubmit = this.onPromoSubmit.bind(this);
  }

  async configureFCM() {
    console.log('allowed fcm222');
    firebase
      .messaging()
      .hasPermission()
      .then(enabled => {
        if (!enabled) {
          firebase
            .messaging()
            .requestPermission()
            .then(() => {
              console.log('allowed fcm');
              // User has authorised
            })
            .catch(error => {
              console.log('allowed fcm333');
              // User has rejected permissions
            });
        }
      });
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      console.log('nsdv', fcmToken);
      let uniqueId = await DeviceInfo.getUniqueId();
      let osType = Platform.OS == 'ios' ? 1 : 2;
      //4rd parameter->forcefully updated
      this.props.dispatch(sendFCMToken(fcmToken, osType, uniqueId, true));
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user && props.user.fullname != state.fullname && state.initial) {
      return {
        initial: false,
        user: props.user,
        usernameEditField: props.user.fullname,
      };
    }
    return {
      user: props.user,
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchResetLoaders());
    this.configureFCM();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps != this.props && this.props.user != prevProps.user) {
      // this.configureFCM()
      this.setState({
        updateUserName: this.props.user && this.props.user.fullname,
      });
      I18n.locale =
        this.props.user && this.props.user.language
          ? this.props.user.language
          : this.props.locale;
    }
  }

  toggleSwitch = value => {
    let status = 0;
    if (value) {
      status = 1;
    }
    this.setState({switchValue: value});
    this.props.dispatch(postNotificationToggle({status: status}));
  };

  changePofilePic() {
    this.ActionSheet.show();
  }

  signOut() {
    this.props.dispatch(resetUser());
  }

  onLanguageChangeProps(currentLanguage) {
    this.setState({currentLanguage});
  }

  onLanguageChange() {
    I18n.locale = this.state.currentLanguage
      ? this.state.currentLanguage
      : this.state.user && this.state.user.language;
    this.setState({visibleModal: false, selection: 0});
    this.props.dispatch(
      postChangeLanguage({
        language: this.state.currentLanguage,
      }),
    );
  }

  submitImage(image_temp) {
    if (image_temp) {
      this.props.dispatch(postChangeProfileImage({image: image_temp}));
    }
  }

  changeFullname() {
    this.props.dispatch(fetchChangeName(this.state.updateUserName));
    this.setState({isVisible: null, initial: true});
  }

  imagePicker(index) {
    let image_temp = null;
    switch (index) {
      case 0:
        ImagePicker.openCamera({
          width: 400,
          height: 400,
          cropping: true,
        }).then(image => {
          image_temp = {uri: image.path, type: image.mime, name: 'test.jpg'};
          this.setState({
            image: {uri: image.path, type: image.mime, name: 'test.png'},
          });
          this.submitImage(image_temp);
        });
        break;
      case 1:
        ImagePicker.openPicker({
          width: 400,
          height: 400,
          cropping: true,
        }).then(image => {
          image_temp = {uri: image.path, type: image.mime, name: 'test.jpg'};
          this.setState({
            image: {uri: image.path, type: image.mime, name: 'test.png'},
          });
          this.submitImage(image_temp);
        });
        break;
    }
  }

  onSubmit() {
    if (
      this.state.currentpassword &&
      this.state.newpassword &&
      this.state.confirmpassword
    ) {
      if (this.state.newpassword == this.state.confirmpassword) {
        if (this.state.currentpassword == this.state.confirmpassword) {
          this.setState({
            validate: 'Old password and new password should be different',
          });
        } else {
          this.setState(
            {validate: null, visibleModal: null, selection: 0},
            () => {
              setTimeout(() => {
                this.props.dispatch(
                  postChangePassword({
                    currentPassword: this.state.currentpassword,
                    newPassword: this.state.newpassword,
                  }),
                );
              }, 1000);
              this.setState({
                currentPassword: null,
                newPassword: null,
                confirmpassword: null,
              });
            },
          );
        }
      } else {
        this.setState({
          validate: 'New password and confirm password should be same',
        });
      }
    } else {
      this.setState({validate: 'Fields cannot be empty'});
    }
  }

  onPromoSubmit() {
    if (this.state.promoCode != null && this.state.promoCode != '') {
      this.setState({promoLoading: true});
      let promocd = this.state.promoCode;
      let formdata = new FormData();
      formdata.append('action', 'add');
      formdata.append('appId', 1);
      formdata.append('invitationCode', promocd);
      Api('post', PROMO_COUNTER, formdata).then(response => {
        this.setState({promoLoading: false});
        this.props.dispatch(promoSubscription(response));
        if (response?.statusCode == 200) {
          this.setState({selection: 4});
        } else {
          this.setState({selection: 5});
          Toast.show(response?.errormessage);
        }
      });
    }
  }

  renderModalEdit = () => (
    <View style={styles.content}>
      <View style={styles.modalClose}>
        <TouchableOpacity onPress={() => this.setState({isVisible: null})}>
          <Icon name="ios-close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.modalTitle}>{I18n.t('Edit_Name')}</Text>
      <View style={styles.txtinput}>
        <TextInput
          value={
            this.state.updateUserName != null
              ? this.state.updateUserName
              : this.state.usernameEditField
          }
          placeholderTextColor={TITLE_COLOR}
          onChangeText={text => this.setState({updateUserName: text})}
          style={styles.modalTxtInput}
        />
      </View>
      {this.state.updateUserName === '' && (
        <Text style={styles.info}>* {I18n.t('user_name_cant_be_empty')}</Text>
      )}
      <TouchableOpacity
        onPress={this.state.updateUserName !== '' && this.changeFullname}
        style={styles.modalButton}>
        <View style={styles.TouchableContentView}>
          <Text style={styles.modalButtonFont}>
            {this.props.isLoading ? I18n.t('changing') : 'Submit'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  renderModalPassword = () => (
    <View style={styles.content}>
      <View style={styles.modalClose}>
        {this.state.selection != 0 && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => this.setState({selection: 0})}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.iconContainer1}
          onPress={() => this.setState({visibleModal: false, selection: 0})}>
          <Ionicons name="ios-close-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>
      {this.state.selection == 0 && (
        <View>
          <Text style={styles.modalTitle}>{I18n.t('Account_Settings')}</Text>
          <TouchableOpacity
            onPress={() =>
              !this.props.isSocialLogin && this.setState({selection: 1})
            }
            style={styles.modalSelectionContent1}>
            <Text
              style={[
                styles.modalText,
                {color: !this.props.isSocialLogin ? TITLE_COLOR : '#D7DBDD'},
              ]}>
              {I18n.t('Change_Password')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({selection: 2})}
            style={styles.modalSelectionContent1}>
            <Text style={styles.modalText}>{I18n.t('Change_Language')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({selection: 3})}
            style={styles.modalSelectionContent2}>
            <Text style={styles.modalText}>Add Invitation Key</Text>
          </TouchableOpacity>
        </View>
      )}
      {this.state.selection == 1 && (
        <View>
          <Text style={styles.modalTitle}>{I18n.t('Change_Password')}</Text>
          <View style={styles.txtinput}>
            <TextInput
              placeholder={I18n.t('Old_Password')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({currentpassword: text})}
              secureTextEntry={true}
              style={styles.modalTxtInput}
            />
          </View>
          <View style={styles.txtinput}>
            <TextInput
              placeholder={I18n.t('New_Password')}
              placeholderTextColor={TITLE_COLOR}
              style={styles.modalTxtInput}
              onChangeText={text => this.setState({newpassword: text})}
              secureTextEntry={true}
            />
          </View>
          <View style={styles.txtinput}>
            <TextInput
              placeholder={I18n.t('Retype_Password')}
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({confirmpassword: text})}
              style={styles.modalTxtInput}
              secureTextEntry={true}
            />
          </View>
          {this.state.validate && (
            <Text style={styles.validationText}>{this.state.validate} </Text>
          )}
          <TouchableOpacity onPress={this.onSubmit} style={styles.modalButton}>
            <View style={styles.TouchableContentView}>
              <Text style={styles.modalButtonFont}>
                {this.props.passwordLoading
                  ? I18n.t('changing')
                  : I18n.t('Change_Password')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {this.state.selection == 2 && (
        <View>
          <Text style={styles.modalTitle}>{I18n.t('Change_Language')}</Text>
          <RadioButton
            options={options}
            lang={this.onLanguageChangeProps}
            locale={this.getUsedTranslation()}
          />
          <TouchableOpacity
            onPress={this.onLanguageChange}
            style={styles.modalButton}>
            <View style={styles.TouchableContentView}>
              <Text style={styles.modalButtonFont}>
                {I18n.t('Change_Language')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {this.state.selection == 3 && (
        <View>
          <Text style={styles.modalTitle}>Add Invitation Key</Text>
          <View style={styles.txtinput}>
            <TextInput
              placeholder="Enter Invitation Key"
              placeholderTextColor={TITLE_COLOR}
              onChangeText={text => this.setState({promoCode: text})}
              style={styles.modalTxtInput}
            />
          </View>
          <TouchableOpacity
            onPress={this.onPromoSubmit}
            style={styles.modalButton}>
            <View style={styles.TouchableContentView}>
              <Text style={styles.modalButtonFont}>
                {this.state.promoLoading ? 'please Wait . . .' : 'Apply'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {this.state.selection == 4 && (
        <View>
          <Text style={styles.modalTitle}>SUCCESS</Text>
          <View style={[styles.txtinput, {height: 100}]}>
            <Text style={styles.modalTxtInput1}>CONGRATULATIONS! </Text>
            <Text style={[styles.modalTxtInput1, {fontSize: 12}]}>
              YOU CAN ENJOY PREMIUM CONTENTS NOW
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.setState({visibleModal: false, selection: 0})}
            style={styles.modalButton}>
            <View style={styles.TouchableContentView}>
              <Text style={styles.modalButtonFont}>{I18n.t('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      {this.state.selection == 5 && (
        <View>
          <Text style={styles.modalTitle}>FAILED</Text>
          <View style={[styles.txtinput, {height: 100}]}>
            <Text style={styles.modalTxtInput1}>SORRY! </Text>
            <Text style={[styles.modalTxtInput1, {fontSize: 12}]}>
              Something went wrong
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => this.setState({visibleModal: false, selection: 0})}
            style={styles.modalButton}>
            <View style={styles.TouchableContentView}>
              <Text style={styles.modalButtonFont}>{I18n.t('Ok')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  render() {
    let keybordHeight = 0;
    if (this.state.selection == 1) {
      keybordHeight = 300;
    } else if (this.state.selection == 3) {
      keybordHeight = 200;
    } else {
      keybordHeight = 0;
    }
    let user = this.props.user;
    return !this.props.user ? (
      <Login navigation={this.props.navigation} />
    ) : (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.notificationIcon}>
          <View style={styles.containerView}>
            <View style={styles.profileContainer}>
              <Image
                style={styles.card}
                source={user != null ? {uri: user.profile_pic} : Images.avatar}
              />
              <View style={styles.editProfContainer}>
                <Touch
                  style={styles.editProf}
                  onPress={() => this.changePofilePic()}>
                  <TouchableOpacity onPress={() => this.changePofilePic()}>
                    <Text numberOfLines={1} style={styles.editProfText}>
                      {I18n.t('Edit_Picture')}
                    </Text>
                  </TouchableOpacity>
                </Touch>
              </View>
            </View>

            <View style={styles.profInfoContainer}>
              <View style={styles.profInfoContainerContent}>
                <Text style={styles.profName} numberOfLines={1}>
                  {user ? user.fullname : '-'}
                </Text>
                <MaterialIcons
                  name="edit"
                  style={styles.userNameIcon}
                  size={19}
                  color="grey"
                  onPress={() =>
                    this.setState({
                      isVisible: true,
                      updateUserName: this.props.user.fullname,
                    })
                  }
                />
              </View>
              {this.props.isPremium && (
                <View style={styles.profInfoContainerContent}>
                  <Text style={styles.profPlace} numberOfLines={2}>
                    Premium Member
                  </Text>
                  <AntDesign
                    name="star"
                    style={styles.userNameIcon}
                    size={16}
                    color={'#D4AF37'}
                  />
                </View>
              )}

              {!user?.isSocialLogin && (
                <EmailEditor navigation={this.props.navigation} />
              )}
              {/* <Text style={styles.profStatus} numberOfLines={2}>{profileDemo.status}</Text> */}
            </View>
          </View>
          {height > 667 && <View style={styles.emptyView} />}
          <View style={styles.subContainer}>
            <View style={styles.subContainerContents}>
              <FontAwesome
                name={'bell-o'}
                color={PRIMARY_COLOR}
                size={25}
                style={styles.notificationIcon}
              />
              <Text style={styles.optionText}>{I18n.t('Notification')}</Text>
              <View style={styles.arrowIcon}>
                <Switch
                  onValueChange={this.toggleSwitch}
                  value={this.state.switchValue}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                !this.props.passwordLoading &&
                this.setState({visibleModal: true})
              }
              style={styles.subContainerContents}>
              <SimpleLineIcons
                name={'user'}
                color={PRIMARY_COLOR}
                size={25}
                style={styles.notificationIcon}
              />
              <Text style={styles.optionText}>
                {this.props.passwordLoading
                  ? I18n.t('changing')
                  : I18n.t('My_Account')}
              </Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('ShareEarn')}
              style={styles.subContainerContents}>
              <Ionicons
                name={'wallet-outline'}
                color={PRIMARY_COLOR}
                size={28}
                style={styles.favIcon}
              />
              <Text style={styles.optionText}>{I18n.t('My_Wallet')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('BookMarks')}
              style={styles.subContainerContents}>
              <Ionicons
                name={'bookmark-outline'}
                color={PRIMARY_COLOR}
                size={28}
                style={styles.favIcon}
              />
              <Text style={styles.optionText}>{I18n.t('My_Bookmarks')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Downloads')}
              style={styles.subContainerContents}>
              <Ionicons
                name={'ios-download-outline'}
                color={PRIMARY_COLOR}
                size={28}
                style={styles.favIcon}
              />
              <Text style={styles.optionText}>{I18n.t('Downloads')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Purchased')}
              style={styles.subContainerContents}>
              <Feather
                name="unlock"
                style={styles.favIcon}
                color={PRIMARY_COLOR}
                size={26}
              />
              <Text style={styles.optionText}>{I18n.t('Purchased')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('AddressManager')}
              style={styles.subContainerContents}>
              <FontAwesome
                name={'address-card-o'}
                color={PRIMARY_COLOR}
                size={22}
                style={styles.notificationIcon}
              />
              <Text style={styles.optionText}>
                {I18n.t('Shipping_Address')}
              </Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('Favourites')}
              style={styles.subContainerContents}>
              <MaterialIcons
                name={'favorite-border'}
                color={PRIMARY_COLOR}
                size={28}
                style={styles.favIcon}
              />
              <Text style={styles.optionText}>{I18n.t('Favourites')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(HELP_AND_SUPPORT + `${this.state.languageId}`)
              }
              style={styles.subContainerContents}>
              <SimpleLineIcons
                name={'info'}
                color={PRIMARY_COLOR}
                size={25}
                style={styles.notificationIcon}
              />
              <Text style={styles.optionText}>{I18n.t('Help_Support')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
            {user && <UserDeletion />}
            <TouchableOpacity
              style={styles.subContainerContents}
              onPress={this.signOut}>
              <Ionicons
                name={'md-log-out'}
                color={PRIMARY_COLOR}
                size={28}
                style={styles.notificationIcon}
              />
              <Text style={styles.optionText}>{I18n.t('Sign_Out')}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons
                  name={'ios-arrow-forward'}
                  color={PRIMARY_COLOR}
                  size={30}
                />
              </View>
            </TouchableOpacity>
          </View>
          <Modal
            isVisible={this.state.visibleModal}
            // onSwipeComplete={() => this.setState({ visibleModal: null })}
            hasBackdrop={true}
            backdropOpacity={0.02}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            onBackButtonPress={() =>
              this.setState({visibleModal: false, selection: 0})
            }
            onBackdropPress={() =>
              this.setState({visibleModal: false, selection: 0})
            }
            animationOutTiming={1000}
            style={styles.bottomModal}>
            <KeyboardAvoidingView
              behavior="padding"
              enabled
              keyboardVerticalOffset={
                Platform.OS == 'ios' ? keybordHeight : -250
              }
              style={[
                styles.KeyboardViewContainer,
                {height: this.state.selection == 1 ? 420 : 300},
              ]}>
              {this.renderModalPassword()}
            </KeyboardAvoidingView>
          </Modal>
          <Modal
            isVisible={this.state.isVisible}
            onSwipeComplete={() => this.setState({visibleModal: null})}
            hasBackdrop={true}
            backdropOpacity={0.02}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            backdropTransitionOutTiming={0}
            animationInTiming={1000}
            animationOutTiming={1000}
            style={styles.bottomModal}>
            <KeyboardAvoidingView
              style={styles.KeyboardViewContainer2}
              behavior="padding"
              enabled
              keyboardVerticalOffset={Platform.OS == 'ios' ? 0 : -300}>
              {this.renderModalEdit()}
            </KeyboardAvoidingView>
          </Modal>
          <ActionSheet
            ref={o => (this.ActionSheet = o)}
            title={'Pick Image'}
            options={['Take Photo', 'Choose from Library', 'Cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={2}
            onPress={index => {
              this.imagePicker(index);
            }}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.text1}>{I18n.t('Powered_By')}</Text>
          <Text style={styles.text2}>{I18n.t('Electronic_Village')}</Text>
          {/* <Text style={styles.text4}>Founded by His Excellency</Text>
                            <Text style={styles.text1}>Mohammed Ahmed Khalifa Al Suwaidi</Text>
                            <Text style={styles.text3}>Version  1.0.1</Text> */}
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    locale: state.userLogin.locale,
    passwordLoading: state.userLogin.passwordLoading,
    isSocialLogin: state.userLogin.isSocialLogin,
    isPremium:
      state.userLogin.isPremium ||
      (state.userLogin.user && state.userLogin.user.isPremium),
    // isImageChanging: state.userLogin.isImageChanging,
    // isAddModalShow: state.dashboard.isAddModalShow,
    // isSubscribed: state.userLogin.isSubcribed,
    // isPremium: state.userLogin.isPremium,
    locationSwitchValue: state.userLogin.locationSwitchValue,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    margin: 10,
  },
  KeyboardViewContainer2: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: -20,
  },
  containerView: {
    flexDirection: 'row',
    marginHorizontal: 5,
    padding: 10,
  },
  bottomModal: {
    marginBottom: 0,
    justifyContent: 'flex-end',
  },
  KeyboardViewContainer: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    // height: '40%',
    // backgroundColor: 'red',
    // marginHorizontal: -20,
    // marginBottom: -25,
    // justifyContent: 'flex-end'
  },
  TouchableContentView: {
    backgroundColor: PRIMARY_COLOR,
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    borderRadius: 25,
  },
  modalButtonFont: {
    fontSize: 20,
    fontFamily: FONT_SEMIBOLD,
    color: '#FFFFFF',
  },
  content: {
    padding: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalClose: {
    flexDirection: 'row',
    height: 30,
  },
  modalTitle: {
    height: 50,
    textAlign: 'center',
    fontSize: 24,
    paddingBottom: 15,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 18,
    padding: 8,
    fontFamily: FONT_REGULAR,
    color: TITLE_COLOR,
  },
  txtinput: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    // paddingLeft: 15,
    marginBottom: 20,
  },
  modalTxtInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    borderRadius: 8,
    paddingLeft: 15,
    borderWidth: 1,
  },
  modalTxtInput1: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: TITLE_COLOR,
    borderRadius: 8,
    padding: 10,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  modalSelectionContent1: {
    borderTopWidth: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#D7DBDD',
    paddingVertical: 5,
    height: 55,
  },
  modalSelectionContent2: {
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: '#D7DBDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    height: 55,
    paddingVertical: 5,
  },
  validationText: {
    color: '#f44336',
    fontFamily: FONT_LIGHT,
    fontSize: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
    marginTop: -5,
  },
  card: {
    height: 120,
    width: 120,
    borderRadius: 80,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerText: {
    padding: 5,
    marginLeft: 5,
    color: '#0C9AF9',
    fontFamily: FONT_REGULAR,
    fontSize: 16,
  },
  logo: {
    marginVertical: 5,
    height: 30,
  },
  profileContainer: {
    alignItems: 'center',
  },
  editProfContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    position: 'absolute',
    top: 100,
  },
  editProf: {
    backgroundColor: '#D75A4A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: -1,
  },
  editProfText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: FONT_SEMIBOLD,
  },
  profInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    marginBottom: 15,
  },
  profName: {
    fontSize: 21,
    fontFamily: FONT_SEMIBOLD,
    marginRight: 5,
  },
  profPlace: {
    fontSize: 16,
    fontFamily: FONT_REGULAR,
    color: SECONDARY_COLOR,
    marginRight: 5,
  },
  profStatus: {
    fontSize: 10,
    fontFamily: FONT_REGULAR,
    color: TITLE_COLOR,
  },
  emptyView: {
    flex: 0.3,
  },
  subContainer: {
    flex: 3,
    justifyContent: 'space-between',
    marginHorizontal: 20,
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
    fontFamily: FONT_MEDIUM,
  },
  arrowIcon: {
    flex: 1,
    alignItems: 'flex-end',
  },
  switch: {
    marginLeft: 10,
    position: 'relative',
    left: Platform.OS === 'ios' ? 2 : 12,
    transform: [
      {scaleX: Platform.OS === 'ios' ? 0.9 : 1},
      {scaleY: Platform.OS === 'ios' ? 0.8 : 1},
    ],
  },
  walletIcon: {
    flex: 1,
  },
  favIcon: {
    flex: 1,
    marginLeft: -2,
    marginRight: 2,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text1: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.55,
    fontFamily: FONT_REGULAR,
  },
  text2: {
    fontSize: 15,
    color: '#000000',
    fontFamily: FONT_MEDIUM,
  },
  text3: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.55,
    fontFamily: FONT_REGULAR,
  },
  text4: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.55,
    fontFamily: FONT_REGULAR,
  },
  iconContainer: {
    alignItems: 'flex-start',
  },
  iconContainer1: {
    alignItems: 'flex-end',
    flex: 1,
  },
  profInfoContainerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
