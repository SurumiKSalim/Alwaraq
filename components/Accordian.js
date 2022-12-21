import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {BLUR_COLOR, PRIMARY_COLOR, SECONDRY_BLUR, WHITE_COLOR} from '../assets/color';
import {FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD} from '../assets/fonts';
import DynamicText, {DynamicView, IS_IPAD} from '../common/dynamicviews';

const {width, height} = Dimensions.get('window');

export default class Accordian extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      expanded: false,
    };
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  render() {
    console.log('title', this.props.title);
    return (
      <View style={{width: width-30}}>
        <TouchableOpacity
          ref={this.accordian}
          style={[styles.row, {borderRadius: this.state.expanded ? 0 : 8}]}
          onPress={() => this.toggleExpand()}>
          <DynamicText numberOfLines={1} style={styles.title}>
            {this.props.title}
          </DynamicText>
          <Icon
            name={
              this.state.expanded
                ? 'keyboard-arrow-down'
                : 'keyboard-arrow-right'
            }
            size={30}
          />
        </TouchableOpacity>
        {this.state.expanded && (
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('DuaaDetails', {
                item: this.props.item,
              })
            }
            style={styles.child}>
            <View style={styles.txtContainer}>
              <DynamicText numberOfLines={4} style={styles.subtitle}>
                {this.props.title}
              </DynamicText>
            </View>
            <View></View>
            <AutoHeightWebView
              style={styles.autoWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              // scalesPageToFit={true}
              scrollEnabled={false}
              onShouldStartLoadWithRequest={event => {
                if (event.url.slice(0, 4) === 'http') {
                  Linking.openURL(event.url);
                  return false;
                }
                return true;
              }}
              customStyle={
                Platform.OS != 'ios'
                  ? `
                            * {
                            }
                            p {
                              font-size: 20px;
                            }
                          `
                  : `
                          * {
                          }
                          p {
                            font-size: 20px;
                          }
                        `
              }
              mixedContentMode="compatibility"
              source={{html: this.props.data}}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({expanded: !this.state.expanded});
  };
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'justify',
    flexShrink: 1,
    fontFamily: FONT_SEMIBOLD,
    fontSize: 18,
    flex: 1,
  },
  subtitle: {
    fontFamily: FONT_BOLD,
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 46,
    paddingLeft: 5,
    alignItems: 'center',
    shadowOpacity:.2,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor:'#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 8,
    paddingLeft: 15,
    width: width-32,
    marginLeft:1
  },
  parentHr: {
    height: 1,
    color: '#fff',
    width: '100%',
  },
  child: {
    backgroundColor: BLUR_COLOR,
    padding: 5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: width,
  },
  numberContainer: {
    width: 30,
    height: 30,
    backgroundColor: BLUR_COLOR,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    zIndex: 10,
  },
  number: {
    color: WHITE_COLOR,
  },
  dotLine: {
    borderColor: WHITE_COLOR,
    height: 14,
    position: 'absolute',
    borderStyle: 'dashed',
    borderWidth: 0.5,
    top: 30,
  },
  dotLine2: {
    borderColor: WHITE_COLOR,
    height: 14,
    position: 'absolute',
    borderStyle: 'dashed',
    borderWidth: 0.5,
    top: -14,
  },
  dotLine0: {
    borderWidth: 0.5,
    borderColor: WHITE_COLOR,
    borderStyle: 'dashed',
    height: 14,
    position: 'absolute',
    bottom: 30,
  },
  //   dotLine2: {
  //     backgroundColor: BLUR_COLOR,
  //     width: 1,
  //     height: '144%',
  //     position: 'absolute',
  //     top: 15,
  //   },
  descContain: {
    marginRight: 20,
    marginLeft: -0.5,
    borderColor: WHITE_COLOR,
    borderStyle: 'dashed',
    borderWidth: 0.5,
  },
  desc: {
    color: WHITE_COLOR,
    width: '100%',
    fontFamily: FONT_REGULAR,
    fontSize: 17,
  },
  image: {
    height: 193,
    width: '100%',
    resizeMode: 'stretch',
    borderRadius: 20,
    marginBottom: 10,
  },
  txtContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 15,
    paddingHorizontal: 18,
  },
  autoWebView: {
      width: width - 35,
  },
});
