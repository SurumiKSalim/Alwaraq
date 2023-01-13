import React, {Component} from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {FONT_REGULAR, FONT_MEDIUM, FONT_SEMIBOLD} from '../assets/fonts';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
  BLACK_COLOR,
  WHITE_COLOR,
} from '../assets/color';
import Modal from 'react-native-modal';
import RadioButton from '../components/radioButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from '../i18n';
import {toogleLanguageModal} from '../screens/home/actions';
import {postChangeLanguage, resetFirstLogin} from '../screens/login/actions';

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

class App extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
    };
    this.onLanguageChangeProps = this.onLanguageChangeProps.bind(this);
    this.onLanguageChange = this.onLanguageChange.bind(this);
  }

  onLanguageChangeProps(currentLanguage) {
    this.setState({currentLanguage});
  }

  onLanguageChange() {
    if (this.state.currentLanguage != this.props.locale) {
      I18n.locale = this.state.currentLanguage
        ? this.state.currentLanguage
        : this.state.user?.language;
      this.setState({selection: 0});
      {
        this.props.user
          ? this.props.dispatch(
              postChangeLanguage({
                language: this.state.currentLanguage,
              }),
            )
          : this.props.dispatch(
              resetFirstLogin({locale: this.state.currentLanguage}),
            );
      }
      // if (!this.props.isUserLoading) {
      //     this.dataFetch();
      // }
    }
    this.props.dispatch(toogleLanguageModal());
  }

  getUsedTranslation = () => {
    return this.props.user
      ? this.props.user && this.props.user.language
      : this.props.locale;
    // return this.state.currentLanguage ? this.state.currentLanguage :this.state.user&& this.state.user.language
  };

  renderModalPassword = () => (
    <View style={styles.content}>
      <View style={styles.modalClose}>
        <TouchableOpacity
          style={styles.iconContainer1}
          onPress={() => this.props.dispatch(toogleLanguageModal())}>
          <Ionicons
            name="ios-close-circle-outline"
            size={30}
            color={WHITE_COLOR}
          />
        </TouchableOpacity>
      </View>
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
          {/* <View style={styles.TouchableContentView}> */}
          <Text style={styles.modalButtonFont}>
            {I18n.t('Change_Language')}
          </Text>
          {/* </View> */}
        </TouchableOpacity>
      </View>
    </View>
  );

  render() {
    return (
      <Modal
        isVisible={this.props.languageModalVisible}
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
        <KeyboardAvoidingView style={styles.KeyboardViewContainer}>
          {this.renderModalPassword()}
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    languageModalVisible: state.dashboard.languageModalVisible,
    locale: state.userLogin.locale,
  };
};

export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  bottomModal: {
    marginBottom: -50,
    justifyContent: 'flex-end',
  },
  KeyboardViewContainer: {
    marginHorizontal: -25,
    marginTop: -25,
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    height: 350,
  },
  content: {
    padding: 15,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: BLACK_COLOR,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalClose: {
    flexDirection: 'row',
  },
  iconContainer1: {
    alignItems: 'flex-end',
    flex: 1,
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 24,
    paddingBottom: 15,
    fontFamily: FONT_SEMIBOLD,
    color: WHITE_COLOR,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 50,
    // backgroundColor:PRIMARY_COLOR,
    // borderRadius: 25
  },
  TouchableContentView: {
    // backgroundColor: PRIMARY_COLOR,
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonFont: {
    fontSize: 20,
    fontFamily: FONT_SEMIBOLD,
    color: '#FFFFFF',
    backgroundColor: PRIMARY_COLOR,
    flex: 1,
    width: '100%',
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 25,
  },
});
