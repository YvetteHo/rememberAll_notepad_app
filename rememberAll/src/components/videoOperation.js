/* eslint-disable no-console */
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Slider,
    TouchableWithoutFeedback,
    Dimensions,
    SafeAreaView,
    CameraRoll
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import {insertVideo, updateNote} from "../database/schemas";

const { width, height } = Dimensions.get('window');

const landmarkSize = 2;

export default class VideoOperation extends React.Component {
    state = {
        zoom: 0,
        type: 'back',
        recordOptions: {
            quality: RNCamera.Constants.VideoQuality['1080p'],
        },
        isRecording: false,
    };

    toggleFacing() {
        this.setState({
            type: this.state.type === 'back' ? 'front' : 'back',
        });
    }

    onSliderEditing = value => {

        this.setState({
            zoom: value
        })
    };


    takeVideo = async function() {
        if (this.camera) {
            try {
                this.setState({
                    isRecording: true
                });
                this.camera.recordAsync().then(data => {
                    console.warn(data, data['uri'], data.uri);
                    CameraRoll.saveToCameraRoll(data.uri, 'video');
                });
            } catch (e) {
                console.error(e);
            }
        }
    };

    stopRecording = () => {
        this.setState({
            isRecording: false
        });
        this.camera.stopRecording();
    };


    toggle = value => () => this.setState(prevState => ({ [value]: !prevState[value] }));

    renderCamera() {
        const { canDetectFaces, canDetectText, canDetectBarcode } = this.state;

        return (

            <RNCamera
                ref={ref => {
                    this.camera = ref;
                }}
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    width: width
                }}
                type={this.state.type}
                zoom={this.state.zoom}
                flashMode={RNCamera.Constants.FlashMode.on}
                autoFocus='on'
                autoFocusPointOfInterest={{ x: 0.5, y: 0.5}}

                whiteBalance='auto'
                ratio='16:9'
                focusDepth={0}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
            >
                <View style={{flex: 1}}/>
                    <View style={{marginHorizontal: 15, flexDirection: 'row'}}>
                        {/*<Text style={{color: 'black', alignSelf: 'center'}}>{currentTimeString}</Text>*/}
                    <Slider
                        onTouchStart={this.onSliderEditStart}
                        onTouchEnd={this.onSliderEditEnd}
                        onValueChange={this.onSliderEditing}
                        value={this.state.zoom}
                        maximumValue={0.03}
                        maximumTrackTintColor='white'
                        minimumTrackTintColor='white'
                        thumbTintColor='white'
                        style={{flex: 1, alignSelf: 'center'}}/>
                    </View>
                    <View style={styles.footerContainer}>
                        <View style={styles.footerLeft}/>

                        <View style={styles.footerCenter}>
                            <TouchableOpacity onPress={this.state.isRecording ? this.stopRecording.bind(this) : this.takeVideo.bind(this)}>
                                {this.state.isRecording ?
                                    <Icon name="ios-radio-button-off" size={64} color="#FF5722"/> :
                                    <Icon name="ios-radio-button-on" size={64} color="#FF5722"/>
                                }
                            </TouchableOpacity>
                        </View>
                        <View style={styles.footerRight}>
                            {this.state.isRecording ? <View/> :<TouchableOpacity onPress={this.toggleFacing.bind(this)}>
                                <Icon name="ios-reverse-camera" size={64} color="#FF5722"/>
                            </TouchableOpacity> }
                        </View>
                    </View>

            </RNCamera>
        );
    }

    render() {
        return <SafeAreaView style={styles.container}>{this.renderCamera()}</SafeAreaView>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        alignItems: 'center',
        backgroundColor: 'red'
    },
    flipButton: {
        flex: 0.3,
        height: 40,
        marginHorizontal: 2,
        marginBottom: 10,
        marginTop: 10,
        borderRadius: 8,
        borderColor: 'white',
        borderWidth: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    autoFocusBox: {
        position: 'absolute',
        height: 64,
        width: 64,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
        opacity: 0.4,
    },
    flipText: {
        color: 'white',
        fontSize: 15,
    },
    zoomText: {
        position: 'absolute',
        bottom: 70,
        zIndex: 2,
        left: 2,
    },
    picButton: {
        backgroundColor: 'darkseagreen',
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    face: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#FFD700',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    landmark: {
        width: landmarkSize,
        height: landmarkSize,
        position: 'absolute',
        backgroundColor: 'red',
    },
    faceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
        backgroundColor: 'transparent',
    },
    text: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#F00',
        justifyContent: 'center',
    },
    textBlock: {
        color: '#F00',
        position: 'absolute',
        textAlign: 'center',
        backgroundColor: 'transparent',
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
