import { ActivityIndicator, Dimensions, Keyboard, KeyboardAvoidingView, 
          Pressable, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db, auth } from '../firebase';

import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';


/**
 * Modal enabling user to add new dive locations
 * @param {*} navigation 
 * @param {*} props
 * TO DO: Define each prop?
 * @returns {JSX.Element}
 */

const NewDiveLocationModal = (({ navigation, ...props }) => {
    const [loading, setLoading] = useState(true)
    const [userLocation, setUserLocation] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const inFocus = useIsFocused();
    const [locationName, setLocationName] = useState('');
    const [coords, setCoords] = useState({latitude: null, longitude: null});
    const [keyboardStatus, setKeyboardStatus] = useState(false);
    const [shortHeight, setShortHeight] = useState(0);
    const [width, setWidth] = useState(Dimensions.get('window').width);
    const [addressLoading, setAddressLoading] = useState(false);
    const [location, setLocation] = useState({});

    // When user returns to screen, reload data
    useEffect(() => {
        if (inFocus) {
          setLoading(true);
        }
    }, [inFocus])


    // Keep track of state of keyboard
    useEffect(() => {

        const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardStatus(true);
            onKeyboardDidShow(e);
        });
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardStatus(false);
        });
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        }
    }, []);


    // Reduce height on map, if keyword is in use
    const onKeyboardDidShow = (e) => {
        setShortHeight(Dimensions.get('window').height - e.endCoordinates.height - 250);
    }

    // Access user location data
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMessage('Permission to access location was denied');
                // Use default set of coordinates
                setCoords({latitude: 51.5229, longitude: 0.1308});
                return;
            }

            // Permission granted
            let location = await Location.getCurrentPositionAsync({});
            // Default map to user's location
            setUserLocation(location);
            setCoords(location.coords);    
        })();
    }, []);
  

    // Return user to previous screen
    const goBack = () => {
        props.onClose();
    }

    // If selection made, pass data to previous screen
    const onLocationSelect = (location) => {
        props.onSelectLocation(location);
        goBack();
  }

    // Get address of Marker
    useEffect(() => {
        (async () => {
            if (coords.latitude)
            {
                let address = await Location.reverseGeocodeAsync(coords);
                setLocation(address[0]);
            }
            setAddressLoading(false);
        })();
    }, [addressLoading]);


    // When user stops dragging marker, set coords and initiate getting address
    let markerDragEnded = (e) => {
        setAddressLoading(true);
        setCoords(e.nativeEvent.coordinate);
    }

    
    // Add location / site to db
    let addLocation = async () => {
        // Validation of input
        if (locationName == '')
        {
            setErrorMessage("Please enter a location name");
            return;
        }
        if (location) 
        {
            let loc = {
                name: locationName,
                location: location,
                latitude: coords.latitude,
                longitude: coords.longitude,
                userId: auth.currentUser.uid,
                createdAt: new Date(),
              }
              // Reference to locations db in firebase
              // Add new document
              var locRef = db.collection("locations").add(loc)
              .then((docRef) => {
                  console.log("Document written with ID: ", docRef.id);
                  loc.id = docRef.id;
                  setSuccessMessage('Dive added!')
                  onLocationSelect(loc);
              })
              .catch((error) => {
                  console.error("Error adding document: ", error);
                  setErrorMessage(error.message)
              });
        }
        
    };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{marginTop: '1%'}}
    > 
        {/* Header back button */}
        <Pressable onPress={goBack}>
            <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Back </Text>
        </Pressable>
        {/* If coords are set, show Map */}
        {/* Otherwise show 'Map Loading' */}
        { coords.latitude ? 
            <MapView
                style={!keyboardStatus ? AppStyles.mapSetMarker : {width: width, height: shortHeight}}
                initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.4822,
                longitudeDelta: 0.3221,
                }}
            >
                {/* Draggable marker; position defaults to user location */}
                <Marker 
                    draggable
                    coordinate={coords}
                    onDrag={(e) => {setCoords(e.nativeEvent.coordinate)}}
                    onDragEnd={(e) => markerDragEnded(e)}
                />
            </MapView> 
        :   <View style={[AppStyles.mapSetMarker]}>
              <ActivityIndicator size="large" color="#0000ff" style={{marginTop: '50%'}}/>
              <Text style={{alignSelf: 'center', marginVertical: 25}} >Map Loading...</Text>
            </View> }
        <SafeAreaView>  
            {/* Instructions to drag pin  */}
            <View>
                <Text style={{alignSelf: 'center', color: 'black', marginVertical: 10}}>Drag the pin to your dive site's location</Text>  
            </View> 
            {/* Input for name of new dive site / location */}
            <View style={[AppStyles.container, AppStyles.mapViewContainer]}>
                <TextInput 
                    style={[AppStyles.input, {width: '50%', height: 40}]}
                    onChangeText={(text) => setLocationName(text)}
                    placeholder="Name of Dive Site"
                    onSubmitEditing={Keyboard.dismiss}
                />
                {/* While address is loading, show "Add" button as disabled */}
                {/* Otherwise show 'Add' button */}
                { addressLoading ? 
                <TouchableOpacity disabled style={[AppStyles.buttonBlue, AppStyles.section, AppStyles.buttonBlueSmall, {marginTop: 18}]} onPress={addLocation}>    
                    <ActivityIndicator size="small" color="#00ff00" />
                    <Text style={AppStyles.locationButtonText}>Add</Text>
                </TouchableOpacity>
                : 
                <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section, AppStyles.buttonBlueSmall, {marginTop: 18}]} onPress={addLocation}>    
                    <Icon name="searching-location-gps-indicator" height='20' width='20' color="white"/>
                    <Text style={AppStyles.locationButtonText}>Add</Text>
                </TouchableOpacity> }
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>
  )
});

export default NewDiveLocationModal;
