import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, View, Dimensions, Animated} from 'react-native';
import Video from 'react-native-video';
import MediaControls, {PLAYER_STATES} from 'react-native-media-controls';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DynamicText from '../common/dynamicviews';
import {FONT_SEMIBOLD} from '../assets/fonts';
import BouncingButton from './BouncingButton';
import {PRIMARY_COLOR, SECONDARY_COLOR} from '../assets/color';
import ModalListView from './ModalListView';
import {PREMIUM_SUBSCRIPTION} from '../common/endpoints';


// const audioList = [
//   {audioLink: 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav'},
//   {audioLink: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav'},
//   {audioLink: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav'},
//   {audioLink: 'https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav'},
// ];
const {width, height} = Dimensions.get('window');
const MusicPlayer = ({audioList,coverImage, closeMusicModal}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerState, setPlayerState] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const videoRef = useRef(null);

  const onSeek = seek => {
    console.log('item',seek)
    //Handler for change in seekbar
    videoRef.current.seek(seek);
    setPlayerState(PLAYER_STATES.PLAYING);
    setPaused(false)
  };

  const onPaused = playerState => {
    setPaused(!paused);
    setPlayerState(playerState);
  };

  const onReplay = () => {
    setPlayerState(PLAYER_STATES.PLAYING);
    videoRef.current.seek(0);
    setPaused(false)
  };

  useEffect(() => {
    return () => {
      if (paused) {
        spinValue.stopAnimation();
      } else {
        rotateImage();
      }
    };
  }, [paused]);

  const onProgress = data => {
    if (!isLoading && playerState !== PLAYER_STATES.ENDED) {
      setCurrentTime(data.currentTime);
    }
  };

  const onLoad = data => {
    setDuration(data.duration>0?data.duration:0)
    setLoading(false);
    setPaused(true);
    setPlayerState(PLAYER_STATES.PLAYING);
    // setPlayerState(1);
  };

  const onLoadStart = data => setLoading(true);

  const onEnd = () => {
    if (currentIndex == audioList.length-1) {
      setPlayerState(PLAYER_STATES.ENDED);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onError = () => alert('Oh! ', error);

  const onSeeking = currentTime => setCurrentTime(currentTime);

  const rotateImage = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();
  };

  const handlePress = () => {
    setIsVisible(true);
  };

  const onSelect = index => {
    setIsVisible(false);
    setCurrentTime(0);
    setCurrentIndex(index);
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const currentAudio = audioList[currentIndex];
  return (
    <View style={styles.wrapper}>
      <DynamicText style={styles.title}>
        {audioList?.[currentIndex].audioTitle}
      </DynamicText>
      <View style={styles.container}>
        <View style={styles.coverContainer}>
          <Animated.Image
            source={coverImage}
            style={[
              styles.coverImage,
              {
                transform: [
                  {
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        <Video
          source={{uri: currentAudio.audioLink}}
          ref={videoRef}
          onEnd={onEnd}
          onLoad={onLoad}
          onProgress={onProgress}
          playInBackground
          playWhenInactive
          ignoreSilentSwitch="ignore"
          resizeMode="cover"
          repeat={false}
          audioOnly={true}
          volume={10}
          paused={playerState !== PLAYER_STATES.PLAYING}
          onLoadStart={onLoadStart}
        />
        <MediaControls
          duration={duration}
          isLoading={isLoading}
          mainColor="#333"
          // onFullScreen={onFullScreen}
          onPaused={onPaused}
          onReplay={onReplay}
          onSeek={onSeek}
          onSeeking={onSeeking}
          playerState={playerState}
          progress={currentTime}
          // toolbar={renderToolbar()}
        />
      </View>
      <View style={styles.buttonWrapper}>
        <BouncingButton
          setInitialBounce
          setOnClickBounce
          buttonStyle={styles.BouncingButton}
          onPress={handlePress}>
          <Icon name="library-music" size={20} color="#fff" />
        </BouncingButton>
        <BouncingButton
          setOnClickBounce
          buttonStyle={styles.BouncingButton}
          onPress={closeMusicModal}>
          <Icon name="close" size={20} color="#fff" />
        </BouncingButton>
      </View>
      <ModalListView
        coverImage={coverImage}
        data={audioList}
        currentIndex={currentIndex}
        isVisible={isVisible}
        onClose={onClose}
        onSelect={onSelect}
      />
    </View>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    height: 250,
    width: width - 60,
    marginBottom: 10,
  },
  coverContainer: {
    width: 100,
    height: 100,
    marginHorizontal:10,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems:'center',
    justifyContent:'center'
  },
  coverImage: {
    width: 80,
    height: 80,
    borderRadius:40
  },
  wrapper: {
    backgroundColor: '#fff',
    width: width - 40,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    height: 200,
    justifyContent: 'space-around',
    shadowOpacity: 0.2,
    marginVertical: 20,
    shadowOffset: {width: 0, height: 0},
  },
  title: {
    fontFamily: FONT_SEMIBOLD,
    width: '100%',
    padding: 12,
  },
  BouncingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    backgroundColor: PRIMARY_COLOR,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 100,
  },
});
