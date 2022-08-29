import { Image, View, Pressable, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';

import { db, auth, storage } from '../firebase';

import get200ImageRef from '../helpers/get200ImageRef';
import get200ImageUrl from '../helpers/get200ImageUrl';
import handleImageUpload from '../helpers/uploadImage';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';

// async function getImageUrls (pickerImages) {
//     let images = [];
//     console.log(
//         pickerImages.map( async (img) => {
//             console.log('temp img', img);
//             setImages(images => [...images, (handleImageUpload(img.uri))]);
//             return await handleImageUpload(img.uri);              
//         }));
   
    
// }

const MultiImageUploader = ({...props}) => {
    const [images, setImages] = useState([]);
    const inFocus = useIsFocused();
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pickerResult, setPickerResult] = useState(null);

    useEffect(() => {
        if (props.selectedImages) {
            setImages(props.selectedImages);
        }
        // openImagePickerAsync();
    }, [props.selectedImages])
    // Return user to previous screen
    // const goBack = () => {
    //     props.onClose();
    // }

    // Handle image picking
    let openImagePickerAsync = async () => {
        // Get permission to open photo roll 
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        // If no access is granted
        if (permissionResult.granted === false) {
            setErrorMessage("Permission to access camera roll is required!");
            return;
        }
        setLoading(true);
        // Launch image picker
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            selectionLimit: 4,
          });


        // Return if image picker is cancelled
        if (result.cancelled === true) {
            // goBack();
            setLoading(false);
            return;
        }

        // Result of image picker to be uploaded
        // handleImageUpload(pickerResult.uri)
        
        setPickerResult(result.selected);
    }
    

    useEffect(() => {
        setLoading(true);
        if (pickerResult)
        {
            pickerResult.map(async (img) => {
                const url = await handleImageUpload(img.uri)
                setImages(images => [...images, url]);   
                props.onSelect(images => [...images, url]);
            })
            
        }
    }, [pickerResult])

    const removeImages = () => {
        setImages([]);
        props.onSelect([]);
    }

    useEffect(() => {
        setLoading(false);
    }, [images])

    
    // Pass selected buddies to previous screen
    const onImagesSelected = () => {
        props.onSelect(images);
        // goBack();
    }

    // Get user profile picture
    const setImage = (image) => {
        // Create a reference to the file we want to show
        var storageRef = storage.ref();
        var imageRef = storageRef.child(auth.currentUser.uid + '/' + image);
        // Get the download URL
        imageRef.getDownloadURL()
        .then((url) => {
          // Insert url into an <img> tag to "download"
          setImages(images => [...images, url]);
        })
        .catch((error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/object-not-found':
                // File doesn't exist
                setErrorMessage('File doesn\'t exist')
                break;
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                setErrorMessage('User doesn\'t have permission to access the object')
                break;
              case 'storage/canceled':
                // User canceled the upload
                setErrorMessage('User canceled the upload')
                break;
              case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                setErrorMessage('Unknown error occurred, please try again')
                break;
            }
        });
    }

    return (
        <View style={{flexDirection: 'column', width: '100%'}}>
            
            <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            { images?.length > 0 &&
                images.map((image, index) => 
                    <Image key={index} source={{ uri: image }} style={{ width: 60, height: 60, margin: 2,  borderWidth: 1, borderColor: 'white'}} />
                ) 
                
            }
            { images?.length > 0 &&
                <TouchableOpacity style={{justifyContent: 'center'}} onPress={removeImages}>
                    <Icon name="rounded-remove-button" size={120} style={{width: 60, height: 60, margin: 15,  borderWidth: 1, borderColor: 'white'}} />
                </TouchableOpacity>
            }
            </View>
            { images?.length < 4 &&
            <View style={{ width: '100%', height: 100,  backgroundColor: '#F5F5F5', borderColor: '#413FEB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderStyle: 'dashed', borderWidth: 1}}>
                <TouchableOpacity onPress={openImagePickerAsync} style={{width: '100%', height: 100, justifyContent: 'center', alignItems: 'center'}}>
                    { loading ? <ActivityIndicator size="large" color="#413FEB" /> : <Icon name="camera" color="#413FEB" size={30} /> }
                    {/* <Icon name="camera" size={30} color="#413FEB" /> */}
                </TouchableOpacity>
            </View>
            }   
        </View>
        
    );
}

export default MultiImageUploader;