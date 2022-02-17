import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR, TITLE_COLOR, SECONDARY_COLOR } from '../../../assets/color'
import { CONTACT_US } from '../../../common/endpoints'
import Api from '../../../common/api'


const App = (props) => {

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setisLoading] = useState(false)
  const [mobile, setMobile] = useState('')
  const [feedback, setFeedback] = useState('')
  const [errors, setErrors] = useState({})

  const isvaildData = () => {
    if (name == '' || name == null) {
      setErrors({ errors: { ...errors, nameError: true } })
      return false;
    }
    if (email == '' || email == null) {
      setErrors({ errors: { ...errors, emailError: true,errorMessage:'Email Required!' } })
      return false;
    }
    if (mobile == '' || mobile == null) {
      setErrors({ errors: { ...errors, mobileError: true } })
      return false;
    }
    if (feedback == '' || feedback == null) {
      setErrors({ errors: { ...errors, feedbackError: true } })
      return false;
    }
    return true;
  }

  const validate = (text) => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      console.log("Email is Not Correct");
      setErrors({ errors: { ...errors, emailError: true,errorMessage:'Please check Email format' } })
      // this.setState({ email: text })
      return false;
    }
    else {
      // this.setState({ email: text })
      console.log("Email is Correct");
      return true;
    }
  }

  const onSubmit = (action) => {
    console.log('validate', validate(email))
    if (!isLoading) {
      setErrors({ errors: {} })
      if (!isvaildData())
        return 0;
      else if (!validate(email))
        return 0;
      else {
        setisLoading(true)
        let formdata = new FormData()
        formdata.append('action', 'contact')
        formdata.append('name', name)
        formdata.append('email', email)
        formdata.append('mobile', mobile)
        formdata.append('appId', 1)
        console.log('formdata', formdata)
        Api('post', CONTACT_US, formdata).then(async (response) => {
          setisLoading(false)
          if (response && response.statusCode == 200) {
            Alert.alert(I18n.t("Your_feedback_sent_successfully"),
              '',
              [
                { text: 'OK', onPress: () => props.navigation.goBack() },
              ],
              { cancelable: false },
            )
          }
          else {
            setErrors({ errors: { ...errors, responseError: true } })
          }
        })
        // this.props.dispatch(fetchShippingInfos(formdata))
      }
    }
  }

  const addressView = () => {
    let error = errors && errors.errors
    return (
      <View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={I18n.t("Name")}
            placeholderTextColor={SECONDARY_COLOR}
            value={name}
            onChangeText={(text) => setName(text)}
            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />
        </View>
        {error && error.nameError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Name Required!</Text></View>}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={I18n.t("Email_address")}
            placeholderTextColor={SECONDARY_COLOR}
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]}
            caretHidden={Platform.OS === 'ios' ? false : true}
            keyboardType='email-address'
            autoCompleteType='email'
          />
        </View>
        {error && error.emailError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>{error && error.errorMessage}</Text></View>}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={I18n.t("Mobile_Number")}
            placeholderTextColor={SECONDARY_COLOR}
            value={mobile}
            keyboardType='number-pad'
            onChangeText={(text) => setMobile(text)}
            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />
        </View>
        {error && error.mobileError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Mobile Number Required!</Text></View>}
        <View style={[styles.inputContainer, { height: 120 }]}>
          <TextInput
            placeholder={I18n.t("Feedback")}
            placeholderTextColor={SECONDARY_COLOR}
            value={feedback}
            multiline={true}
            onChangeText={(text) => setFeedback(text)}
            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />
        </View>
        {error && error.feedbackError == true && <View style={styles.infoTextContainer}><Text style={styles.infoText}>Feedback Required!</Text></View>}
        {/* <View style={styles.inputContainer}>
          <TextInput
            placeholder={I18n.t("Telephone_Number")}
            placeholderTextColor={SECONDARY_COLOR}
            value={telephone}
            keyboardType='number-pad'
            onChangeText={(text) => setTelephone(text)}
            style={[styles.input, { textAlign: props.locale == 'ar' ? 'right' : 'left', }]} />
        </View> */}
        {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginVertical: 5, alignItems: 'center' }}>
          <Text style={styles.defaultText2}>{I18n.t("Set_as_default_Address")}</Text>
          <Fontisto onPress={() => this.setState({ isDefault: !this.state.isDefault })} name={this.state.isDefault ? 'radio-btn-active' : 'radio-btn-passive'} size={20} color={PRIMARY_COLOR} />
        </View> */}
        <TouchableOpacity onPress={() => onSubmit()} style={styles.addContainer}>
          <Text style={[styles.addContainerText, { color: '#fff' }]}>{!isLoading ? I18n.t("Send_Feedback") : I18n.t("Please_Wait")}</Text>
        </TouchableOpacity>
        {error && error.responseError == true && <View style={styles.infoTextContainer}><Text style={[styles.infoText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]}>{I18n.t("Something_went_wrong_Try")}</Text></View>}
        {/* <TouchableOpacity onPress={() => this.setState({ addressEditor: null })} style={[styles.addContainer, { backgroundColor: '#fff' }]}>
          <Text style={[styles.addContainerText, { color: PRIMARY_COLOR }]}>{I18n.t("Cancel")}</Text>
        </TouchableOpacity> */}
      </View>
    )
  }
  return (
    <ScrollView style={styles.SafeAreaViewContainer}>
      <View>
        <Text style={[styles.title, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]}>{I18n.t("ContactUs")}</Text>
        <View style={[styles.emptyContainer, { alignSelf: props.locale == 'ar' ? 'flex-end' : 'flex-start' }]} />
      </View>
      <Text style={[styles.headerText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]}>{I18n.t("Your_feedback")}</Text>
      {addressView()}
    </ScrollView>
  );
}

const mapStateToProps = (state) => {
  return {
    locale: state.userLogin.locale,
  }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
  SafeAreaViewContainer: {
    flex: 1,
    margin: 10
  },
  title: {
    textAlign: 'left',
    fontSize: 18,
    color: '#272727',
    fontFamily: FONT_BOLD
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 68,
    marginBottom: 10
  },
  headerText: {
    fontFamily: FONT_SEMIBOLD,
    fontSize: 14,
    color: SECONDARY_COLOR,
    marginBottom: 20
  },
  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 8,
    backgroundColor: '#ededed'
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_SEMIBOLD,
    color: SECONDARY_COLOR,
    padding: 0,
    margin: 0,
  },
  addContainer: {
    backgroundColor: '#ededed',
    borderWidth: .5,
    borderRadius: 4,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: PRIMARY_COLOR
  },
  addContainerText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    fontFamily: FONT_REGULAR,
    fontSize: 18,
  },
  infoTextContainer: {
    marginBottom: 10
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT_MEDIUM,
    color: 'red'
  },
})