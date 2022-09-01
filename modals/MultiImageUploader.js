import { Image, View, Pressable, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';

import { db, auth, storage } from '../firebase';

import get200ImageRef from '../helpers/get200ImageRef';
import get200ImageUrl from '../helpers/get200ImageUrl';
import handleImageUpload from '../helpers/handleImageUpload';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';

const MultiImageUploader = ({...props}) => {
    const [images, setImages] = useState([]);
    const inFocus = useIsFocused();
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pickerResult, setPickerResult] = useState(null);
    const [localImages, setLocalImages] = useState([]);

    useEffect(() => {
        if (props.selectedImages) {
            // setImages(props.selectedImages);
        }
    }, [props.selectedImages, inFocus])

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
            quality: 1,
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
                setLocalImages(localImages => [...localImages, img.uri]);
                const url = await handleImageUpload(img.uri)
                setImages(images => [...images, url]);   
                props.onSelect(images => [...images, url]);  
            })
        }
    }, [pickerResult])

    const removeImages = () => {
        setLocalImages([]);
        setImages([]);
        props.onSelect([]);
    }

    useEffect(() => {
        setLoading(false);
    }, [images])

    return (
        <View style={{flexDirection: 'column', width: '100%'}}>
            
            <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            { localImages?.length > 0 &&
                localImages.map((image, index) => 
                    <Image key={index} source={{ uri: image }} style={{ width: 60, height: 60, margin: 2,  borderWidth: 1, borderColor: 'black'}} />
                ) 
                
            }
            { images?.length > 0 &&
                <TouchableOpacity style={{justifyContent: 'center'}} onPress={removeImages}>
                    <Icon name="rubbish-bin-delete-button" size={120} color="#413FEB" style={{width: 60, height: 60, margin: 15,  borderWidth: 1, borderColor: 'white'}} />
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