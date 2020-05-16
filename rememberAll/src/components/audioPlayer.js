import React from 'react'
import {
    View,
    Image,
    Text,
    Slider,
    TouchableOpacity,
    Platform, Alert, StyleSheet,
    ProgressViewIOS
} from 'react-native';
import {AudioUtils} from 'react-native-audio';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";

import Sound from 'react-native-sound';
import {WhiteSpace, Card, Modal, SwipeAction, TextareaItem} from 'antd-mobile-rn';
import Icon from "react-native-vector-icons/dist/MaterialIcons";

export default class AudioPlayer extends React.Component {
    constructor(props) {
        super(props);
        this.sliderEditing = false;
        console.log(DocumentDirectoryPath + '/audios/' + this.props.audioName + '.aac');
        this.sound = new Sound(DocumentDirectoryPath + '/audios/' + this.props.audioName + '.aac', '', (error) => {
            if (error) {
                console.log('failed to load the sound', error);
            }
            console.log(this.sound.getDuration())
        });
        this.state = {
            playState: 'paused',
            playSeconds: 0,
            duration: 0
        };
    }

    componentDidMount() {
        // console.log(this.sound);
        setTimeout(() => {
                this.setState({
                    duration: this.sound.getDuration()
                })

        }, 100);

        this.timeout = setInterval(() => {
            if (this.sound && this.sound.isLoaded() && this.state.playState === 'playing' && !this.sliderEditing) {
                this.sound.getCurrentTime((seconds, isPlaying) => {
                    this.setState({playSeconds: seconds});
                })
            }
        }, 100);
    }

    componentWillUnmount() {
        if (this.sound) {
            this.sound.release();
            this.sound = null;
        }
        if (this.timeout) {
            clearInterval(this.timeout);
        }
    }

    play = async () => {
        if (this.sound) {
            this.setState({playState: 'playing', duration: this.sound.getDuration()});
            setTimeout(() => {
                this.sound.play((success) => {
                    if (success) {

                        this.setState({playState: 'paused', playSeconds: 0});

                        this.sound.setCurrentTime(0);
                        console.log('successfully finished playing');
                    } else {
                        console.log('playback failed due to audio decoding errors');
                    }
                });
            }, 100);
            this.setState({playState: 'playing'});
        } else {
        }

    };

    pause = () => {
        if (this.sound) {
            this.sound.pause();
        }

        this.setState({playState: 'paused'});
    };

    getAudioTimeString = (seconds) => {
        const h = parseInt(seconds / (60 * 60));
        const m = parseInt(seconds % (60 * 60) / 60);
        const s = parseInt(seconds % 60);

        return ((h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s));
    };

    onSliderEditStart = () => {
        this.sliderEditing = true;
    };
    onSliderEditEnd = () => {
        this.sliderEditing = false;
    };
    onSliderEditing = value => {
        if (this.sound) {
            this.sound.setCurrentTime(value);
            this.setState({playSeconds: value});
        }
    };

    render() {
        const currentTimeString = this.getAudioTimeString(this.state.playSeconds);
        const durationString = this.getAudioTimeString(this.state.duration);
        return (
            <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
                <Card full key={this.props.id}>
                    <Card.Body>
                        <View style={{height: 30}}>
                            <View style={styles.center}>
                                {this.state.playState === "playing" ?
                                    <TouchableOpacity onPress={this.pause}>
                                        <Icon name="pause" size={32} color="#FF5722"/>
                                    </TouchableOpacity> : <View/>}
                                {this.state.playState === "paused" ?
                                    <TouchableOpacity onPress={this.play}>
                                        <Icon name="play-arrow" size={32} color="#FF5722"/>
                                    </TouchableOpacity> : <View/>}
                            </View>
                        </View>
                        <View style={{marginHorizontal: 15, flexDirection: 'row'}}>
                            <Text style={{color: 'black', alignSelf: 'center'}}>{currentTimeString}</Text>
                            <Slider
                                onTouchStart={this.onSliderEditStart}
                                onTouchEnd={this.onSliderEditEnd}
                                onValueChange={this.onSliderEditing}
                                value={this.state.playSeconds}
                                maximumValue={this.state.duration}
                                maximumTrackTintColor='gray'
                                minimumTrackTintColor='gray'
                                thumbTintColor='white'
                                style={{flex: 1, alignSelf: 'center'}}/>
                            <Text style={{color: 'black', alignSelf: 'center'}}>{durationString}</Text>
                        </View>

                    </Card.Body>
                </Card>
            </View>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullScreen: {
        flex: 1,
    },
    absolute: {
        position: "absolute",
        top: 0, left: 0, bottom: 0, right: 0,
    },
    transparentMaskView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        zIndex: 4,
    },
    maskView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        zIndex: 4,
    },
    floatView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        zIndex: 4,
    },
    footerContainer: {
        position: 'absolute',
        left: 0,
        // right: 0,
        bottom: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    footerCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    footerLeft: {
        marginLeft: 5,
        flex: 1,
    },
    footerRight: {
        marginRight: 5,
        flex: 1,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,

    },
});