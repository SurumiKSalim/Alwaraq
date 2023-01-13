import React, {Component} from 'react';
import _ from 'lodash';
import {
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  Dimensions,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import {connect} from 'react-redux';
import {
  TITLE_COLOR,
  FONT_MEDIUM,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
} from '../assets/color';
import {FONT_PRIMARY, FONT_SECONDARY, FONT_REGULAR} from '../assets/fonts';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Images from '../assets/images';
import Api from '../common/api';
import {
  fetchLike,
  fetchCommentModal,
  fetchCommentCount,
} from '../screens/detailBuy/actions';
import Comment from './Comments';
import I18n from '../i18n';
// import Hyperlink from 'react-native-hyperlink'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {POST_COMMENT, USER_HOST, COMMENTS_FORM} from '../common/endpoints';
import {BallIndicator, BarIndicator} from 'react-native-indicators';

const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 100;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};
const {height, width} = Dimensions.get('screen');
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      book: this.props.book,
      isCommentsVisible: null,
      page: 1,
      isLastPage: true,
      comments: [],
      totalComments: 0,
    };
    this.commentsFetch = this.commentsFetch.bind(this);
    this.modalClose = this.modalClose.bind(this);
    this.modalCloseOnReport = this.modalCloseOnReport.bind(this);
  }

  componentDidMount() {
    this.commentsFetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isCommentsVisible != this.props.isCommentsVisible) {
      this.setState({isCommentsVisible: this.props.isCommentsVisible});
    }
  }

  modalClose() {
    this.setState({page: 1});
    this.props.dispatch(fetchCommentModal(true));
  }

  modalCloseOnReport() {
    this.setState({page: 1});
    this.props.dispatch(fetchCommentModal(false));
  }

  commentsFetch(action, comment, commentId, item, page) {
    this.setState({
      page: page ? page : this.state.page,
      comments: action == 'add' && this.props.user ? [] : this.state.comments,
    });
    if (action != 'add' || this.props.user) {
      this.setState({isCommentLoading: true, newComment: null});
      let formdata = new FormData();
      formdata.append(
        'bookId',
        this.state.book.bookid
          ? this.state.book.bookid
          : this.state.book.itemId,
      );
      formdata.append('action', action);
      formdata.append('page', page ? page : 1);
      formdata.append('comment', comment ? comment : this.state.newComment);
      formdata.append('commentId', commentId);
      // formdata.append('mansionId', this.props.mansionId)
      // formdata.append('categoryId', this.state.item.categoryId)
      Api('post', COMMENTS_FORM, formdata).then(response => {
        if (response && response.statusCode == 200) {
          this.props.dispatch(fetchCommentCount(response.totalComments));
          if (action == 'add' || action == undefined) {
            this.setState({
              comments: this.state.comments.concat(response.comments),
              totalComments: response.totalComments,
              isCommentLoading: false,
              newComment: '',
              isLastPage: response.isLastPage,
              page: 1,
            });
          } else {
            if (action == 'delete') {
              this.setState({
                comments: _.without(this.state.comments, item),
                isCommentLoading: false,
                newComment: '',
                isLastPage: response.isLastPage,
                totalComments: response.totalComments,
              });
            }
            if (action == 'edit') {
              this.setState({
                comments: _.unionBy(
                  item,
                  this.state.comments,
                  this.state.comments && this.state.comments.commentId,
                ),
                isCommentLoading: false,
                newComment: '',
              });
            }
          }
        } else {
          this.setState({isCommentLoading: false});
        }
      });
    } else {
      this.props.dispatch(fetchCommentModal(false));
      // this.props.goToLogin(true)
      setTimeout(() => {
        this.props.goToLogin(true);
      }, 550);
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Modal
          isVisible={this.props.modalAction}
          hideModalContentWhileAnimating={true}
          useNativeDriver={true}
          animationOutTiming={300}
          hasBackdrop={true}
          backdropOpacity={0.9}
          backdropTransitionOutTiming={800}
          animationInTiming={800}
          onBackButtonPress={() =>
            this.props.dispatch(fetchCommentModal(false))
          }
          onBackdropPress={() => this.props.dispatch(fetchCommentModal(false))}
          style={styles.bottomModal}>
          <KeyboardAwareScrollView
            extraHeight={150}
            scrollEnabled={false}
            style={styles.commentsModalContainer}>
            <View style={styles.modalHeader}>
              <View
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: 1,
                  borderColor: '#EDEDED',
                }}>
                <Icon
                  onPress={() => this.props.dispatch(fetchCommentModal(false))}
                  name="md-arrow-back"
                  size={24}
                  color="#000"
                />
                <View style={{flex: 1}}>
                  <Text style={styles.heading}>
                    {I18n.t('comments')} ({' '}
                    {this.state.comments ? this.state.totalComments : '0'} )
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.commentContainer}>
              {/* <Text style={styles.heading}>COMMENTS ( {this.state.comments ? this.state.comments.length : '0'} )</Text> */}
              <View style={styles.input}>
                <TextInput
                  style={styles.commentInput}
                  multiline={true}
                  placeholder={I18n.t('write_comment')}
                  value={this.state.newComment}
                  // onFocus={() => Platform.OS == 'ios' && this.myRef.getNode().scrollTo({ y: 0, animated: true, })}
                  onChangeText={text => this.setState({newComment: text})}
                  ref={input => {
                    this.textInput = input;
                  }}
                />
                <TouchableOpacity
                  style={styles.send}
                  onPress={() =>
                    this.state.newComment != null &&
                    this.state.newComment != '' &&
                    this.commentsFetch('add')
                  }>
                  <View
                    style={{
                      backgroundColor: PRIMARY_COLOR,
                      flex: 1,
                      width: '100%',
                      paddingHorizontal: 15,
                      justifyContent: 'center',
                      alignContent: 'center',
                    }}>
                    <MaterialIcons name="send" size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
              <ScrollView
                scrollEventThrottle={1}
                onMomentumScrollEnd={({nativeEvent}) => {
                  if (isCloseToBottom(nativeEvent)) {
                    !this.state.isCommentLoading &&
                      !this.state.isLastPage &&
                      this.commentsFetch(
                        null,
                        null,
                        null,
                        null,
                        this.state.page + 1,
                      );
                  }
                }}
                showsVerticalScrollIndicator={false}
                height={height * 0.68}
                style={styles.comment}>
                <FlatList
                  data={this.state.comments}
                  style={styles.commentFlatList}
                  showsVerticalScrollIndicator={false}
                  extraData={this.state.comments}
                  keyExtractor={item => item && item.commentId}
                  renderItem={({item, index}) => (
                    <Comment
                      item={item}
                      limitedCount={
                        this.state.comments && this.state.totalComments
                      }
                      index={index}
                      commentsFetch={this.commentsFetch}
                      id={this.state.book.bookid}
                      navigation={this.props.navigation}
                      modalClose={this.modalCloseOnReport}
                    />
                  )}
                />
              </ScrollView>
            </View>
            {this.state.isCommentLoading && (
              <BarIndicator
                style={{position: 'absolute', top: 0, bottom: 0, width: width}}
                color={PRIMARY_COLOR}
                size={34}
              />
            )}
          </KeyboardAwareScrollView>
        </Modal>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userLogin.user,
    modalAction: state.offlinebook.modalAction,
  };
};
export default connect(mapStateToProps)(App);

const styles = StyleSheet.create({
  bottomModal: {
    marginBottom: 0,
    marginTop: 150,
    justifyContent: 'flex-end',
  },
  commentsModalContainer: {
    marginHorizontal: -15,
    height: height * 0.8,
    marginTop: -25,
    backgroundColor: '#fff',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
  },
  commentContainer: {
    paddingHorizontal: 10,
  },
  heading: {
    marginBottom: 8,
    fontSize: 17,
    alignSelf: 'center',
    fontFamily: FONT_MEDIUM,
    color: '#303030',
  },
  comment: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentFlatList: {
    flex: 1,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#3E525E',
    borderRadius: 5,
    paddingLeft: 10,
    // paddingRight: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  send: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    fontSize: 16,
    fontFamily: FONT_MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  commentInput: {
    flex: 1,
    fontFamily: FONT_MEDIUM,
    fontSize: 14,
  },
  commentText: {
    fontSize: 16,
    color: '#9c9c9c',
    fontFamily: FONT_REGULAR,
    marginLeft: 5,
  },
  likeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    padding: 15,
  },
  keyboardaware: {
    padding: 15,
  },
});
