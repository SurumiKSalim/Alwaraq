/*Example of React Native Video*/
import React, { Component } from 'react';
//Import React
import { Platform, StyleSheet, Text, View, Dimensions } from 'react-native';
//Import Basic React Native Component
import Video from 'react-native-video';
//Import React Native Video to play video
import MediaControls, { PLAYER_STATES } from 'react-native-media-controls';
//Media Controls to control Play/Pause/Seek and full screen

class App extends Component {
  videoPlayer;

  constructor(props) {
    super(props);
    this.state = {
      currentTime: 0,
      duration: 0,
      isFullScreen: false,
      isLoading: true,
      paused: false,
      index:0,
      playerState: PLAYER_STATES.PLAYING,
      screenType: 'contain',
    };
    this.onFullScreen = this.onFullScreen.bind(this)
    // audioArray={audioUrl}
    // isPlayAll={this.state.isPlayAll}
    // videoLink={this.state.audioLink} />
  }

  onSeek = seek => {
    //Handler for change in seekbar
    this.videoPlayer.seek(seek);
  };

  onPaused = playerState => {
    //Handler for Video Pause
    this.setState({
      paused: !this.state.paused,
      playerState,
    });
  };

  onReplay = () => {
    //Handler for Replay
    this.setState({ playerState: PLAYER_STATES.PLAYING });
    this.videoPlayer.seek(0);
  };

  onProgress = data => {
    const { isLoading, playerState } = this.state;
    // Video Player will continue progress even if the video already ended
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      this.setState({ currentTime: data.currentTime });
    }
  };

  onLoad = data => this.setState({ duration: data.duration, isLoading: false, paused: true, playerState: 1 });

  onLoadStart = data => this.setState({ isLoading: true });

  onEnd = () => {
    this.setState({ playerState: PLAYER_STATES.ENDED })
    if (this.state.index < this.props.audioArray.length) {
      this.setState({ index: this.state.index + 1 })
    }
  }

  onError = () => alert('Oh! ', error);

  exitFullScreen = () => {
    alert('Exit full screen');
  };

  enterFullScreen = () => { };

  onFullScreen = () => {
    this.videoPlayer.presentFullscreenPlayer();
  };
  renderToolbar = () => (
    <View>
      <Text> toolbar </Text>
    </View>
  );
  onSeeking = currentTime => this.setState({ currentTime });

  render() {
    return (
      this.props && this.props.videoLink ?
        <View style={styles.container}>
          <Video
            onEnd={this.onEnd}
            onLoad={this.onLoad}
            onLoadStart={this.onLoadStart}
            playInBackground
            playWhenInactive
            ignoreSilentSwitch='ignore'
            onProgress={this.onProgress}
            paused={this.state.paused}
            audioOnly={true}
            ref={videoPlayer => (this.videoPlayer = videoPlayer)}
            resizeMode={this.state.screenType}
            source={{
              uri:
                this.props.isPlayAll ?
                  this.props.audioArray[this.state.index]?.audioLink?
                  this.props.audioArray[this.state.index]?.audioLink:
                  this.props.audioArray[this.state.index] :
                  this.props.videoLink
            }}
            style={styles.mediaPlayer}
            volume={10}
          />
          <MediaControls
            duration={this.state.duration}
            isLoading={this.state.isLoading}

            mainColor="#333"
            onPaused={this.onPaused}
            onReplay={this.onReplay}
            onSeek={this.onSeek}
            onSeeking={this.onSeeking}
            playerState={this.state.playerState}
            progress={this.state.currentTime}
          />
        </View> :
        <View />
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
  },
});
export default App;