import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View,} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';

import { db, auth, storage } from '../firebase';
import get200ImageRef from '../helpers/get200ImageRef';
import { TableView, Section, Cell } from 'react-native-tableview-simple';
import AppStyles from '../styles/AppStyles';
import Icon from 'react-native-ico-material-design';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

const DiveShort = ({...props}) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const [dive, setDive] = useState(null);
    const [diveDate, setDiveDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [diveTime, setDiveTime] = useState(null);
    const [userProfilePicture, setUserProfilePicture] = useState(null);
    const [diveSite, setDiveSite] = useState(null);
    const inFocus = useIsFocused();
    const authUser = String(auth.currentUser.uid);
    const navigation = props.navigation;

    // console.log('loading,', loading)
    
    useEffect(() => {
        setLoading(true);
    }, [inFocus])

    const viewFriend = () => {
        if(dive.userId !== authUser)
        {
            navigation.navigate('Friend', {id: dive.userId})
        }
    }

    if (loading) {
        // Get dive data
        // console.log('props,', props.id)
        var diveRef = db.collection("dives").doc(props.id);
        // Set dive
        diveRef.get().then((diveDoc) => {
            if (diveDoc.exists) {
                setDive(diveDoc.data());
                // Set date
                setDiveDate(diveDoc.data().diveProfile.diveStart.toDate());
                // Set time
                setDiveTime(Math.floor((diveDoc.data().diveProfile.diveEnd.toDate() - diveDoc.data().diveProfile.diveStart.toDate()) / 1000 / 60));
                // Get user data
                var userRef = db.collection("users").doc(diveDoc.data().userId);
                // Set user
                userRef.get().then((userDoc) => {
                    if (userDoc.exists) {
                        setUser(userDoc.data());
                        // Get user profile picture
                        var profilePictureRef = storage.ref().child(userDoc.id + '/' + userDoc.data().image);
                        profilePictureRef.getDownloadURL().then((url) => {
                            // console.log(url);
                            setUserProfilePicture(url);
                        }).catch((error) => {
                            console.log('getimg', error);
                        });
                    } else {
                        console.log("Userdata: No such document!");
                    }
                }).catch((error) => {
                    console.log("userdata: Error getting document:", error);
                });
                if (diveDoc.data().diveSite) {
                    // Get dive site data
                    var diveSiteRef = db.collection("locations").doc(diveDoc.data().diveSite);
                    // Set dive site
                    diveSiteRef.get().then((diveSiteDoc) => {
                        if (diveSiteDoc.exists) {
                            setDiveSite(diveSiteDoc.data());
                        } else {
                            console.log("Divesite: No such document!", diveSiteDoc.id);
                        }
                    }).catch((error) => {
                        console.log("Dive site: Error getting document:", error);
                    });
                }
            }
            else {
                setDive('none')
            }
        })
        .catch((error) => {
            console.log("Dive data: Error getting document:", error);
        });
        setLoading(false);  
    }

    return (
        <View>
            <TableView>
                <Section
                    hideSeparator={true}
                    hideSurroundingSeparators={true}
                >
                <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                        // <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}} onPress={viewFriend}>
                            <View style={[AppStyles.cell25View,{justifyContent: 'flex-start'}]}>
                                    { !loading && userProfilePicture ? <Image source={{uri: userProfilePicture,}} style={dive.userId === authUser ? AppStyles.profilePicSmallBorder : AppStyles.profilePicSmall}/> :
                                    <ActivityIndicator size="large" color="#0000ff" />}
                                    <Text style={AppStyles.cellPrimaryText}>{user ? user.display_name : 'Loading...'}</Text>
                                    
                            </View>
                            <View style={[AppStyles.cell70View, {justifyContent: 'center', flexDirection: 'column', alignItems: 'flex-end'}]}>
                                { diveSite && <Text style={AppStyles.cellSecondaryText}>{diveSite.location.name}, {diveSite.location.region}, {diveSite.location.isoCountryCode}</Text>}
                                { diveDate && <Text style={AppStyles.cellMetaText}>{months[diveDate.getMonth()-1]} {diveDate.getDate()}, {diveDate.getFullYear()} at {diveDate.getHours()}:{diveDate.getMinutes()}</Text>}
                            </View>
                            { props.more &&
                                <TouchableOpacity style={[AppStyles.cell5View, {flexDirection: 'row', justifyContent: 'flex-end'}]} onPress={() => navigation.navigate('Dive', {id: props.id})}>
                                    <Icon name="three-dots-more-indicator" size={20} color="#0000ff" />
                                </TouchableOpacity>
                            }
                            { props.editable && authUser === dive.userId &&
                                <TouchableOpacity style={[AppStyles.cell5View, {flexDirection: 'row', justifyContent: 'flex-end'}]} onPress={() => navigation.navigate('Dive-Edit', {id: props.id})}>
                                    <Icon name="create-new-pencil-button" size={20} color="#0000ff" />
                                </TouchableOpacity>
                            }
                        </View>
                      }
                      hideSeparator={true}
                    ></Cell>
                    <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={
                          <View style={{flexDirection: 'row'}}>
                                { diveSite && <Text style={[AppStyles.cellDiveTitleText]}>{diveSite.name}</Text>}
                          </View>
                      }
                      hideSeparator={true}
                    ></Cell>
                    <Cell
                      cellStyle="Basic"
                      contentContainerStyle={AppStyles.cellContainer}
                      cellContentView={ dive?.diveProfile &&
                          <View style={{flexDirection: 'row'}}>
                                <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                                    <Text style={AppStyles.cellPrimaryText}>{dive.diveProfile.maxDepth.value} {dive.diveProfile.maxDepth.dimension}</Text>
                                    <Text style={AppStyles.cellSecondaryText}>Max Depth</Text>
                                </View>
                                <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                                    <Text style={AppStyles.cellPrimaryText}>{diveTime} mins</Text>
                                    <Text style={AppStyles.cellSecondaryText}>Bottom Time</Text>
                                </View>
                                <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                                    <Text style={AppStyles.cellPrimaryText}>{dive.diveProfile.startPressure.value-dive.diveProfile.endPressure.value} {dive.diveProfile.startPressure.dimension}</Text>
                                    <Text style={AppStyles.cellSecondaryText}>Air</Text>
                                </View>
                          </View>
                      }
                      hideSeparator={true}
                    ></Cell>
                    
                    <Cell
                      cellStyle="Basic"
                      contentContainerStyle={{ marginBottom: 20}}
                      cellContentView={ diveSite &&
                          <ScrollView horizontal bounces>
                                <MapView
                                    style={dive.images ? AppStyles.feedMap : AppStyles.feedMapNoImages}
                                    region={{
                                    latitude: diveSite.latitude,
                                    longitude: diveSite.longitude,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                    }}
                                >
                                    {/* Pin showing dive location */}
                                    <Marker
                                        key={diveSite.id}
                                        coordinate={{ latitude: diveSite.latitude, longitude: diveSite.longitude }}
                                        title={diveSite.name}
                                    />
                                </MapView>
                                { dive.images && dive.images.map((image, index) => 
                                    <Image key={index} source={{ uri: image }} style={{ width: 200, height: 200, marginHorizontal: 10, }} />
                                ) }
                          </ScrollView>
                      }
                      hideSeparator={true}
                    ></Cell>
                </Section>
            </TableView>
        </View>
    )
}

export default DiveShort