import { ActivityIndicator, Dimensions, FlatList, HeaderLeft, Image, Keyboard, KeyboardAvoidingView, KeyboardEvent, Pressable, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import getFirebaseImage from '../helpers/getImage';
import AppStyles from '../styles/AppStyles';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-ico-material-design';

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

  useEffect(() => {
    // setLoading(true);
    if (inFocus) {
      setLoading(true);
    }
}, [inFocus])

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

const onKeyboardDidShow = (e) => {
    setShortHeight(Dimensions.get('window').height - e.endCoordinates.height - 250);
}

  useEffect(() => {
    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMessage('Permission to access location was denied');
            setCoords({latitude: -33.9188, longitude: 18.4233});
            return;
        }

        // Permission granted
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        setCoords(location.coords);
        
    })();
  }, []);
  
  const goBack = () => {
    props.onClose();
  }




  const onLocationSelect = (location) => {
    console.log("onLocationSelect", location);
    props.onSelectLocation(location);
    goBack();
}

useEffect(() => {
    (async () => {
        console.log("useEffect", addressLoading);
        if (coords.latitude)
        {
            let address = await Location.reverseGeocodeAsync(coords);
            setLocation(address[0]);
        }
        setAddressLoading(false);
    })();
}, [addressLoading]);

let markerDragEnded = (e) => {
    setAddressLoading(true);
    setCoords(e.nativeEvent.coordinate);
    console.log("markerDragEnded", addressLoading, e.nativeEvent.coordinate);
}

  
let addLocation = async () => {
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
      <Pressable onPress={goBack}>
        <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Back </Text>
      </Pressable>
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
            <Marker 
                draggable
                coordinate={coords}
                onDrag={(e) => {setCoords(e.nativeEvent.coordinate)}}
                onDragEnd={(e) => markerDragEnded(e)}
            />

        </MapView> 
        : <View style={[AppStyles.mapSetMarker]}>
            <ActivityIndicator size="large" color="#0000ff" style={{marginTop: '50%'}}/>
            <Text style={{alignSelf: 'center', marginVertical: 25}} >Map Loading...</Text>
          </View>}
        <SafeAreaView>   
            <View>
                <Text style={{alignSelf: 'center', color: 'black', marginVertical: 10}}>Drag the pin to your dive site's location</Text>  
            </View> 
            <View style={[AppStyles.container, AppStyles.mapViewContainer]}>
                <TextInput 
                    style={[AppStyles.input, {width: '50%', height: 40}]}
                    onChangeText={(text) => setLocationName(text)}
                    placeholder="Name of Dive Site"
                    onSubmitEditing={Keyboard.dismiss}
                />
                { addressLoading ? 
                <TouchableOpacity disabled style={[AppStyles.buttonBlue, AppStyles.section, AppStyles.buttonBlueSmall]} onPress={addLocation}>    
                    <ActivityIndicator size="small" color="#00ff00" />
                    <Text style={AppStyles.locationButtonText}>Add</Text>
                </TouchableOpacity>
                : 
                <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section, AppStyles.buttonBlueSmall]} onPress={addLocation}>    
                    <Icon name="searching-location-gps-indicator" height='20' width='20' color="white"/>
                    <Text style={AppStyles.locationButtonText}>Add</Text>
                </TouchableOpacity> }
            </View>
        </SafeAreaView>
    </KeyboardAvoidingView>
    
  )
});

export default NewDiveLocationModal;
