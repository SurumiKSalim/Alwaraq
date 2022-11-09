import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {store} from '../common/store';
import {connect} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  TITLE_COLOR,
  BLACK_COLOR,
  WHITE_COLOR,
} from '../assets/color';
import {
  FONT_PRIMARY,
  FONT_SECONDARY,
  FONT_MEDIUM,
  FONT_SEMIBOLD,
  FONT_REGULAR,
} from '../assets/fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import ModalDropdown from 'react-native-modal-dropdown'
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Images from '../assets/images';
import Api from '../common/api';
import Hyperlink from 'react-native-hyperlink';
import {POST_COMMENT, USER_HOST, COMMENTS_FORM} from '../common/endpoints';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.item,
      edit: false,
      isOptionVisible: false,
      delete: false,
      isModalVisible: false,
      comment: this.props.item.comment,
    };
    this.dropDown = this.dropDown.bind(this);
    this.Select = this.Select.bind(this);
    this.editcomment = this.editcomment.bind(this);
    this.deletecomment = this.deletecomment.bind(this);
    this.emptyComment = this.emptyComment.bind(this);
    this.navToReportPage = this.navToReportPage.bind(this);
  }

  dropDown(rowData, rowID, highlighted, index) {
    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.edit}
          onPress={() => this.Select(rowID, index)}>
          <Text style={styles.textEdit}>{rowData}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  navToReportPage() {
    let user = store.getState().userLogin.user;
    if (user) {
      this.props.modalClose();
      this.props.navigation.navigate('ReportPage', {item: this.state.item});
    } else {
      Toast.show('Please login to continue');
    }
  }

  Select(rowID, index) {
    if (rowID == 0) {
      this.setState({edit: true});
    } else if (rowID == 1) {
      this.setState({delete: true});
    }
    return <View />;
  }

  openLink(link) {
    Linking.canOpenURL(link)
      .then(supported => {
        if (!supported) {
          console.log("Can't handle url: " + link);
        } else {
          return Linking.openURL(link);
        }
      })
      .catch(err => console.error('An error occurred', err));
  }

  editcomment() {
    if (this.state.comment !== null && this.state.comment !== '') {
      this.setState({edit: false, isOptionVisible: false});
      this.props.commentsFetch(
        'edit',
        this.state.comment,
        this.state.item.commentId,
        this.state.item,
      );
    }
  }

  deletecomment() {
    this.setState({delete: false, isOptionVisible: false});
    this.props.commentsFetch(
      'delete',
      null,
      this.state.item.commentId,
      this.state.item,
    );
  }

  emptyComment() {
    this.setState({edit: false, commentId: null, isOptionVisible: false});
  }

  render() {
    return (
      this.props.index <= this.props.limitedCount && (
        <View style={styles.card}>
          {this.state.edit ? (
            <View style={{flex: 6, flexDirection: 'row'}}>
              <View style={styles.profileContainer}>
                <View style={styles.imgContainer}>
                  <Image
                    source={
                      this.state.item && this.state.item.profilePic
                        ? {uri: USER_HOST + this.state.item.profilePic}
                        : Images.default
                    }
                    style={styles.image}
                  />
                </View>
                <Text numberOfLines={2} style={styles.name}>
                  {this.state.item.fullName}
                </Text>
              </View>
              <View style={styles.textContainer}>
                {/* <Text style={styles.name}>{this.state.item.fullName}</Text> */}
                <View style={styles.textCommentEdit}>
                  <TextInput
                    style={styles.textComment}
                    placeholder="Write a comment"
                    onChangeText={text => this.setState({comment: text})}
                    // onBlur={this.emptyComment}
                  >
                    {this.state.comment}
                  </TextInput>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.time}>{this.state.item.commentDate}</Text>
                  {this.state.comment !== null && this.state.comment === '' && (
                    <Text style={{color: 'red', flex: 1, marginLeft: 8}}>
                      *Required
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={{flex: 5, flexDirection: 'row'}}>
              <View style={styles.profileContainer}>
                <View style={styles.imgContainer}>
                  <Image
                    source={
                      this.state.item && this.state.item.profilePic
                        ? {uri: USER_HOST + this.state.item.profilePic}
                        : Images.default
                    }
                    style={styles.image}
                  />
                </View>
                <Text numberOfLines={2} style={styles.name}>
                  {this.state.item.fullName}
                </Text>
              </View>
              <View style={styles.textContainer}>
                <Hyperlink
                  linkStyle={{color: '#0000EE', fontStyle: 'italic'}}
                  onPress={(url, text) => this.openLink(url)}>
                  <Text style={{fontSize: 15}}>
                    <Text style={styles.textComment}>{this.state.comment}</Text>
                  </Text>
                </Hyperlink>
                <View style={styles.report}>
                  <Text style={styles.time}>{this.state.item.commentDate}</Text>
                  {!this.state.item.isOwner && (
                    <TouchableOpacity onPress={() => this.navToReportPage()}>
                      <Text style={styles.reportText}>Report</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
          <View style={styles.delete}>
            {
              this.state.item.isOwner && !this.state.edit && !this.state.delete && (
                <View style={{height: '100%'}}>
                  <MaterialIcons
                    style={{alignSelf: 'flex-end'}}
                    onPress={() =>
                      this.setState({isOptionVisible: true, edit: false})
                    }
                    name="dots-vertical"
                    size={28}
                    color="#9c9c9c"
                  />
                  {this.state.isOptionVisible && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        backgroundColor: '#fff',
                        justifyContent: 'space-around',
                        flexDirection: 'row',
                        width: 150,
                        marginRight: 1,
                        shadowOpacity: 0.2,
                        shadowOffset: {width: 1, height: 1},
                        borderRadius: 20,
                        marginTop: 1,
                      }}>
                      <TouchableOpacity
                        onPress={() => this.setState({edit: true})}
                        style={{padding: 8, alignItems: 'center'}}>
                        <IconMaterial name="edit" size={28} color="#9c9c9c" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this.setState({delete: true})}
                        style={{padding: 8, alignItems: 'center'}}>
                        <IconMaterial name="delete" size={28} color="#9c9c9c" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          justifyContent: 'center',
                          paddingHorizontal: 5,
                        }}>
                        <AntDesign
                          onPress={() =>
                            this.setState({isOptionVisible: false})
                          }
                          name="closecircle"
                          size={18}
                          color="rgb(255,45,85)"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )
              // <ModalDropdown
              //     //ref={el => refs = el}
              //     showsVerticalScrollIndicator={false}
              //     options={['Edit', 'Delete']}
              //     disabled={this.state.isModalVisible}
              //     dropdownTextStyle={{ textAlign: 'center', fontSize: 15 }}
              //     dropdownStyle={{ width: 130, borderWidth: 1, elevation: 3, height: 97, shadowOffset: { width: 1, height: 1, }, shadowColor: 'black', shadowOpacity: .3 }}
              //     renderRow={(rowData, rowID, highlighted) => this.dropDown(rowData, rowID, highlighted)}
              // >
              //     <MaterialIcons name='dots-vertical' size={28} color='#9c9c9c' />
              // </ModalDropdown>
            }
            {this.state.item.isOwner && this.state.edit && (
              <TouchableOpacity
                onPress={() =>
                  this.state.comment != this.state.item.comment
                    ? this.editcomment()
                    : this.emptyComment()
                }>
                <IconMaterial name="send" size={24} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            )}
            {this.state.item.isOwner && this.state.delete && (
              <TouchableOpacity onPress={() => this.deletecomment()}>
                <IconMaterial name="delete" size={24} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )
    );
  }
}

const mapStateToProps = state => {
  return {
    modalAction: state.offlinebook.modalAction,
  };
};

export default connect()(App);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 15,
  },
  imgContainer: {
    height: 66,
    width: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  textContainer: {
    flex: 1,
    paddingLeft: 10,
    backgroundColor: '#ededed',
    borderColor: PRIMARY_COLOR,
    borderWidth: 0.5,
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingRight: 10,
    borderRadius: 20,
  },
  name: {
    fontSize: 13,
    color: WHITE_COLOR,
    fontFamily: FONT_MEDIUM,
    alignSelf: 'center',
    marginTop: 10,
  },
  textComment: {
    fontSize: 11,
    color: WHITE_COLOR,
    fontFamily: FONT_MEDIUM,
    padding: 0,
    width: '100%',
    // fontSize: 16,
    // fontFamily: FONT_SECONDARY,
    // color: '#6D6D6D',
  },
  textCommentEdit: {
    height: 45,
    borderColor: PRIMARY_COLOR,
    borderRadius: 6,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginVertical: 5,
  },
  report: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 13,
    fontFamily: FONT_SECONDARY,
    color: '#A2A2A2',
  },
  reportText: {
    fontSize: 13,
    fontFamily: FONT_SECONDARY,
    color: '#0062cc',
  },
  delete: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },

  modalContainer: {
    flex: 1,
    padding: 15,
  },
  edit: {
    flex: 1,
    flexDirection: 'row',
  },
  textEdit: {
    fontSize: 14,
    paddingLeft: 10,
  },
  profileContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
});
