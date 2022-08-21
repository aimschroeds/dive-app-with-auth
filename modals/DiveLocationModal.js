import { ActivityIndicator, Dimensions, FlatList, HeaderLeft, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

const DiveLocationModal = (({ navigation, ...props }) => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [markersLoading, setMarkersLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [userLoc, setUserLoc] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const inFocus = useIsFocused();

  // console.log(Dimensions.get('window').height)
  

  useEffect(() => {
    // setLoading(true);
    if (inFocus) {
      setLoading(true);
    }
}, [inFocus])

if (props.selectedLocation?.name && loading) {
  let loc = props.selectedLocation
  setLocation(loc);
  setLoading(false)
}

  useEffect(() => {
    (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMessage('Permission to access location was denied');
            return;
        }

        // Permission granted
        let location = await Location.getCurrentPositionAsync({});
        setUserLoc(location);
    })();
  }, []);
  
  const goBack = () => {
    props.onClose();
  }

  const onLocationSelect = (location) => {
    setLocation(location);
    props.onSelect(location);
    console.log("onLocationSelect", location);
    goBack();
}
  
  var locRef = db.collection("locations");

  let loadLocations = async () => {
    var locations = locRef
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
                    region: doc.data().region,
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
        <MapView
            style={[AppStyles.map]}
            initialRegion={{
            latitude: location ? location.latitude : userLoc ? userLoc.coords.latitude : 37.78825,
            longitude: location ? location.longitude : userLoc ? userLoc.coords.longitude : -122.4324,
            latitudeDelta: 0.4822,
            longitudeDelta: 0.3221,
            }}
        >
            {locations.map((loc, id) => (
                <Marker
                key={loc.id}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={loc.name}
                onCalloutPress={() => onLocationSelect(loc)}
                />
            ))}
        
        </MapView>
        <View style={[AppStyles.container, AppStyles.mapViewContainer]}>
            
            <Text style={{color: '#413FEB', paddingVertical: 20, paddingHorizontal: 10, backgroundColor: 'white'}}>Dive Site Not On The Map?</Text>
            <TouchableOpacity style={[AppStyles.buttonBlue, AppStyles.section]} >
              <Icon name="searching-location-gps-indicator" height='20' width='20' color="white"/>
              <Text style={AppStyles.locationButtonText}>Add Location</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
});

export default DiveLocationModal;
