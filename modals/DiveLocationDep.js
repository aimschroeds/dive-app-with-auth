import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import getFirebaseImage from '../helpers/getImage';
import AppStyles from '../styles/AppStyles';

const DiveLocationDep = ({ route, navigation }) => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  var usersRef = db.collection("locations");

  const updateSearch = (search) => {
    setSearch(search)
    setLoading(true)
  }

  const onDiveMasterSelect = (diveMaster) => {
    setDiveMaster(diveMaster);
    props.onSelect(diveMaster);
    console.log("onDiveMasterSelect", diveMaster);
}

  let loadLocations = async () => {
    var searchableUsers = usersRef
    .where("searchable", "==", true)
    .where('display_name', '>=', search)
    .limit(100)
    .get()
        .then((querySnapshot) => {
            let eligibleLocations = []
            querySnapshot.forEach((doc) => {
                let location = {
                    id: doc.id,
                    name: doc.data().name,
                    region: doc.data().region,
                    lat: doc.data().latitude,
                    long: doc.data().longitude,
                    created_at: doc.data().created_at,
                    loading: true,
                }
                location.loading = false
                eligibleLocations.push(location) 
            })
            setLoading(false)
            setLocations(eligibleLocations)
            })
        .catch((error) => {
            console.log("Error getting locations: ", error);
        });
  }


  if (loading) {
    loadLocations()
  }


  return (
    <View>
      <TextInput 
            style={[AppStyles.input]}
            onChangeText={(text) => updateSearch(text)}
            // value={search}
            placeholder="Search"
        />
        <FlatList
            data={locations}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
            <View
            style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
            }}>
                { item.loading && <ActivityIndicator size="small" color="#00ff00" /> }
                    <Text style={{ fontSize: 22, marginLeft: 15 }}>
                        {item.name}
                        {item.region}
                    </Text>
                <TouchableOpacity style={{flex: 3, alignItems: 'flex-end' }} onPress={() => navigation.navigate('Friend', { userId: item.id })}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Select</Text>
                </TouchableOpacity>
            </View>
            )}
        />
        { loading && <View
            style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderColor: '#CED0CE'
            }}>
            <ActivityIndicator animating size='large' />
            </View> }
  </View>
  )
}

export default FindFriendsScreen
