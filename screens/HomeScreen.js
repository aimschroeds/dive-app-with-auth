import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useLayoutEffect, useState, useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native';

import { auth, db } from '../firebase';

import Icon from 'react-native-ico-material-design';
import AppStyles from '../styles/AppStyles';

import DiveShort from '../components/DiveShort';
 
// Configure wait to prevent reloading page too often
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}


/**
 * Home screen
 * @param {*} navigation 
 * @returns {JSX.Element}
 */


 const HomeScreen = ({ navigation }) => {
    const [dives, setDives] = useState([]);
    // const userId = auth.currentUser.uid;
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(true);
    const [loading, setLoading] = useState(true);
    const [lastViewed, setLastViewed] = useState(null);
    const [notifications, setNotifications] = useState({count: 0})
    // Constants managing state of screen
    const [refreshing, setRefreshing] = useState(false);
    const inFocus = useIsFocused();
    // TODO Hou ou foto
    // Adding image spinner wrong position

    useEffect(() => {
      const subscriber = auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('user logged in', user.uid)
            setFriends([user.uid]);
        }
        else 
        {
            navigation.navigate('Login');
        }
      });
      return subscriber; // unsubscribe on unmount
    }, []);

    // Show notifications button in header
    useLayoutEffect(() => {
        const unsubscribe = navigation.setOptions({
            headerRight: () => (
            <TouchableOpacity
                onPress={showNotifications}
                style={AppStyles.headerButton}
                >
                { notifications.count > 1 && <Icon name="notifications-button" height='20' width='20' color="#413FEB" /> }
                {/* { notifications.count > 1 && <Text style={{backgroundColor: '#413FEB', color: 'white'}}>{notifications.count}</Text> } */}
                { notifications.count == 0 && <Icon name="notifications-bell-button" height='20' width='20' color="#413FEB" /> }
            </TouchableOpacity>
            ),
        })
        return unsubscribe;
    }, [navigation])

    // Handle user hitting notifications button
    const showNotifications = () => {
        navigation.navigate('Notifications')
      }

    // https://reactnative.dev/docs/refreshcontrol
    // Enables user to be able to reload screen every 2000 ms
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setLoading(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);

  // Load user's dives
  useEffect(() => {
    if (friends.length > 0)
    {
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
    }
  }, [friends]);

  // Load notification count
  useEffect(() => {
    loadFriends();
    setNotifications({count: 0})
    lastViewedNotification();
}, [loading, refreshing, inFocus]);

useEffect(() => {
    loadNotifications();
}, [lastViewed]);

    
    /**
     * Load friends from friendsRef
     */
    let loadFriends = async () => {
        // Reference to relationships of current user db in firebase
    var friendsRef = db.collection("friends").doc(auth.currentUser.uid).collection("relationships");

        setLoadingFriends(true);
        var getOptions = {
            source: 'default'
            };
        friendsRef.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((friend) => {
                    console.log(friend.id, " => ", friend.data().status);
                    if (friend.data().status == "friends") {
                        setFriends(friends => [...friends, friend.id]);
                    }
                })     
            })
            .catch((error) => {
                console.log("Error getting friends: ", error);
            })
            .finally(() => {
                setLoading(false);   
                setLoadingFriends(false);  
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
                setLastViewed(doc.data().last_viewed_notification)
            }
        })
        .catch((error) => {
            console.log("lastViewedNotification:Error ", error);
        });
    }

    // Load notifications 
    let loadNotifications = async () => {
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
                console.log(doc.data().createdAt.toDate())
                if ((doc.data().createdAt.toDate()) < (lastViewed.toDate())) {
                    setNotifications({count: notifications.count + 1})
                }
            })
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }

   return (
    <View>
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
        onRefresh={onRefresh}
        refreshing={refreshing}
    />
       { dives.length == 0 && <View style={[AppStyles.homeContainer]}>
             <Image source={require('../assets/1.png')} style={{width: 200, height: 200, resizeMode: 'contain'}} />
             <Text style={[AppStyles.homeWelcomeText]}>Welcome to Octos Log Book</Text>
             <TouchableOpacity
                            onPress={() => navigation.navigate('Add Dive')}
                            style={[AppStyles.buttonBlue, AppStyles.buttonBlueLarge]}
                        >
                            <Text style={AppStyles.buttonText}>Log A Dive</Text>
                        </TouchableOpacity>
        </View> }
    </View>
   )
 }
 
 export default HomeScreen;