import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

import { db } from '../firebase';

import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { Marker } from 'react-native-maps';

import Icon from 'react-native-ico-material-design';

import AppStyles from '../styles/AppStyles';

/**
 * Enable user to set dive location / dive site
 * @param {*} navigation
 * @param {*} props 
 * @returns {JSX.Element}
 */

const ExploreScreen = (({ navigation, ...props }) => {
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(true)
    const [markersLoading, setMarkersLoading] = useState(true)
    const [location, setLocation] = useState(null)
    const [userLoc, setUserLoc] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const inFocus = useIsFocused();

    
    // Update map when user returns to this screen
    useEffect(() => {
      // setLoading(true);
      if (inFocus) {
        setLoading(true);
      }
    }, [inFocus])


  // Access user location data
  useEffect(() => {
      (async () => {
          // Get permission for using user location
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              setErrorMessage('Permission to access location was denied');
              return;
          }

          // Permission granted
          // Get user location to use as default position on map
          let location = await Location.getCurrentPositionAsync({});
          setUserLoc(location);
      })();
  }, []);

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
        > 
            {/* Load map with initial position set to user location if available */}
            <MapView
                style={[AppStyles.mapExplore]}
                initialRegion={{
                latitude: userLoc ? userLoc.coords.latitude : 51.5229,
                longitude: userLoc ? userLoc.coords.longitude : 0.1308,
                latitudeDelta: 1.6022,
                longitudeDelta: 1.2221,
                }}
            >
                {/* Load locations to map as Markers */}
                {locations.map((loc, id) => (
                    <Marker
                    key={loc.id}
                    coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                    title={loc.name}
                    // onCalloutPress={() => onLocationSelect(loc)}
                    />
                ))}
            </MapView>
        </View>
    )
});

export default ExploreScreen;
