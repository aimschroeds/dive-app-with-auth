import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { db, auth, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 
import getFirebaseImage from '../helpers/getImage';
import AppStyles from '../styles/AppStyles';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-ico-material-design';

const AddBuddyModal =  (({ navigation, ...props }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [friends, setFriends] = useState([])
  const [buddies, setBuddies] = useState([])
  const [searchError, setSearchError] = useState(null)
  const inFocus = useIsFocused();

  if (props.selectedBuddies?.length > 0 && loading) {
    let buds = props.selectedBuddies
    setBuddies(buds);
    // setLoading(false);
  }
  

  const goBack = () => {
    props.onClose();
  }

  const onBuddySelect = (buddy) => {
    setBuddy(buddy);
    // console.log("onBuddySelect", buddy);
    props.onSelect(buddy);
    goBack();
}

const addBuddy = (bud) => {
    setBuddies(buddies => [...buddies, bud]);
    const updatedFriends = friends.map(friend => {
        if (friend.id === bud.id) {
            return { ...friend, added_to_dive: true };
        }
        return friend;
    });
    setFriends(updatedFriends);
    // setBuddies(...buddies, buddy);
    
    // buddies.forEach((buddy) => {console.log(buddy)})
    
}

const removeBuddy = (bud) => {
    setBuddies(current =>
        current.filter(buddy => {
        return buddy.id !== bud.id;
        }),
    );
    const updatedFriends = friends.map(friend => {
        if (friend.id === bud.id) {
            return { ...friend, added_to_dive: false };
        }
        return friend;
    });
    setFriends(updatedFriends);
}
useEffect(() => {
    console.log("useEffect", buddies);
}, [buddies])

  var friendsRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships");

  const updateSearch = (search) => {
    setSearch(search)
    setLoading(true)
  }

  let loadFriends = async () => {
    var getOptions = {
        source: 'default'
        };
    friendsRef.get()
        .then((querySnapshot) => {
            let eligibleFriends = []
            querySnapshot.forEach((friend) => {
                console.log(friend.id, " => ", friend.data());
                db.collection("users").doc(friend.id).get()
                .then((user) => {
                    // console.log(user.id, " => ", user.data());
                    let friend_data = {
                        id: user.id,
                        display_name: user.data().display_name,
                        image_url: user.data().image_200_url,
                        image: user.data().image,
                        created_at: user.data().created_at,
                        loading: true,
                        added_to_dive: false,
                    }
                    if (!friend_data.image_url)
                    {
                        // Create a reference to the file we want to show
                        var storageRef = storage.ref();
                        var profilePicRef = storageRef.child(user.id + '/' + friend_data.image);
                        // Get the download URL
                        profilePicRef.getDownloadURL()
                        .then((url) => {
                            // Insert url into an <img> tag to "download"
                            friend_data.image_url = url
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                    }
                    eligibleFriends.push(friend_data) 
                    friend_data.loading = false
                })
                .catch((error) => {
                    setSearchError("No friends found")
                })                
                .finally(() => {
                    setFriends(eligibleFriends)
                    setLoading(false)
                })
            })
            
            
            
            })
        .catch((error) => {
            console.log("Error getting friends: ", error);
        })
        .finally(() => {
            // setFriends(eligibleFriends);
            // setLoading(false);
        });
  }


  if (loading) {
    loadFriends();
  }


  return (
    <View
      style={{marginTop: '1%'}}
    > 
      <Pressable onPress={goBack}>
        <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Back </Text>
      </Pressable>
      <Pressable onPress={onBuddySelect}>
        <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Done </Text>
      </Pressable>
      <TextInput 
            style={[AppStyles.input]}
            onChangeText={(text) => updateSearch(text)}
            // value={search}
            placeholder="Search"
        />
        <View style={{ flexDirection: 'column'}}>
        { buddies.length > 0 && <FlatList 
            data={buddies}
            keyExtractor={(buddy) => buddy.id}
            renderItem={(buddy) => (
                <View style={{ marginLeft: 10, marginBottom: 5, flex: 1, flexDirection: 'row', borderRadius: 15, backgroundColor: '#413FEB', padding: 5, alignSelf: 'flex-start' }}>
                    <Image source={{ uri: buddy.item.image_url }} style={{ width: 25, height: 25, borderRadius: 25 }} />
                    <Text style={{ color: 'white', fontSize: 13, marginHorizontal: 5, alignSelf: 'center'}}>{buddy.item.display_name}</Text>
                </View>
                // <View
                //     style={{
                //         flexDirection: 'row',
                //         padding: 16,
                //         alignItems: 'center'
                //     }}>
                //     {/* <Image source={{ uri: buddy.image_url }} style={{ width: 25, height: 25, borderRadius: 25 }} /> */}
                //     <Text style={{ fontSize: 22 }}>
                //         {buddy.item.display_name}
                //     </Text>
                // </View>
            )}
        /> }
        </View>
        <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
            <View
            style={{
                flexDirection: 'row',
                padding: 16,
                alignItems: 'center'
            }}>
                { item.loading && <ActivityIndicator size="small" color="#00ff00" /> }
                { !item.loading && <Image source={{ uri: item.image_url }} style={{ width: 50, height: 50, borderRadius: 25 }} /> }
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => addBuddy(item)}>
                    <Text style={{ fontSize: 22 }}>
                        {item.display_name}
                    </Text>
                </TouchableOpacity>
                { !item.added_to_dive && <TouchableOpacity style={{flex: 3, alignItems: 'flex-end' }} onPress={() => addBuddy(item)}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Add Buddy</Text>
                </TouchableOpacity> }
                { item.added_to_dive && <TouchableOpacity style={{flex: 3, alignItems: 'flex-end' }} onPress={() => removeBuddy(item)}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Remove Buddy</Text>
                </TouchableOpacity> }                
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
});

export default AddBuddyModal;
