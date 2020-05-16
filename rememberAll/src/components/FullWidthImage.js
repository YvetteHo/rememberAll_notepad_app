import React from 'react';
import {
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import Placeholder from 'rn-placeholder';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";

const dimensions = Dimensions.get('window');
let uri = '';
export default class FullWidthImage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            pictureWidth: 0,
            pictureHeight: 0,
            isReady: false,
        };
    }
    componentDidMount() {

        uri = 'file://' + DocumentDirectoryPath + '/images/' + this.props.uriId + '.jpg';
        console.log(uri);
        Image.getSize(uri, (width, height) => {
            let imageScale = width / height;
            this.setState({
                pictureHeight: dimensions.width / imageScale,
                pictureWidth: dimensions.width,
                isReady: true
            })
        }, (failure) => {
            // console.log(this.props.uri)
        });
    }

    render() {
        console.log(this.state.pictureHeight, this.state.pictureWidth);

        return <View>
                <Placeholder.ImageContent
                    size={300}
                    animate="fade"
                    lineNumber={0}
                    onReady={this.state.isReady}
                >
                    <Image
                        key={this.props.index}
                        source={{uri: DocumentDirectoryPath + '/images/' + this.props.uriId + '.jpg'}}
                        style={{width: this.state.pictureWidth, height: this.state.pictureHeight}}
                    />
                </Placeholder.ImageContent>
            </View>

    }
}
