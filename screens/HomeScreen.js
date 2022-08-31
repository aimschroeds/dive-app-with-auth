import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'

import { auth, db } from '../firebase';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';

import DiveShort from '../components/DiveShort';
 
/**
 * Home screen
 * @param {*} navigation 
 * @returns {JSX.Element}
 */

 const HomeScreen = ({ navigation }) => {
    const [dives, setDives] = useState([]);
    const userId = auth.currentUser.uid;
    const [friends, setFriends] = useState([auth.currentUser.uid]);
    const [loading, setLoading] = useState(true);
    const [lastViewed, setLastViewed] = useState(null);
    const [notifications, setNotifications] = useState({count: 0})

    // Show notifications button in header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
            <TouchableOpacity
                onPress={showNotifications}
                style={AppStyles.headerButton}
                >
                { notifications.count > 1 && <Icon name="notifications-button" height='20' width='20' color="#413FEB" /> }
                { notifications.count > 1 && <Text>{notifications.count}</Text> }
                { notifications.count == 0 && <Icon name="notifications-bell-button" height='20' width='20' color="#413FEB" /> }
            </TouchableOpacity>
            ),
        })
    }, [navigation])

    // Handle user hitting notifications button
    const showNotifications = () => {
        navigation.navigate('Notifications')
      }

  // Load user's dives
  useEffect(() => {
    
        const unsubscribe = db
        .collection('dives')
        .where('userId', 'in', friends)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) =>
            setDives(
            snapshot.docs.map((doc) => ({
                id: doc.id,
            }))
            )
        );
        return unsubscribe;    
    
  }, [loading]);

    // Reference to relationships of current user db in firebase
    var friendsRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships");

    /**
     * Load friends from friendsRef
     */
   let loadFriends = async () => {
    var getOptions = {
        source: 'default'
        };
    let eligibleFriends = [];
    friendsRef.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((friend) => {
                if (friend.data().status == "friends") {
                    eligibleFriends.push(friend.data().friendId)
                }
            })     
        })
        .catch((error) => {
            console.log("Error getting friends: ", error);
        })
        .finally(() => {
            setFriends({friends: [...friends, ...eligibleFriends]});
            setLoading(false);     
        }) 
    }
    // Reference to notifications in firebase db
    var notificationsRef = db.collection("notifications");
    // Reference to users in firebase db
    var usersRef = db.collection("users");

    // Get and/or set date and time for when user last viewed notifications 
    let lastViewedNotification = async () => {
        usersRef.doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) 
            {
                doc.data().last_viewed_notification ? setLastViewed(doc.data().last_viewed_notification) : setLastViewed(new Date())
            }
            else 
            {
                setLastViewed(new Date())
            }
        })
        .catch((error) => {
            console.log("lastViewedNotification:Error ", error);
        });
    }

    // Load notifications 
    let loadNotifications = async () => {
        lastViewedNotification()
        var getOptions = {
            source: 'default'
        };

        // Get notifications
        var notiRef = notificationsRef
        .where('receiver', "==", auth.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get(getOptions)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc.data().createdAt > lastViewed) {
                    setNotifications({count: notifications.count + 1})
                }
            })
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }

   return (
    <FlatList
        data={dives}
        renderItem={({item, index}) => (
            <DiveShort
              id={item.id}
              key={index}
              navigation={navigation}
              more={true}
              delete={false}
            />
        )}
        keyExtractor={item => item.id}
    />
     
   )
 }
 
 export default HomeScreen;