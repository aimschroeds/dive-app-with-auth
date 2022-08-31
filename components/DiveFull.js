import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View,} from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';

import { db, auth, storage } from '../firebase';
import get200ImageRef from '../helpers/get200ImageRef';
import { TableView, Section, Cell } from 'react-native-tableview-simple';
import AppStyles from '../styles/AppStyles';

import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import DiveShort from './DiveShort';

const DiveFull = ({...props}) => {
const inFocus = useIsFocused();
const [loading, setLoading] = useState(true);
const [dive, setDive] = useState(null);

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
    <View style={{flex: 1, flexDirection: 'column'}}>
      <DiveShort
        id={props.id}
        navigation={props.navigation}
        more={false}
        editable={true}
      />
      <TableView style={{marginTop: -30}}>
        <Section
            hideSeparator={true}
            hideSurroundingSeparators={true}
        >
            { dive && 
            <Cell
                cellStyle="Basic"
                contentContainerStyle={AppStyles.cellContainer}
                cellContentView={
                     <View style={{flexDirection: 'row'}}>
                        { dive.diveProfile.surfaceInterval && <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.diveProfile.surfaceInterval} mins</Text>
                            <Text style={AppStyles.cellSecondaryText}>Surface Interval</Text>
                        </View> }
                        <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.conditions.temperature.value} °C </Text>
                            <Text style={AppStyles.cellSecondaryText}>Temperature</Text>
                        </View>
                        <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.conditions.visibility.value} {dive.conditions.visibility.dimension} </Text>
                            <Text style={AppStyles.cellSecondaryText}>Visibility</Text>
                        </View>
                    </View>
                }
                hideSeparator={true}
            ></Cell> }
            { dive?.conditions && <Cell
                cellStyle="Basic"
                contentContainerStyle={{flexDirection: 'row', justifyContent: 'center'}}
                cellContentView={
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.trainingDive ? 'Training Dive' : 'Fun Dive'} </Text>
                        </View>
                        <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.conditions.saltwater ? 'Salt Water' : 'Fresh Water'} </Text>
                        </View>
                        <View style={[AppStyles.cell33View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            <Text style={AppStyles.cellPrimaryText}>{dive.conditions.entry} Entry</Text>
                        </View>
                    </View>
                }
                // detail={buddies}
                titleTextColor={'#413FEB'}
                titleTextStyle={AppStyles.cellTitleText}
                hideSeparator={true}
                onPress={() => setDiveBuddyModalVisible(true)}
            ></Cell> }
            { dive?.conditions && <Cell
                cellStyle="Basic"
                contentContainerStyle={AppStyles.cellContainer}
                cellContentView={
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                        <View style={[AppStyles.cell33View, {justifyContent: 'space-evenly', flexDirection: 'row'}]}>
                        <View style={{justifyContent: 'center', flexDirection: 'column'}}>
                            { dive.conditions.sky === 'Clear' &&
                                <Image source={require('../assets/sun.png')} style={AppStyles.diveIcon} />
                            }
                            { dive.conditions.sky === 'PartialClouds' &&
                                <Image source={require('../assets/partialClouds.png')} style={AppStyles.diveIcon} />
                            }
                            { dive.conditions.sky === 'Clouds' &&
                                <Image source={require('../assets/Clouds.png')} style={AppStyles.diveIcon}/>
                            }
                            { dive.conditions.sky === 'Rain' &&
                                <Image source={require('../assets/Rain.png')} style={AppStyles.diveIcon} />
                            }
                        </View>
                        <View style={[AppStyles.cell10View, {justifyContent: 'center', flexDirection: 'column'}]}>
                            { dive.conditions.waves === 'Surge' &&
                                <Image source={require('../assets/surge.png')} style={AppStyles.diveIcon} />
                            }
                            { dive.conditions.waves === 'Waves' &&
                                <Image source={require('../assets/waves.png')} style={AppStyles.diveIcon} />
                            }
                            { dive.conditions.waves === 'Chill' &&
                                <Image source={require('../assets/chill.png')} style={AppStyles.diveIcon} />
                            }
                            { dive.conditions.waves === 'Surf' &&
                                <Image source={require('../assets/surf.png')} style={AppStyles.diveIcon} />
                            }
                        </View>
                        </View>
                        { dive.buddies?.length > 0 && <View style={[AppStyles.cell66View, {justifyContent: 'center', flexDirection: 'row'}]}>
                            <View style={{ flexDirection: 'row'}}>
                            { dive.buddies?.length > 0 &&
                                dive.buddies.map((buddy, index) => <Image key={buddy.id} source={{ uri: buddy.image_url }} style={AppStyles.diveBuddies} /> )
                            }
                            </View>
                            <Text style={AppStyles.cellPrimaryText}>Dive Buddies </Text>
                        </View>
                    }
                    </View>
                }
                ></Cell>
            }
        </Section>
      </TableView>
    </View>
  )
}

export default DiveFull