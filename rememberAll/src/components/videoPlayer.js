import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';
import VideoPlayer from 'react-native-video-player';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";


export default class MyVideoPlayer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            video: { width: 180, height: 270, duration: undefined },
            // thumbnailUrl: undefined,
            videoUrl: undefined,
        };
    }

    componentDidMount() {
    }

    render() {
        console.warn('file://' + DocumentDirectoryPath + '/videos/' + this.props.videoName + '.mp4');
        return (
            <View>
                {/*<Text style={{ fontSize: 22, marginTop: 22 }}>React Native Video Player</Text>*/}
                <VideoPlayer
                    endWithThumbnail
                    // thumbnail={{ uri: this.state.thumbnailUrl }}
                    video={{ uri: 'file://' + DocumentDirectoryPath + '/videos/' + this.props.videoName + '.mp4' }}
                    videoWidth={this.state.video.width}
                    videoHeight={this.state.video.height}
                    duration={this.state.video.duration}
                    ref={r => this.player = r}
                />
            </View>
        );
    }
}