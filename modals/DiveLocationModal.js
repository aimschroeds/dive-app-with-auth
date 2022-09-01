import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db } from '../firebase';

import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';

import Icon from 'react-native-ico-material-design';

import NewDiveLocationModal from './NewDiveLocationModal';

import AppStyles from '../styles/AppStyles';

/**
 * Enable user to set dive location / dive site
 * @param {*} navigation
 * @param {*} props 
 * @returns {JSX.Element}
 */

const DiveLocationModal = (({ navigation, ...props }) => {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [markersLoading, setMarkersLoading] = useState(true)
    const [location, setLocation] = useState(null)
    const [userLoc, setUserLoc] = useState(null);
    const [coords, setCoords] = useState({latitude: null, longitude: null});
    const [errorMessage, setErrorMessage] = useState(null)
    const inFocus = useIsFocused();
    const [newDiveLocationModalVisible, setNewDiveLocationModalVisible] = useState(false)

    
    // Update map when user returns to this screen
    useEffect(() => {
      // setLoading(true);
      if (inFocus) {
        setLoading(true);
      }
    }, [inFocus])


    // If user returns to this screen, reload data
    if (props.selectedLocation?.name && loading) {
        let loc = props.selectedLocation;
        setLocation(loc);
        setLoading(false);
        setCoords(loc.coords);
    }


  // Access user location data
  useEffect(() => {
      (async () => {
          // Get permission for using user location
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              setErrorMessage('Permission to access location was denied');
              setCoords({latitude: 51.5229, longitude: 0.1308});
              return;
          }

          // Permission granted
          // Get user location to use as default position on map
          let user_location = await Location.getCurrentPositionAsync({});
          setUserLoc(user_location);
          setCoords(user_location.coords);
      })();
  }, []);

    // Return user to previous screen
    const goBack = () => {
        props.onClose();
    }

    // Return dive location data to previous screen
    const onLocationSelect = (location) => {
        setLocation(location);
        setCoords(location.coords);
        props.onSelect(location);
        goBack();
    }
    

    // Reference to locations db in firebase
    var locRef = db.collection("locations");


    // Load locations onto map
    let loadLocations = async () => {
        var locations = locRef
        // TO DO: Remove limit
        .limit(100)
        .get()
        .then((querySnapshot) => {
            let eligibleLocations = []
            querySnapshot.forEach((doc) => {
                let loc = {
                    id: doc.id,
                    name: doc.data().name,
                    latitude: doc.data().latitude,
                    longitude: doc.data().longitude,
                    created_at: doc.data().created_at,
                    location: doc.data().location,
                    loading: true,
                }
                loc.loading = false
                eligibleLocations.push(loc) 
            })
            setMarkersLoading(false)
            setLocations(eligibleLocations)
        })
        .catch((error) => {
            console.log("Error getting locations: ", error);
        });
    }



    if (markersLoading) {
      loadLocations()
    }


    return (
        <View
            style={{marginTop: '1%'}}
        > 
            <Pressable onPress={goBack}>
                <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Back </Text>
            </Pressable>
            {/* Load map with initial position set to user location if available */}
            {/* If coords are set, show Map */}
            {/* Otherwise show 'Map Loading' */}
            { coords?.latitude ? 
            <MapView
                style={[AppStyles.map]}
                initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.4822,
                longitudeDelta: 0.3221,
                }}
            >
                {/* Load locations to map as Markers */}
                {locations.map((loc, id) => (
                    <Marker
                    key={loc.id}
                    coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                    title={loc.name}
                    onCalloutPress={() => onLocationSelect(loc)}
                    />
                ))}
            </MapView> :   <View style={[AppStyles.mapSetMarker]}>
              <ActivityIndicator size="large" color="#0000ff" style={{marginTop: '50%'}}/>
              <Text style={{alignSelf: 'center', marginVertical: 25}} >Map Loading...</Text>
            </View> }
            {/* Button to open modal for adding new dive site (not yet on map) */}
            <View style={[AppStyles.container, AppStyles.mapViewContainer]}>
                <Text style={{color: '#413FEB', paddingVertical: 12, height: 40, paddingHorizontal: 10, backgroundColor: 'white'}}>Dive Site Not On The Map?</Text>
                <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section]} onPress={()=>setNewDiveLocationModalVisible(true)}>
                    <Icon name="searching-location-gps-indicator" height='20' width='20' color="white"/>
                    <Text style={AppStyles.locationButtonText}>Add Location</Text>
                </TouchableOpacity>
            </View>
            {/* Modal for add dive site */}
            <Modal
                animationType="slide"
                presentationStyle="pageSheet"
                visible={newDiveLocationModalVisible}
                onRequestClose={() => {
                  setNewDiveLocationModalVisible(!newDiveLocationModalVisible);
                }}>
                <NewDiveLocationModal 
                  onClose={() => setNewDiveLocationModalVisible(false)}
                  onSelectLocation={(loc) => {onLocationSelect(loc)}}
                />
            </Modal>
        </View>
    )
});

export default DiveLocationModal;
