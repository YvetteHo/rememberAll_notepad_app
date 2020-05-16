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
    Image,
    cameraRoll, CameraRoll,
    AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import Header from "../../components/header";
import AudioOperation from "../../components/audioOperation";
import {AudioUtils} from 'react-native-audio';
import AudioPlayer from "../../components/audioPlayer";
import ImagePicker from 'react-native-image-picker';
import MyVideoPlayer from "../../components/videoPlayer";
import {WhiteSpace, Card, Modal, SwipeAction, TextareaItem} from 'antd-mobile-rn';
import {
    updateNote,
    deleteAudio,
    cancelTrans,
    commitTrans, deletePicture, insertPicture, deleteVideo, showNotesSkeleton, insertVideo,
} from "../../database/schemas";
import Sound from "react-native-sound";
import FullWidthImage from "../../components/FullWidthImage";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Spacer from 'react-native-spacer';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";

const Spinner = require('react-native-spinkit');

const uuid = require('uuid/v1');
const demessions = Dimensions.get('window');

const options = {
    title: 'Insert a photo',
    cancelButtonTitle: 'Cancel',
    takePhotoButtonTitle: 'Take a photo',
    chooseFromLibraryButtonTitle: 'Choose a photo',
    storageOptions: {
        skipBackup: true,
        path: 'images',
        cameraRoll: true,
        noData: true
    },
};

export default class NewNote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: {
                start: 0,
                end: 0
            },
            recording: false,
            change: false,
            modalVisible: true,
            note: props.navigation.getParam('note'),
            oldNoteContent: Array.from(props.navigation.getParam('note').noteContent),
            noteContent: Array.from(props.navigation.getParam('note').noteContent),
            newValue: '',
            height: 40,
            value: '',
            isLoading: false,
            newPicture: '',
            isVideoRecording: false,
            userName: '',
            userPK: 0,
        };
        this.endRecording = this.endRecording.bind(this);
    }

    onChangeText = (newValue) => {
        this.setState({newValue: newValue, change: true})
    };

    componentDidMount() {
        AsyncStorage.getItem('pk').then((response) => {
            this.setState({
                userPK: response
            })
        });
        exists("DocumentDirectoryPath" + '/images').then((exists) => {
            if (!exists) {
                mkdir(DocumentDirectoryPath + '/images').then();
            }
        });
    }

    handleSelectionChange = ({nativeEvent: {selection}}) => {
        console.log(selection)
        this.setState({selection})
    }
    micClicked = () => {

        if (this.state.recording) {
            this.stop();
        } else {
        }
        this.setState({
            recording: !this.state.recording,
            change: true
        })

    };

    endVideoRecording = (uri) => {
        console.warn('回来了', uri);
        const oldNoteContent = this.state.noteContent;
        oldNoteContent.push(uri);
        this.setState({
            noteContent: oldNoteContent,
            change: true
        })
    };
    postData = (url, data) => {
        // Default options are marked with *
        return fetch(url, {
            body: data, // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'content-type': 'multipart/form-data'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        })
            .then(response => {
                console.log(response)
            }) // parses response to JSON
    };
    cameraClicked = () => {
        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                const fileNameWithSuffix = response.uri.substr(response.uri.lastIndexOf('/') + 1);
                let fileName = fileNameWithSuffix.substr(0, fileNameWithSuffix.lastIndexOf('.'));

                if (Platform.OS === 'android') {
                    fileName = fileNameWithSuffix;
                    console.log(DocumentDirectoryPath + '/images/' + fileName + '.jpg');
                    moveFile(response.uri, DocumentDirectoryPath + '/images/' + fileName + '.jpg').then(
                        () => {
                            console.log('移动成功')
                        }
                    ).catch((error) => {
                        console.warn(error)
                    });
                }

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // let formData = new FormData();
                // let file = {
                //     uri: response.uri,
                //     type: 'image/jpeg',
                //     name: 'test.jpg',
                // };
                //
                // formData.append('file', file);
                // formData.append('remark', 'test');
                //
                // this.postData('http://127.0.0.1:8000/files/', formData).then(response => {
                //     console.log(response)
                // }).catch((error) => {
                //     console.log(error)
                // })
                this.updateText();
                const oldNoteContent = this.state.noteContent;
                oldNoteContent.push('*#image#*' + fileName);
                this.setState({
                    noteContent: oldNoteContent,
                    change: true
                });
                insertPicture({uuid: '*#image#*' + fileName, uri: fileNameWithSuffix, noteId: this.state.note.id})
            }

        });
    };
    videoCamClicked = () => {
        this.props.navigation.navigate('VideoOperation', {
            noteId: this.state.note.id,
            endVideoRecording: this.endVideoRecording
        });
    };

    updateText = (index) => {
        console.log(index);
        const oldNoteContent = this.state.noteContent;
        if (index >= 0) {
            oldNoteContent.splice(index, 1);
        } else {
            if (this.state.newValue !== '') {
                oldNoteContent.push(this.state.newValue);
                this.setState({
                    newValue: ''
                })
            }
            this.setState({
                noteContent: oldNoteContent
            })
        }
    };


    endRecording(id) {
        console.log('结束了哦');
        if (!id) {
            this.setState({
                recording: false,
            });
            return;
        }

        const oldNoteContent = this.state.noteContent;
        this.updateText();
        oldNoteContent.push(id);


        this.setState({
            recording: false,
            noteContent: oldNoteContent,
            newValue: ''
        })
    };

    goBack = () => {
        cancelTrans().then(() => {
            console.log('cancelTrans');
            this.props.navigation.goBack()
        });
    };

    save = (name) => {
        const isNew = this.props.navigation.getParam('isNew', null);

        const note = this.props.navigation.getParam('note', null);

        console.log(`name: ${name}`);
        this.setState({
            isLoading: true
        });
        let skeleton = [];

        const newNote = {
            id: note.id,
            name: name || note.name,
            noteType: note.noteType,
            time: note.time,
            noteContent: JSON.stringify(this.state.noteContent),
            noteSkeleton: JSON.stringify(skeleton),
            user: this.state.userPK
        };
        console.log(newNote);
        console.warn(newNote);

        updateNote({
            id: note.id,
            name: name || note.name,
            noteType: note.noteType,
            time: note.time,
            noteContent: this.state.noteContent,
            noteSkeleton: skeleton
        }).then((updatedNote) => {
            console.log("update successfully")
            console.log(JSON.stringify(Array.from(updatedNote['noteSkeleton'])));

            newNote.noteSkeleton = JSON.stringify(Array.from(updatedNote['noteSkeleton']));

            commitTrans().then(() => {
                if (isNew) {
                    console.log('newNote', newNote)
                    AsyncStorage.getItem('operations').then((response) => {
                        let operations = JSON.parse(response);

                        operations.push({
                            'newNote': newNote
                        });
                        AsyncStorage.setItem('operations', JSON.stringify(operations))
                    });
                } else {
                    AsyncStorage.getItem('operations').then((response) => {
                        let operations = JSON.parse(response);
                        console.log('changeNote', newNote);

                        operations.push({
                            'updateNoteContent': [
                                {
                                    'oldNote': {
                                        id: note.id,
                                        name: note.name,
                                        noteType: note.noteType,
                                        time: note.time,
                                        noteContent: JSON.stringify(this.state.oldNoteContent),
                                        noteSkeleton: JSON.stringify(skeleton),
                                        user: this.state.userPK
                                    }
                                },
                                {'updatedNote': newNote}]
                        });
                        console.log("Before Set Item")
                        AsyncStorage.setItem('operations', JSON.stringify(operations))
                    });
                }
                this.setState({
                    isLoading: false
                });
                this.props.navigation.goBack()
            })
        }).catch(() => {
            cancelTrans().then(() => {
                this.setState({
                    isLoading: false
                });
            });
        });
    };

    cancel = () => {
        this.setState({
            isLoading: true
        });
        cancelTrans().then(() => {
            this.setState({
                isLoading: false
            });
            this.props.navigation.goBack()
        });

    };

    clickSave = () => {

        const isNew = this.props.navigation.getParam('isNew', null);

        console.log(this.state.noteContent);
        if (this.state.newValue.replace(/(\s*$)/g, "") !== "") {
            this.state.noteContent.push(this.state.newValue);
        }

        if (isNew) {
            Modal.prompt(
                'Save the note',
                null,
                [
                    {
                        text: "Don't save",
                        onPress: this.cancel,
                        style: 'cancel',
                    },
                    {
                        text: 'Save',
                        onPress: name => this.save(name)
                    }

                ],
                'default',
                '',
                ['Please enter the title']
            );
        } else {

            Modal.alert('Save the note', null, [
                {
                    text: 'Don\'t save',
                    onPress: this.cancel,
                    style: 'cancel',
                },
                {
                    text: 'Save',
                    onPress: this.save
                }]
            );
        }

    };

    renderAudio = (element, index) => {
        console.log(element, index);
        const swipeOutButtons = [
            {
                text: 'Delete',
                onPress: () => {
                    deleteAudio(element).then(() => {
                        const oldNoteContent = this.state.noteContent;
                        const index = oldNoteContent.indexOf(element);
                        if (index > -1) {
                            oldNoteContent.splice(index, 1);
                        }
                        this.setState({
                            noteContent: oldNoteContent,
                            change: true
                        })
                    }).catch(() => {

                    })
                },
                style: {color: 'white'}
            }
        ];

        return (
            <SwipeAction right={swipeOutButtons} key={index}>
                <AudioPlayer id={index} audioName={element.substr(9)}/>
            </SwipeAction>
        )
    };

    renderTextInput = (element, index) => {
        const {value, height} = this.state;
        if (element === '') {
            console.log('zero')
            this.updateText(index);
        }

        return (
            <TextInput
                // ref={ref => this.textInput = ref}
                key={index}
                placeholder="Please type here"
                onChangeText={(text) => {
                    this.state.noteContent[index] = text;
                    this.setState({
                        change: true
                    })
                }}
                style={styles.textInputStyle}
                editable
                multiline
                defaultValue={element}
                onContentSizeChange={(e) => {
                    // this.measureTextInput()
                    this.updateSize(e.nativeEvent.contentSize.height)
                }}
                keyboardType="default"
            />
        )
    };

    showContent = () => {
        return (
            <View>
                {this.state.noteContent.map((element, index) => {
                        if (element.slice(0, 9) === '*#audio#*') {
                            return this.renderAudio(element, index)

                        } else if (element.slice(0, 9) === '*#image#*') {
                            const swipeOutButtons = [
                                {
                                    text: 'Delete',
                                    onPress: () => {
                                        deletePicture(element).then(() => {
                                            const oldNoteContent = this.state.noteContent;
                                            const index = oldNoteContent.indexOf(element);
                                            if (index > -1) {
                                                oldNoteContent.splice(index, 1);
                                            }
                                            this.setState({
                                                noteContent: oldNoteContent,
                                                change: true
                                            })
                                        }).catch(() => {

                                        })
                                    },
                                    style: {color: 'white'}
                                }
                            ];
                            console.log(element)

                            return <SwipeAction right={swipeOutButtons} key={index}>
                                <FullWidthImage uriId={element.substr(9)} key={index}/>
                            </SwipeAction>
                        } else if (element.slice(0, 9) === '*#video#*') {
                            const swipeOutButtons = [
                                {
                                    text: 'Delete',
                                    onPress: () => {
                                        deleteVideo(element).then(() => {
                                            const oldNoteContent = this.state.noteContent;
                                            const index = oldNoteContent.indexOf(element);
                                            if (index > -1) {
                                                oldNoteContent.splice(index, 1);
                                            }
                                            this.setState({
                                                noteContent: oldNoteContent,
                                                change: true
                                            });

                                            console.warn(element)
                                        }).catch((res) => {
                                            console.warn(res)
                                        })
                                    },
                                    style: {color: 'white'}
                                }
                            ];
                            return <SwipeAction right={swipeOutButtons} key={index}>
                                <MyVideoPlayer key={index} videoName={element.slice(9)}/>
                            </SwipeAction>;
                        } else {
                            return this.renderTextInput(element, index)
                        }
                    }
                )}
            </View>
        )
    };

    measureTextInput() {
        this.textInput.measure((x, y, width, height, pageX, pageY) => {
            console.log(x, y, width, height, pageX, pageY)
            console.log(y + height)

            this.scrollView.scrollToPosition(x, y + height - 300, true)
            // this.scrollView.scrollTo()
        })
    }


    updateSize = (height) => {
        this.setState({
            height
        });
    };

    render() {
        const {selection} = this.state;
        const {navigation} = this.props;
        const note = navigation.getParam('note', null);
        const {newValue, height} = this.state;
        let newStyle = {
            height,
            fontSize: 50,
        };
        return (

            <View style={styles.container}>
                {this.state.isLoading ? <View style={styles.transparentMaskView}/> : <View/>}
                {this.state.isLoading ?
                    <View style={styles.floatView}>
                        <Spinner style={styles.spinner} isVisible={true} size={100} type='Circle' color='#FF5722'/>
                    </View> : <View/>}

                {this.state.recording ? <View style={styles.maskView}>
                </View> : <View/>}
                {this.state.recording ? <View style={styles.floatView}>
                    <AudioOperation endRecording={(e) => this.endRecording(e)} note={note ? note : null}/>
                </View> : <View/>}
                {/*{this.state.isVideoRecording ? <View style={styles.floatView}>*/}
                {/*    <VideoOperation style={{width: '100%', height: '100%'}}/>*/}
                {/*</View> : <View/>}*/}
                <SafeAreaView style={styles.container}>
                    <Header leftElement={
                        this.state.change ? <TouchableOpacity
                                onPress={this.clickSave}
                                style={{width: 45, marginLeft: 10}}>
                                <Icon name="check" size={45} color="#FF5722"/>
                            </TouchableOpacity> :
                            <TouchableOpacity
                                onPress={this.goBack}
                                style={{width: 45, marginLeft: 10}}>
                                <Icon name="keyboard-arrow-left" size={45} color="#FF5722"/>
                            </TouchableOpacity>
                    }
                            titleElement={note ? note.name : 'New note'}
                    />

                    <View style={styles.fullScreen}>
                        <KeyboardAwareScrollView
                            // ref={ref => this.scrollView = ref}
                            // style={{flex:1}}
                            // onContentSizeChange={(contentWidth, contentHeight) => {
                            //     console.log('changeSize');
                            //     this.scrollView.scrollToEnd({animated: true})
                            // }}
                            enableOnAndroid={true}
                        >
                            {this.showContent()}
                            <TextInput
                                ref={ref => this.textInput = ref}
                                onChangeText={this.onChangeText}
                                selection={selection}
                                onSelectionChange={this.handleSelectionChange}
                                editable
                                multiline
                                value={newValue}
                                style={styles.textInputStyle}
                                onContentSizeChange={(e) => {
                                    this.updateSize(e.nativeEvent.contentSize.height)

                                }}
                                keyboardType="default"
                            />

                        </KeyboardAwareScrollView>
                        <View style={styles.footerContainer}>
                            <View style={styles.footerLeft}>
                                <TouchableOpacity onPress={this.cameraClicked}>
                                    <Icon name="camera" size={64} color="#FF5722"/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.footerCenter}>
                                <TouchableOpacity onPress={this.micClicked}>
                                    <Icon name="mic" size={64} color="#FF5722"/>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.footerRight}>
                                <TouchableOpacity onPress={this.videoCamClicked}>
                                    <Icon name="videocam" size={64} color="#FF5722"/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );


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
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    // footerContainer: {
    //     position: 'absolute',
    //     left: 0,
    //     // right: 0,
    //     bottom: 0,
    //     justifyContent: 'center',
    //     flexDirection: 'row',
    // },
    // footerCenter: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     flex: 1,
    // },
    // footerLeft: {
    //     marginLeft: 5,
    //     flex: 1,
    // },
    // footerRight: {
    //     marginRight: 5,
    //     flex: 1,
    // },
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
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,

    },
    textInputStyle: {
        fontSize: 20,
        marginLeft: 5,
        marginRight: 5,
    },
    canvasContainer: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#F5FCFF',
        position: 'relative'
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});