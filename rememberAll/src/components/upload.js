import React, { Component } from 'react';
import {View, Text, Button, AsyncStorage} from 'react-native';
import VideoPlayer from 'react-native-video-player';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists} from "react-native-fs";
import {rememberAllRealm} from "../database/schemas";
import {postData, getData, deleteData, putData} from "./http";

export default class Uploader {
    constructor(operations) {

        this.operations = operations;
        console.log('upload的操作', operations);

        //     newNote: 1
        // }, {
        //     updateNote: 2
        // }, {
        //     deleteNote: 3
        // }, {
        //     newNote: 4
        // }, {
        //     updateType: 5
        // }, {
        //     newNote: 6
        // }, {
        //     deleteNote: 7
        // }];
        // console.log(this.operations);
    }

    componentDidMount() {


    }

    upload = () => new Promise((resolve, reject) => {
        // console.log('喵喵喵', Object.keys(this.operations[0])[0]);

        if (this.operations.length === 0) {
            AsyncStorage.setItem('isUploading', 'false');
            console.log('结束');
            resolve()
        }
        switch (Object.keys(this.operations[0])[0]) {
            case 'newNote':
                this.newNote().then(() => {
                    this.upload()
                });
                break;
            case 'updateNoteContent':
                this.updateNote().then(() => {
                    this.upload()
                });
                break;
            case 'deleteNote':
                this.deleteNote().then(() => {
                    this.upload()

                });
                break;
            case 'updateType':
                this.updateType().then(() => {
                    this.upload()
                });
                break;
            case 'updateName':
                this.updateName().then(() => {
                    this.upload()
                });
                break;
            default:
                break;
        }
        resolve()
    });
    dequeue = () => new Promise((resolve, reject) => {
        AsyncStorage.getItem('operations').then((response) => {
            let newOperations = JSON.parse(response);
            this.operations = newOperations;
            this.operations.shift();
            AsyncStorage.setItem('operations', JSON.stringify(this.operations)).then(
                resolve()
            );
        });
    });

    uploadFile = (file, noteId, id) => new Promise((resolve, reject) => {
        let formData = new FormData();
        formData.append('file', file);
        formData.append('note', noteId);
        formData.append('id', id);

        postData('files/', formData, {
            'content-type': 'multipart/form-data'
        }).then(response => {
            resolve();
        }).catch((error) => {
            console.log(error)
        })
    });
    deleteFiles = (noteContent, noteId) => new Promise(resolve => {
        if (noteContent.length === 0) {
            resolve()
        }

        noteContent.forEach((item, index) => {
            const type = item.substr(0, 9);
            const fileName = item.substr(9);
            if (type === '*#image#*' || type === '*#audio#*' || type === '*#video#*') {
                deleteData('files/' + fileName + '/').then(() => {
                    if (index === noteContent.length - 1) {
                        resolve();
                    }
                })
            }


        });

    });

    uploadFiles = (noteContent, noteId) => new Promise(resolve => {
        if (noteContent.length === 0) {
            resolve()
        }

        noteContent.forEach((item, index) => {
            const type = item.substr(0, 9);
            const fileName = item.substr(9);
            switch (type) {
                case '*#image#*':
                    this.uploadFile({
                        uri: DocumentDirectoryPath + '/images/' + fileName + '.jpg',
                        type: 'image/jpeg',
                        name: fileName + '.jpg',
                    }, noteId, fileName)

                    break;
                case '*#audio#*':
                    this.uploadFile({
                        uri: DocumentDirectoryPath + '/audios/' + fileName + '.aac',
                        type: 'audio/aac',
                        name: fileName + '.aac',
                    }, noteId, fileName);
                    break;
                case '*#video#*':
                    this.uploadFile({
                        uri: DocumentDirectoryPath + '/videos/' + fileName + '.mp4',
                        type: 'video/mp4',
                        name: fileName + '.mpv',
                    }, noteId, fileName);
                    break;
                default:
                    console.log('text');
                    break;
            }

            if (index === noteContent.length - 1) {
                resolve();
            }
        });

    });


    newNote = () => new Promise((resolve, reject) => {

        let operation = Object.values(this.operations[0])[0];

        postData('notes/', operation).then((response) => {
            console.log(response)
            setTimeout(() => {
                this.uploadFiles(JSON.parse(operation.noteContent), operation.id).then(
                    () => {
                        this.dequeue().then(() => {
                            resolve()
                        });
                    }
                )
            }, 2000)

        })
    });
    updateNote = () => new Promise((resolve, reject) => {
        let operation = Object.values(this.operations[0])[0];
        let oldNote = operation[0].oldNote;
        let updatedNote = operation[1].updatedNote;


        let oldNoteContent = JSON.parse(oldNote.noteContent);
        let newNoteContent = JSON.parse(updatedNote.noteContent);

        let intersection = oldNoteContent.filter(x => newNoteContent.includes(x));
        let oldOnly = oldNoteContent.filter(x => !newNoteContent.includes(x));
        let newOnly = newNoteContent.filter(x => !oldNoteContent.includes(x));

        putData('notes/' + oldNote.id + '/', updatedNote).then((response) => {
            this.uploadFiles(newOnly, oldNote.id).then(() => {
                console.log(response);
                this.dequeue().then(() => {
                    resolve()
                });
            });
            this.deleteFiles(oldOnly, oldNote.id)
        })
    });
    deleteNote = () => new Promise((resolve, reject) => {
        let operation = Object.values(this.operations[0])[0];
        deleteData('notes/' + operation + '/').then(() => {
            this.dequeue().then(() => {
                resolve();
            });
        })
    });
    updateName = () => new Promise((resolve, reject) => {
        let operation = Object.values(this.operations[0])[0];
        putData('notes/' + operation.noteId + '/', {name: operation.noteName}).then(() => {
            this.dequeue().then(() => {
                resolve();
            });
        })
        // setTimeout(() => {
        //     console.log(Object.values(this.operations[0])[0]);
        //     console.log(this.operations);
        //     this.dequeue().then(() => {
        //         resolve()
        //     });
        // }, 5000)

    });
    updateType = () => new Promise((resolve, reject) => {
        let operation = Object.values(this.operations[0])[0];
        putData('notes/' + operation.noteId + '/', {noteType: operation.noteType}).then(() => {
            this.dequeue().then(() => {
                resolve();
            });
        })

    });
}