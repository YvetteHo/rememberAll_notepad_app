import React from 'react';
import {
    SafeAreaView,
    Platform,
    Animated,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableHighlight,
    FlatList,
    SectionList,
    TouchableWithoutFeedback,
    TextInput,
    AsyncStorage
} from 'react-native';
import {Fragment} from 'react';
import Svg, {Path, G, Circle} from 'react-native-svg';
import Icon from 'react-native-vector-icons/dist/MaterialIcons';
import FontIcon from 'react-native-vector-icons/dist/FontAwesome';
import IIcon from 'react-native-vector-icons/dist/Ionicons';
import {getData, postData, upload} from '../../components/http';
import {Drawer, Card, SwipeAction, Modal, Button} from 'antd-mobile-rn';
import Header from "../../components/header";
import {
    insertNote,
    queryNotes,
    deleteNote,
    beginTrans,
    commitTrans,
    cancelTrans,
    sortByText,
    updateNote,
    queryTypes,
    updateType,
    updateTypeNotes,
    buildRealm, sortById, sortByMediaType,rememberAllRealm
} from "../../database/schemas";
import RNFetchBlob from 'react-native-fetch-blob'
import SideBar from "../../components/sideBar";
import Uploader from "../../components/upload";
import Downloader from "../../components/download";
import {DocumentDirectoryPath, downloadFile} from "react-native-fs";
import {NavigationActions, StackActions} from "react-navigation";

const Spinner = require('react-native-spinkit');
const uuid = require('uuid/v1');
const {width, height} = Dimensions.get('window');

const headerShadow = {
    width: width,
    height: 45,
    color: "#000",
    border: 1.5,
    radius: 0,
    opacity: 0.2,
    x: 0,
    y: 1.5,
};
const DEMO_OPTIONS = ['录音', '图片', '视频'];

const excuteUpload = new Promise((resolve, reject) => {

});

export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAddClicked: false,
            drawerOpen: false,
            notes: [],
            openNote: true,
            realmObject: null,
            isLoading: false,
            searchContent: '',
            searchColor: '#757575',
            oldType: '',
            types: [],
            notesOnSearch: [],
            userName: '',
            updateImageSkeleton: true,
        };
        this.openNote = this.openNote.bind(this);

    }

    componentDidMount() {
        const isFirstLogin = this.props.navigation.getParam('isFirstLogin', null);

        AsyncStorage.getItem('userName').then((response) => {
            this.setState({
                userName: response
            })
        });
        AsyncStorage.getItem('operations').then((response) => {
            let operations = JSON.parse(response);
            console.log('所有操作', operations);
        });

        buildRealm().then(() => {
            console.log("build")
            if (isFirstLogin) {
                console.log('第一次登陆');
                this.setState({
                    isLoading: true,
                });
                const downloader = new Downloader();
                this.build()
                downloader.download().then(() => {

                    this.build()
                }).catch((error) => {
                    console.log(error)
                })

            } else {
                console.log('未退出登录');

                this.build()
            }
        })




    }
    build = () => {

            queryTypes().then((types) => {
                console.log('queryType', Array.from(types));
                this.setState({
                    types: types
                });
            }).catch((error) => {
                console.log(error)
            });

            queryNotes().then((notes) => {
                this.setState({
                    notesOnSearch: notes,
                    notes: notes,
                    isLoading: false,
                });
                console.log(Array.from(notes));
                rememberAllRealm.addListener('change', () => {
                    if (!rememberAllRealm.isInTransaction) {
                        this.reloadData();
                    }
                });

            });

        this.setState({
            isLoading: false
        });
    };

    componentWillUnmount() {
        if (rememberAllRealm.isInTransaction) {
            cancelTrans().catch(() => {

            });
        }
    }
    showSortedNotes = (notes) => {
        console.log('sorted')
        this.setState({
            notesOnSearch: notes,
            notes: notes
        })
    };

    search = () => {

        sortByText(this.state.notesOnSearch, this.state.searchContent).then((notes) => {
            console.log('sorted')
            this.setState({
                notes: notes,
            });
            if (this.state.searchContent === '') {
                this.setState({
                    searchColor: '#757575',
                })
            } else {
                this.setState({
                    searchColor: '#FF5722',

                })
            }

        })
    };

    searchByTime = () => {
        this.props.navigation.navigate('MyCalendar', {
            showSortedNotes: this.showSortedNotes
        });
    };

    reloadData = () => {
        console.log('reloadData!!!')
        this.setState({
            updateImageSkeleton: !this.state.updateImageSkeleton
        });
        queryNotes().then((notes) => {
            // console.log(Array.from(notes));
            this.setState({
                notesOnSearch: notes,
                notes: notes,
                isLoading: false,
            });

        }).catch((error) => {
            console.log(error);
        });
        queryTypes().then((types) => {
            this.setState({
                types: types
            });
        }).catch((error) => {
            console.log(error)
        });
        this.upload();
    };
    setType = (type, note) => {
        beginTrans().then(
            updateType(type.toString(), note.id).then(() => {
                updateNote({
                    id: note.id,
                    name: note.name,
                    noteType: type,
                    time: note.time,
                    noteContent: note.noteContent,
                    noteSkeleton: note.noteSkeleton
                }).then(() => {
                    AsyncStorage.getItem('operations').then((response) => {
                        let operations = JSON.parse(response);
                        operations.push({
                            'updateType': {
                                noteId: note.id,
                                noteType: type.toString()
                            }
                        });
                        AsyncStorage.setItem('operations', JSON.stringify(operations))
                    });
                    if (this.state.oldType !== '') {
                        updateTypeNotes(this.state.oldType, note.id).then(() => {
                            commitTrans()
                        })
                    } else {
                        commitTrans();
                    }
                })
            }).catch(() => {
                cancelTrans()
            })
        );
    };

    openNote = (note) => {
        this.setState({
            openNote: true
        });
        beginTrans().catch(() => {

        });
        if (note) {
            this.props.navigation.navigate('NewNote', {
                note: note,
                isNew: false,
            })
        } else {

            let noteId = uuid();
            let noteDate = new Date();
                    const newNote = {
                        id: noteId,
                        name: '',
                        time: noteDate,
                        noteType: '',
                        noteContent: [],
                    };
                    insertNote(newNote).then(() => {
                        this.props.navigation.navigate('NewNote', {
                            note: newNote,
                            isNew: true
                        })
                    }).catch(() => {

                    })

                // })
            // });
        }

    };

    onOpenChange = (isOpen) => {
        /* tslint:disable: no-console */
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });

    };

    rename = (name, note) => {
        beginTrans().then(() => {
                updateNote({
                    id: note.id,
                    name: name,
                    noteType: note.noteType,
                    time: note.time,
                    noteContent: note.noteContent,
                    noteSkeleton: note.noteSkeleton
                }).then((note) => {
                    AsyncStorage.getItem('operations').then((response) => {
                        let operations = JSON.parse(response);

                        operations.push({
                            'updateName': {
                                noteId: note.id,
                                noteName: name
                            }
                        });
                        AsyncStorage.setItem('operations', JSON.stringify(operations));
                        commitTrans();
                    });

                }).catch((error) => {
                    console.log(error);
                    cancelTrans()
                })
        });
    };


    renderItem = (note, index) => {
        const swipeOutButtons = [
            {
                text: 'Rename',
                style: {color: 'white'},

                onPress: () => {
                    this.setState({
                        oldType: note.noteType
                    });
                    Modal.prompt(
                        'Change the title',
                        null,
                        [
                            {
                                text: 'Don\'t save',
                                onPress: this.cancel,
                                style: 'cancel',
                            },
                            {
                                text: 'Save',
                                onPress: name => this.rename(name, note)
                            }

                        ],
                        'default',
                        note.name === ''? '' : note.name,
                        ['Enter the title']
                    );
                }
            }, {
                text: 'Group',
                style: {backgroundColor: '#424242', color: 'white'},

                onPress: () => {
                    this.setState({
                        oldType: note.noteType
                    });
                    Modal.prompt(
                        'Change the group',
                        null,
                        [
                            {
                                text: 'Don\'t save',
                                onPress: this.cancel,
                                style: 'cancel',
                            },
                            {
                                text: 'Save',
                                onPress: type => this.setType(type, note)
                            }

                        ],
                        'default',
                        note.noteType === ''? '' : note.noteType,
                        ['Please enter the group name']
                    );
                }
            }, {
                text: 'Delete',
                onPress: () => {
                    beginTrans();
                    let noteId = note.id;
                    deleteNote(note.id).then(() => {
                        AsyncStorage.getItem('operations').then((response) => {
                            let operations = JSON.parse(response);
                            operations.push({
                                'deleteNote': noteId
                            });
                            AsyncStorage.setItem('operations', JSON.stringify(operations))
                        });
                        commitTrans()

                    }).catch((error) => {
                        console.log(error);
                        cancelTrans();

                    })
                },
                style: {backgroundColor: '#FF5722', color: 'white'},
            }
        ];

        let types = this.state.types.map((value, index) => {
            return value.type
        });
        // console.log(types);
        // console.log('类型', note.noteType);


        let typeIndex = types.indexOf(note.noteType);
        // console.log(typeIndex);
        let colors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#03a9f4'];

        // console.log('缩略图片路径', 'file://' + DocumentDirectoryPath + '/images/' + note.noteSkeleton[3] + '.jpg');

        return (
            <SwipeAction
                right={swipeOutButtons}
                key={index}
                style={{marginBottom: 5}}>
                <TouchableWithoutFeedback
                    onPress={() => this.openNote(note)}>
                    <View
                        key={index}
                        style={[styles.noteContainer2, {flex: 1, height: 85, width: width, backgroundColor: 'white'}]}>
                        <View style={styles.noteContainer}>
                            <View style={styles.rowContainer}>
                                <Text
                                    style={{marginRight: 10, marginBottom: 10, fontSize: 18}}>
                                    {note.name}
                                </Text>
                                {typeIndex !== -1 ?
                                    <IIcon style={{marginBottom: 10}}
                                           name="ios-bookmark" size={15}
                                           color={colors[typeIndex]}/> : <View/>}
                            </View>
                            <View style={styles.rowContainer}>
                                <Text
                                    numberOfLines={1}
                                    style={{marginRight: 10, marginBottom: 10}}>
                                    {note.noteSkeleton[0]}
                                </Text>
                            </View>
                            <View style={styles.rowContainer}>
                                <Text>
                                    {note.time.toLocaleString()}
                                </Text>
                                {note.noteSkeleton[1] === 'true' ?
                                    <Icon name="mic" size={15} color="#FF5722"/> : <View/>}
                                {note.noteSkeleton[2] === 'true' ?
                                    <Icon name="videocam" size={15} color="#FF5722"/> : <View/>}
                            </View>
                        </View>
                        {note.noteSkeleton[3] !== '' ?
                            <Image
                                key={index}
                                source={{uri: 'file://' + DocumentDirectoryPath + '/images/' + note.noteSkeleton[3] + '.jpg' + '?' + + '?' + new Date()}}
                                style={{width: 50, height: 50, justifyContent: 'flex-end', marginRight: 10, resizeMode: 'cover'}}
                        /> : <View/>}
                    </View>
                </TouchableWithoutFeedback>
            </SwipeAction>
        )

    };
    renderSideItem = (item, index) => {
        let colors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#03a9f4'];

        return (
            <TouchableOpacity>
                <View style={styles.typesContainer}>
                    <IIcon name="ios-bookmark" size={45} color={colors[index]}/>
                    <Text style={{flex: 1, marginLeft: 10}}>{item.type}</Text>
                    <Text style={{justifyContent: 'flex-end'}}>{item.notes.length}</Text>
                </View>
            </TouchableOpacity>
        )
    };
    selectType = (type) => {
        let notes = Array.from(sortById(type.notes));
        console.log('sorted')
        sortById(type.notes).then((notes) => {
            this.setState({
                notesOnSearch: notes,
                notes: notes
            })
            this.drawer && this.drawer.closeDrawer();
        }).catch((error) => {
            console.log(error)
        })

        // console.log(Array.from(type.notes));
    };
    selectByMedia = (type) => {
        console.log('sorted')

        sortByMediaType(type).then((notes) => {
            this.setState({
                notes: notes,
                notesOnSearch: notes
            });
            // console.log(Array.from(notes.noteSkeleton))
            this.drawer && this.drawer.closeDrawer();
        })
    };
// `http://127.0.0.1:8000/user/?id=${userId}`
    upload = () => {
        console.log('上传呀');
        AsyncStorage.getItem('isUploading').then((isUploading) => {
            if (isUploading === 'false') {
                AsyncStorage.setItem('isUploading', 'true');
                setTimeout(() => {
                    AsyncStorage.getItem('operations').then((response) => {
                        console.log('开始上传');
                        const operations = JSON.parse(response);
                        console.log(operations);
                        const uploader = new Uploader(operations);
                        uploader.upload();
                    }, 500);
                })

            }
        }).catch((error) => {
            console.log('获取是否上传', error)
        });

    };




    // fetchUserById = () => {
    //     fetch('http://127.0.0.1:8000/users', {
    //         method: 'GET',
    //         headers: {
    //             'userId': '2'
    //         }
    //     }).then((response) => {
    //         console.log(response)
    //     })
    // };

    // getData = (url, header) => {
    //     fetch(url, {
    //         method: 'GET',
    //         headers: header
    //     }).then((response) => {
    //         console.log(response)
    //     }).catch((error) => {
    //         console.log(error)
    //     })
    // };

    postData = (url, data) => {
        // Default options are marked with *
        return fetch(url, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
                'content-type': 'application/json'
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
    logout = () => {
        // this.props.navigation.dispatch(StackActions.reset({
        //     index: 0,
        //     actions: [
        //         NavigationActions.navigate({routeName: 'Login'})
        //     ],
        // }))

        this.props.navigation.navigate('Login');
    };
    _keyExtractor = (item, index) => item.id;
    render() {
        console.log('重新渲染');
        navigator = this.props.navigation;

        const sidebar = <SideBar types={this.state.types}
                                 selectType={(type) => {this.selectType(type)}}
                                 selectByMedia={(type) => {this.selectByMedia(type)}}
                                 logout={this.logout}
        />;
            {/*<SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>*/}
            {/*    <ScrollView style={{backgroundColor: 'white'}}>*/}
            {/*        <FlatList*/}
            {/*            data={this.state.types}*/}
            {/*            renderItem={({item, index}) => this.renderSideItem(item, index)}*/}
            {/*            keyExtractor={this._keyExtractorForSideBar}*/}
            {/*        />*/}
            {/*    </ScrollView>*/}
            {/*</SafeAreaView>*/}

        return (
            <Fragment>

                {/*<SafeAreaView style={{flex: 0, backgroundColor: 'white'}}/>*/}
                <View style={styles.container}>
                    {this.state.isLoading ? <View style={styles.maskView}/> : <View/>}
                    {this.state.isLoading ?
                        <View style={styles.floatView}>
                            <Spinner style={styles.spinner} isVisible={true} size={100} type='Circle' color='#FF5722'/>
                        </View> : <View/>}
                    <Drawer sidebar={sidebar} position='left'
                            open={false} drawerRef={el => (this.drawer = el)}
                            onOpenChange={this.onOpenChange}
                            drawerBackgroundColor='#ccc'>
                        <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
                            <Header leftElement={
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    <TouchableOpacity
                                        style={{flex: 1, justifyContent: 'flex-start'}}
                                        onPress={() => this.drawer && this.drawer.openDrawer()}>
                                        <Icon name="list" size={45} color="#FF5722"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={this.reloadData}
                                        style={{flex: 1, justifyContent: 'flex-end'}}
                                    >
                                        <Text style={{fontSize: 20, color:"#FF5722"}}>All</Text>
                                        {/*<IIcon name="md-refresh" size={30} color="#FF5722" title="Go to Details"/>*/}
                                    </TouchableOpacity>
                                </View>

                            } titleElement='Notes' rightElement={
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    {/*<TouchableOpacity onPress={this.search} style={{flex: 1, justifyContent: 'flex-start'}}>*/}
                                    {/*    <FontIcon name="search" size={30} color="#FF5722" title="Go to Details"/>*/}
                                    {/*</TouchableOpacity>*/}
                                    <View style={{flex: 1, justifyContent: 'flex-start'}}/>
                                    <TouchableOpacity onPress={this.searchByTime}
                                                      style={{flex: 1, justifyContent: 'flex-end'}}>
                                        <IIcon name="ios-calendar" size={30} color="#FF5722" title="Go to Details"/>
                                    </TouchableOpacity>
                                </View>
                            }/>
                            <View style={styles.searchContainer}>
                                <FontIcon name="search" size={20} color={this.state.searchColor}/>
                                <TextInput
                                    style={{width: '90%', height: 30, borderColor: '#f5f5f5', borderWidth: 0.5, borderRadius: 5,
                                        backgroundColor: 'white', paddingBottom: 0, paddingTop: 0}}
                                    placeholder='Search'
                                    onBlur={() => {
                                        this.setState({
                                            searchColor: '#757575',
                                        })
                                    }}
                                    onChangeText={(text) => {
                                        this.state.searchContent = text;
                                        this.search(text);
                                    }}
                                />
                            </View>
                            <ScrollView style={{backgroundColor: '#f5f5f5'}}>
                                <FlatList
                                    data={this.state.notes}
                                    renderItem={({item, index}) => this.renderItem(item, index)}
                                    keyExtractor={this._keyExtractor}
                                />
                            </ScrollView>
                            {/*<Button onClick={this.fetch}>fetch</Button>*/}
                            {/*<Button onClick={this.download}>download</Button>*/}
                            {/*<View style={{position: 'absolute', left: 0, right: 0, bottom: 6, alignItems: 'center'}}>*/}
                            {/*    <Svg*/}
                            {/*        height="52"*/}
                            {/*        width="52"*/}
                            {/*    >*/}
                            {/*        <Circle*/}
                            {/*            cx="26"*/}
                            {/*            cy="26"*/}
                            {/*            r="26"*/}
                            {/*            fill="white"*/}
                            {/*        />*/}
                            {/*    </Svg>*/}
                            {/*</View>*/}
                            <View style={{left: 0, right: 0, bottom: 0, alignItems: 'center'}}>
                                <TouchableOpacity onPress={() => this.openNote(null)} style={styles.button}>
                                    <Icon name="add-circle" size={64} color="#FF5722" title="Go to Details"/>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </Drawer>
                </View>
            </Fragment>



        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        padding: 0,
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Gill Sans',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
    spinner: {
        marginBottom: 50
    },
    searchContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#f5f5f5'
    },
    rowContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteContainer2: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    typesContainer: {
        // justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 30,
        marginTop: 10,
        marginBottom: 10,
        // backgroundColor: '#f5f5f5'
    },
    noteContainer: {
        // justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 10,
        width: '80%'
        // backgroundColor: '#f5f5f5'
    },
    maskView: {
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
});

