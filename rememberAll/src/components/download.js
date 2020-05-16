import React, { Component } from 'react';
import {View, Text, Button, AsyncStorage} from 'react-native';
import VideoPlayer from 'react-native-video-player';
import {moveFile, DocumentDirectoryPath, writeFile, mkdir, exists, downloadFile} from "react-native-fs";
import {
    insertAudio,
    insertNote,
    insertPicture,
    insertVideo,
    rememberAllRealm,
    updateNote,
    updateType
} from "../database/schemas";
import {postData, getData, deleteData, putData} from "./http";
import RNFetchBlob from "react-native-fetch-blob";

export default class Downloader {
    constructor(operations) {
    }

    componentDidMount() {


    }

    download = () => new Promise( (resolve) => {
        this.downloadNotes().then(() => {
            resolve()
        })
    });

    downloadNotes = () => new Promise((resolve)=> {
        AsyncStorage.getItem('userName').then((username) => {
            getData('notes/', {'username': username}).then((response) => {
                response.json().then((notes) => {
                    if (notes.length === 0) {
                        resolve()
                    }
                    // this.setTypes(notes);
                    for (let note of notes) {
                        const newNote = {
                            id: note.id,
                            name: note.name,
                            time: note.time,
                            noteType: note.noteType,
                            noteContent: JSON.parse(note.noteContent),
                            noteSkeleton: JSON.parse(note.noteSkeleton),
                        };
                        const imageSkeleton = JSON.parse(note.noteSkeleton)[3];

                        if (JSON.parse(note.noteSkeleton)[3] !== '') {
                            console.log('缩略路径呀呀', JSON.parse(note.noteSkeleton)[3]);
                            this.downloadFile(imageSkeleton, '.jpg', note.id, 'images').then(() => {
                                insertPicture({
                                    uuid: '*#image#*' + JSON.parse(note.noteSkeleton)[3],
                                    uri: JSON.parse(note.noteSkeleton)[3] + '.jpg',
                                    noteId: note.id,
                                });
                            })
                        }

                        insertNote(newNote).then(() => {
                            if (note.noteType !== '') {
                                console.log(note.noteType, note.id);
                                updateType(note.noteType, note.id)
                            }
                            this.downloadFiles(JSON.parse(note.noteContent), note.id, imageSkeleton)
                        }).catch((error) => {
                            console.log(error)
                        });
                        if (notes[notes.length - 1] === note) {
                            resolve()
                        }
                    }

                })
            })
        })

    });


    downloadFiles = (noteContent, noteId, imageSkeleton) => new Promise(resolve => {
        if (noteContent.length === 0) {
            resolve()
        }

        noteContent.forEach((item, index) => {
            const type = item.substr(0, 9);
            const fileName = item.substr(9);
            // const filePath = DocumentDirectoryPath + '/' + fileName;
            switch (type) {
                case '*#image#*':
                    if (fileName === imageSkeleton) {
                        break;
                    }
                    this.downloadFile(fileName, '.jpg', noteId, 'images');
                    insertPicture({
                        uuid: '*#image#*' + fileName,
                        uri: fileName + '.jpg',
                        noteId: noteId,
                    });
                    break;
                case '*#audio#*':
                    this.downloadFile(fileName, '.aac', noteId, 'audios');
                    insertAudio({
                        uuid: '*#audio#*' + fileName,
                        uri: fileName + '.aac',
                        noteId: noteId,
                    });
                    break;
                case '*#video#*':
                    this.downloadFile(fileName, 'mp4', noteId, 'videos');
                    insertVideo({
                        uuid: '*#video#*' + fileName,
                        uri: fileName + '.mp4',
                        noteId: noteId,
                    });
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
    downloadFile = (fileName, suffix, noteId, type) => new Promise((resolve, reject) => {
        RNFetchBlob.config({
            // response data will be saved to this path if it has access right.
            path : DocumentDirectoryPath + '/' + type + '/' + fileName + suffix
        })
            // .fetch('GET', 'https://rememberall.yvetteho.com/media/' + fileName + suffix, {
            //     //some headers ..
            // })
            .fetch('GET', 'http://127.0.0.1:8000/media/' + fileName + suffix, {
                //some headers ..
            })
            .then((res) => {
                // the path should be dirs.DocumentDir + 'path-to-file.anything'
                console.log('The file saved to ', res.path())
                resolve()
            }).catch((error) => {
                console.log(error)
        })
    });

}