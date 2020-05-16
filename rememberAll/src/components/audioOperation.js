import React from 'react';
import {
    SafeAreaView,
    Animated,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    AppRegistry,
    TouchableHighlight,
    Platform,
    PermissionsAndroid,

} from 'react-native';
import {WhiteSpace, Card, Modal, SwipeAction, TextareaItem, Toast} from 'antd-mobile-rn';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import Sound from 'react-native-sound';
import Icon from "react-native-vector-icons/dist/MaterialIcons";
import {insertAudio, updateNote} from "../database/schemas";
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";
import Permissions from 'react-native-permissions'
const uuid = require('uuid/v1');
const { width, height } = Dimensions.get('window');
let uuidForAudio = '';
const RNFS = require('react-native-fs');

async function requestAudioPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Request the usage of microphone',
                message:
                    'Open your microphone' +
                    'to record voices',
                buttonNeutral: 'Ask later',
                buttonNegative: 'Cancel',
                buttonPositive: 'Okay',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('您可以使用麦克风了');
        } else {
            console.log('拒绝使用');
        }
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.warn(err);
    }
}

export default class AudioOperation extends React.Component {
    constructor(props) {
        super(props);
        uuidForAudio = uuid();
        this.state = {
            recording: false,
            currentTime: 0.0,
            paused: false,
            stoppedRecording: false,
            finished: false,
            audioPath: AudioUtils.DocumentDirectoryPath + '/audios/' + uuidForAudio + '.aac',
            hasPermission: undefined,
            uuidForAudio: uuid()
        };
    }
    componentDidMount() {
        exists(DocumentDirectoryPath + '/audios').then((exists) => {
            if (!exists) {
                mkdir(DocumentDirectoryPath + '/audios').then();
            }
        });
        Permissions.check('microphone').then(response => {
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            this.setState({ hasPermission: response });
            if (response !== 'authorized') {
                Permissions.request('microphone').then(response => {
                    // Returns once the user has chosen to 'allow' or to 'not allow' access
                    // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                    this.setState({ hasPermissions: response });
                    this.startRecording();
                })
            } else {
                this.startRecording();
            }
        });

        // AudioRecorder.checkAuthorizationStatus().then((isAuthorised) => {
        //     // console.warn('是否有权限', isAuthorised);
        //     this.setState({
        //         hasPermission: isAuthorised });
        //     if (isAuthorised === 'undetermined') {
        //
        //     }
        //     if (!isAuthorised) {
        //
        //         if(Platform.OS === 'android') {
        //             requestAudioPermission().then(
        //                 (isGranted) => {
        //                     if (isGranted) {
        //                         console.warn(isGranted, isAuthorised);
        //                         this.setState({ hasPermission: !isAuthorised });
        //                         this.startRecording();
        //                     } else {
        //                         this.props.endRecording();
        //                     }
        //                 }
        //             );
        //         }
        //     } else {
        //         this.startRecording();
        //     }
        // });
    }

    startRecording = () => {

        this.prepareRecordingPath(this.state.audioPath);

        AudioRecorder.onProgress = (data) => {
            this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
            // Android callback comes in the form of a promise instead.
            if (Platform.OS === 'ios') {
                this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
            }
            insertAudio({uuid: '*#audio#*' + uuidForAudio, uri: uuidForAudio + '.aac',noteId: this.props.note.id || ''});
            this.endRecording('*#audio#*' + uuidForAudio);
        };
    };
    prepareRecordingPath = (audioPath) => {
        AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000
        });
    };

    micClicked = () => {
        if (!this.state.recording) {
            this._record();
        }
        if (this.state.recording) {
            this._stop();
        }

    };

    pauseClicked = () => {
        if (this.state.recording && this.state.paused) {
            this._resume();
        }
        if (this.state.recording && !this.state.paused) {
            this._pause();
        }
    };



    async _pause() {
        if (!this.state.recording) {
            console.warn('Can\'t pause, not recording!');
            return;
        }

        try {
            const filePath = await AudioRecorder.pauseRecording();
            this.setState({paused: true});
        } catch (error) {
            console.error(error);
        }
    }

    async _resume() {
        if (!this.state.paused) {
            console.warn('Can\'t resume, not paused!');
            return;
        }
        try {
            await AudioRecorder.resumeRecording();
            this.setState({paused: false});
        } catch (error) {
            console.error(error);
        }
    }

    async _stop() {
        if (!this.state.recording) {
            console.warn('Can\'t stop, not recording!');
            return;
        }

        this.setState({stoppedRecording: true, recording: false, paused: false});

        try {
            const filePath = await AudioRecorder.stopRecording();

            if (Platform.OS === 'android') {
                this._finishRecording(true, filePath);
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }

    async _record() {
        if (this.state.recording) {
            console.warn('Already recording!');
            return;
        }

        if (this.state.hasPermission !== 'authorized') {
            Permissions.check('microphone').then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                console.log(response);
                if (response !== 'authorized') {
                    Modal.alert('Please allow the usage of microphone', null, [
                        {
                            text: 'Okay',
                            onPress: () => {
                                this.props.endRecording();
                            },
                            style: 'cancel',
                        }]
                    );
                }
                if (response === 'authorized') {
                    if(this.state.stoppedRecording){
                        this.prepareRecordingPath(this.state.audioPath);
                    }
                    AudioRecorder.startRecording();
                    this.setState({recording: true, paused: false});
                }
            })
        } else {
            if(this.state.stoppedRecording){
                this.prepareRecordingPath(this.state.audioPath);
            }

            this.setState({recording: true, paused: false});
            try {
                const filePath = await AudioRecorder.startRecording();
            } catch (error) {
                console.error(error);
            }
        }




        //
        // if (!this.state.hasPermission || this.state.hasPermission==="denied") {
        //     // console.warn('Can\'t record, no permission granted!');
        //     Modal.alert('请在应用设置中允许录音权限', null, [
        //         {
        //             text: '确定',
        //             onPress: () => {
        //                 this.props.endRecording();
        //             },
        //             style: 'cancel',
        //         }]
        //     );
        //     return;
        // }
        //
        // if(this.state.stoppedRecording){
        //     this.prepareRecordingPath(this.state.audioPath);
        // }
        //
        // this.setState({recording: true, paused: false});
        //
        // try {
        //     const filePath = await AudioRecorder.startRecording();
        // } catch (error) {
        //     console.error(error);
        // }
    }

    _finishRecording(didSucceed, filePath, fileSize) {

        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
    }


    endRecording = (id) => {
        this.props.endRecording(id);
        console.log('end')
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                    <Text style={styles.progressText}>{this.state.currentTime}s</Text>
                    <View style={{flex: 1}}/>
                    <View style={styles.footerContainer}>
                        <View style={styles.footerLeft}/>
                        <View style={styles.footerCenter}>
                            <TouchableOpacity onPress={this.micClicked}>
                                {this.state.recording ?
                                    <Icon name="stop" size={64} color="#FF5722"/> :
                                    <Icon name="fiber-manual-record" size={64} color="#FF5722"/>
                                }
                            </TouchableOpacity>
                        </View>
                        {this.state.recording ? <View style={styles.footerRight}>
                            <TouchableOpacity onPress={this.pauseClicked}>
                                {this.state.recording && this.state.paused?
                                    <Icon name="play-arrow" size={64} color="#FF5722"/> :
                                    <Icon name="pause" size={64} color="#FF5722"/>
                                }
                            </TouchableOpacity>
                        </View> : <View style={styles.footerRight}/>}
                    </View>
            </SafeAreaView>


        );
    }
}




const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        alignItems: 'center',
    },
    controls: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    progressText: {
        paddingTop: 50,
        fontSize: 50,
        color: "#fff"
    },
    button: {
        padding: 20
    },
    disabledButtonText: {
        color: '#eee'
    },
    buttonText: {
        fontSize: 20,
        color: "#fff"
    },
    activeButtonText: {
        fontSize: 20,
        color: "#B81F00"
    },
    footerContainer: {
        // flex: 1,
        // position: 'absolute',
        // bottom: 0,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    footerCenter: {
        alignItems: 'center',
        flex: 1,
    },
    footerLeft: {
        // marginLeft: 5,
        flex: 1,
    },
    footerRight: {
        // marginRight: 5,
        alignItems: 'flex-end',
        flex: 1,
    }

});
