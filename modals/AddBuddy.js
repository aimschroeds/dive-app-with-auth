import { ActivityIndicator, FlatList, Image, 
          Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { db, auth, storage } from '../firebase';
import AppStyles from '../styles/AppStyles';
import { useIsFocused } from '@react-navigation/native';

/**
 * Modal enabling user to add buddies to a dive
 * @param {*} navigation 
 * @param {*} props
 * @returns {JSX.Element}
 */

const AddBuddyModal =  (({ navigation, ...props }) => {
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [friends, setFriends] = useState([])
    const [buddies, setBuddies] = useState([])
    const [searchError, setSearchError] = useState(null)
    const inFocus = useIsFocused();

    // When user returns to this screen, reload data
    useEffect(() => {
    if (props.selectedBuddies?.length > 0 && loading) {
        console.log('selected buddies', props.selectedBuddies)
        setLoading(false);
        props.selectedBuddies.forEach(buddy => {
            console.log('buddy', buddy)
            addBuddy(buddy);
        })       
    }
    }, [inFocus])


    // Return user to previous screen
    const goBack = () => {
    props.onClose();
    }


    // Pass selected buddies to previous screen
    const onBuddySelect = () => {
    props.onSelect(buddies);
    goBack();
    }


    // Add friend to buddies
    const addBuddy = (bud) => {
    setBuddies(buddies => [...buddies, bud]);
    console.log('buddy', bud) 
    friendAddedAsBuddy(bud);
    }

    
    // Update friend data to reflect as 'added to dive'
    const friendAddedAsBuddy = (bud) => {
        console.log('friendAddedAsBuddy', bud)
        console.log(friends ? "friends" : "no friends")
        const updatedFriends = friends.map(friend => {
            console.log('friend', friend)
            if (friend.id === bud.id) {
                
                return { ...friend, added_to_dive: true };
            }
            console.log('friend', friend)
            return friend;
        });
        setFriends(updatedFriends); 
    }


    // Remove friend from buddies
    const removeBuddy = (bud) => {
        setBuddies(current =>
            current.filter(buddy => {
            return buddy.id !== bud.id;
            }),
        );
        // Update friend data to no longer reflect as 'added_to_dive'
        const updatedFriends = friends.map(friend => {
            if (friend.id === bud.id) {
                return { ...friend, added_to_dive: false };
            }
            return friend;
        });
        setFriends(updatedFriends);
    }

    // Reference to relationships of current user db in firebase
    var friendsRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships");

    
    /**
     * Term searched by user set as search
     * @param {*} search
     */
    const updateSearch = (search) => {
        setSearch(search)
        setLoading(true)
    }


    /**
     * Load friends data from friendsRef
     */
    let loadFriends = async () => {
        var getOptions = {
            source: 'default'
            };
        friendsRef.get()
            .then((querySnapshot) => {
                let eligibleFriends = []
                querySnapshot.forEach((friend) => {
                    db.collection("users").doc(friend.id).get()
                    .then((user) => {
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
        {/* Header menu buttons */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            {/* Back button */}
            <Pressable onPress={goBack}>
                <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Back </Text>
            </Pressable>
            {/* Done button */}
            <Pressable onPress={onBuddySelect}>
                <Text style={[AppStyles.plusButtonText, AppStyles.marginVert]}> Done </Text>
            </Pressable>
        </View>
        {/* Search bar */}
        <TextInput 
            style={[AppStyles.input]}
            onChangeText={(text) => updateSearch(text)}
            // value={search}
            placeholder="Search"
        />
        {/* Selected buddy tags */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', borderWidth: 1, }}>
            { buddies.length > 0 && <FlatList 
                data={buddies}
                keyExtractor={(buddy) => buddy.id}
                renderItem={(buddy) => (
                    <View style={{ marginLeft: 10, marginBottom: 5, flex: 1, flexDirection: 'row', borderRadius: 15, borderColor: '#413FEB', borderWidth: 2, padding: 2, alignSelf: 'flex-start' }}>
                    {/* <View style={{ marginLeft: 10, marginBottom: 5, flex: 1, flexDirection: 'row', borderRadius: 15, borderColor: '#413FEB', borderWidth: 2, padding: 2, justifyContent: 'flex-start'}}> */}
                        <Image source={{ uri: buddy.item.image_url }} style={{ width: 25, height: 25, borderRadius: 25 }} />
                        <Text style={{ fontSize: 13, marginHorizontal: 5, alignSelf: 'center'}}>{buddy.item.display_name}</Text>
                    </View>
                )}
            /> }
        </View>
        {/* Friends list */}
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
                {/* TO DO: Refactor entire row contents into single entity */}
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => addBuddy(item)}>
                    <Text style={{ fontSize: 22 }}>
                        {item.display_name}
                    </Text>
                </TouchableOpacity>
                {/* Show add buddy button if friend not set as a buddy */}
                { !item.added_to_dive && <TouchableOpacity style={{flex: 3, alignItems: 'flex-end' }} onPress={() => addBuddy(item)}>
                    <Text style={{ fontSize: 12, borderWidth: 1, borderColor: '#CED0CE', padding: 10 }}>Add Buddy</Text>
                </TouchableOpacity> }
                {/* Show remove buddy button if friend is set as a buddy */}
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
