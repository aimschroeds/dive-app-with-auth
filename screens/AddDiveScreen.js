import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Pressable, RefreshControl, StyleSheet, SafeAreaView, ScrollView, Switch, Text, TextInput, View, TouchableOpacity  } from 'react-native'
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react';
import { db, auth } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import SearchDiveMaster from '../components/SearchDiveMaster';
import DiveMasterSelection from '../modals/DiveMasterSelection';
import AppStyles from '../styles/AppStyles';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore"; 

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

const AddDiveScreen = ( {navigation }) => {

    // const navigation = useNavigation()
    
    const cancelAddDive = () => {
        navigation.navigate('Home')
      }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
              <Text 
                onPress={cancelAddDive}
                style={styles.plusButtonText}>Cancel</Text>
            ),
        })
    }, [navigation])

    const sendVerificationEmail = () => {
        auth.currentUser.sendEmailVerification()
        .then(() => {
            setSuccessMessage('Verification email sent!')
        }).catch(error => {
            setErrorMessage(error.message)
        }
        )
    }

    const [dives, setDives] = useState([]);
    // const diveRef = firebase.firestore().collection('dives');
    const [diveSite, setDiveSite] = useState('');
    const [diveRegion, setDiveRegion] = useState('');
    const [diveStart, setDiveStart] = useState(new Date());
    const [diveEnd, setDiveEnd] = useState(new Date());
    const [diveCenter, setDiveCenter] = useState(null);
    const [diveMaster, setDiveMaster] = useState(null);
    const [surfaceInterval, setSurfaceInterval] = useState('');
    const [startPressure, setStartPressure] = useState('');
    const [endPressure, setEndPressure] = useState('');
    const [maxDepth, setMaxDepth] = useState('');
    const [diveCenterSearchModalVisible, setDiveCenterSearchModalVisible] = useState(false);
    const [diveMasterSearchModalVisible, setDiveMasterSearchModalVisible] = useState(false);
    const [userNotVerified, setUserNotVerified] = useState(!auth.currentUser.emailVerified);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    
    // https://reactnative.dev/docs/refreshcontrol
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      wait(2000).then(() => setRefreshing(false));
    }, []);

    const onChangeStart = (event, selectedTime) => {
      const currentSelectedTime = selectedTime;
      setDiveStart(currentSelectedTime);
    };

    const onChangeEnd = (event, selectedDate) => {
      const currentSelectedDate = selectedDate;
      setDiveEnd(currentSelectedDate);
    };
    
    let addDive = async () => {
      let dive = {
        diveSite: diveSite,
        diveRegion: diveRegion,
        diveStart: diveStart,
        diveEnd: diveEnd,
        diveCenter: diveCenter,
        diveMaster: diveMaster,
        surfaceInterval: surfaceInterval,
        startPressure: {value: Number(startPressure), dimension: 'bar'},
        endPressure: {value: Number(endPressure), dimension: 'bar'},
        maxDepth: {value: Number(maxDepth), dimension: 'meter'},
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      }
      db.collection("dives").add(dive)
      .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          setSuccessMessage('Dive added!')
          navigation.navigate('Home')
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
          setErrorMessage(error.message)
      });
    };

  return (
    <SafeAreaView style={{backgroundColor: 'white'}}>
      
        <ScrollView style={{height:"100%"}} 
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <KeyboardAvoidingView
            // style={AppStyles.loginContainer}
            behavior="padding"
            style={{marginHorizontal: 20}}
        >
        {userNotVerified && <Text style={AppStyles.errorMessage}>To Log A Dive, Please Verify Your Email</Text>
       }
        {userNotVerified && <TouchableOpacity style={AppStyles.loginButton} onPress={sendVerificationEmail}>
            <Text style={AppStyles.loginButtonText}>Send Verification Email</Text>
        </TouchableOpacity> }
        {successMessage && <Text style={AppStyles.successMessage}>{successMessage}</Text>}
        {errorMessage && <Text style={AppStyles.errorMessage}>{errorMessage}</Text>}
        <Text>Email: {auth.currentUser?.email}</Text>
        <Text>UUID: {auth.currentUser?.uid}</Text>
          <View style={AppStyles.container}>
            <TextInput
              style={styles.textInput}
              onChangeText={setDiveSite}
              value={diveSite}
              placeholder="Dive Site"
              placeholderTextColor={'white'}
            />
            <TextInput
              style={styles.textInput}
              onChangeText={setDiveRegion}
              value={diveRegion}
              placeholder="Region"
              placeholderTextColor={'white'}
            />
          </View>
          <View style={styles.diverProfile}>
            <View style={styles.diverProfileHeader}>
              <Image
                style={styles.smallIcon}
                source={require('../assets/coral.png')}
              />
              <Text style={styles.diverProfileText}>Dive Profile</Text>
              <Image
                style={styles.smallIcon}
                source={require('../assets/diver.png')}
              />
            </View>
            <Image
                style={styles.wave}
                source={require('../assets/wave-long.png')}
              />
            {/* Diver profile */}
            <View style={styles.diverProfileBody}>
              <View style={styles.diverProfileBodyContents}>
              {/* First row: Surface Interval */}
              <View style={[styles.diverProfileBodyRow, styles.leftAlignedRow]}>
                <Text style={styles.diverProfileBodyText}>Surface Interval: </Text>
                <TextInput 
                  style={styles.diverProfileBodyInput} 
                  onChangeText={setSurfaceInterval}
                  value={surfaceInterval}
                />
                <Text style={styles.diverProfileBodyMeasure}>minutes</Text>
              </View>

              {/* Second row: Start and End pressure */}
              <View style={styles.diverProfileBodyRow}>
                {/* First column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* Start pressure */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>Start: </Text>
                    <TextInput 
                      style={styles.diverProfileBodyInput} 
                      onChangeText={setStartPressure}
                      value={startPressure}
                      placeholder="200"
                    />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
                </View>
                {/* Second column */}
                <View style={[styles.diverProfileBodyColumn]}>
                  
                </View>
                {/* Third column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* End pressure */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>End: </Text>
                    <TextInput 
                      style={styles.diverProfileBodyInput} 
                      onChangeText={setEndPressure}
                      value={endPressure}
                      placeholder="50"
                    />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
        
                </View>
              </View>
                <View style={styles.diverProfileBodyRow}>
                  <Image
                    style={styles.diveProfileImage}
                    source={require('../assets/dive-profile.png')}
                  />
                </View>
                <View style={[styles.diverProfileBodyRow, styles.centerAlignedRow]}>
                    <Text style={styles.diverProfileBodyText}>Depth: </Text>
                    <TextInput 
                      style={styles.diverProfileBodyInput} 
                      onChangeText={setMaxDepth}
                      value={maxDepth}
                      placeholder="0"
                    />
                    <Text style={styles.diverProfileBodyMeasure}>m</Text>
                </View>
              </View>
            </View>
          </View>
          <TableView>
            <Section hideSeparator>
              <Cell
                  cellAccessoryView={<DateTimePicker 
                    testID="datePicker"
                    style={styles.datePicker}
                    maximumDate={new Date()} 
                    mode="datetime"
                    value={diveStart}
                    onChange={onChangeStart}
                  />}
                  title="Time In"
                  titleTextColor={'#413FEB'}
                  titleTextStyle={styles.cellTitleText}
                  hideSeparator={true}
                  cellStyle="RightDetail"
                >
              </Cell>
              <Cell
                  cellAccessoryView={<DateTimePicker 
                    testID="datePicker"
                    style={styles.datePicker}
                    maximumDate={new Date()} 
                    mode="datetime"
                    minimumDate={diveStart}
                    value={diveEnd}
                    onChange={onChangeEnd}
                  />}
                  title="Time Out"
                  titleTextColor={'#413FEB'}
                  titleTextStyle={styles.cellTitleText}
                  hideSeparator={true}
                  // cellStyle="RightDetail"
                >
              </Cell>
              <Cell
                cellStyle="RightDetail"
                accessory="DisclosureIndicator"
                title="Dive Center"
                detail={diveCenter}
                titleTextColor={'#413FEB'}
                titleTextStyle={styles.cellTitleText}
                hideSeparator={true}
                onPress={() => setDiveCenterSearchModalVisible(true)}
              />
              <Cell
                cellStyle="RightDetail"
                accessory="DisclosureIndicator"
                title="Dive Master"
                detail={diveMaster}
                titleTextColor={'#413FEB'}
                titleTextStyle={styles.cellTitleText}
                hideSeparator={true}
                onPress={() => setDiveMasterSearchModalVisible(true)}
              />
            </Section>
          </TableView>
          
          <View style={AppStyles.centeredView}>
          <Modal
            animationType="slide"
            // transparent={true}
            presentationStyle="pageSheet"
            visible={diveCenterSearchModalVisible}
            onRequestClose={() => {
              setDiveCenterSearchModalVisible(!diveCenterSearchModalVisible);
            }}>
            <View style={AppStyles.centeredView}>
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                enabled>
                <ScrollView
                  nestedScrollEnabled
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                  contentInsetAdjustmentBehavior="automatic"
                  contentContainerStyle={{ paddingBottom: 200 }}
                  style={AppStyles.scrollContainer}>
                  <View style={[AppStyles.container]}>
                    <View style={[AppStyles.searchBar, Platform.select({ ios: { zIndex: 98 } })]}>
                      <SearchDiveMaster/>
                    </View>
                    
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
                <Text style={AppStyles.modalText}>Hello World!</Text>
                <Pressable
                  style={[AppStyles.button, AppStyles.buttonClose]}
                  onPress={() => setDiveCenterSearchModalVisible(!diveCenterSearchModalVisible)}>
                  <Text style={AppStyles.textStyle}>Hide Modal</Text>
                </Pressable>
              </View>
            {/* </View> */}
          </Modal>
          <Modal
            animationType="slide"
            // transparent={true}
            presentationStyle="pageSheet"
            visible={diveMasterSearchModalVisible}
            onRequestClose={() => {
              setDiveMasterSearchModalVisible(!diveMasterSearchModalVisible);
            }}>
          <DiveMasterSelection 
            onClose={() => setDiveMasterSearchModalVisible(false)}
            onSelect={(diveMaster) => {setDiveMaster(diveMaster)}}
          />
          </Modal>
        </View>
        <TouchableOpacity 
          style={AppStyles.button} 
          onPress={addDive} 
          disable={userNotVerified ? true : false}>
          <Text style={AppStyles.buttonText}>Log Dive</Text>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
      
    </SafeAreaView>
    
    
  )
}

export default AddDiveScreen

const styles = StyleSheet.create({
  // centeredView: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 22,
  // },
  // scrollContainer: {
  //   flex: 1,
  // },
  searchBar: {
    // flex: 1,
    // alignItems: 'center',
    width: '95%',
  },
  // button: {
  //   borderRadius: 20,
  //   padding: 10,
  //   elevation: 2,
  // },
  // buttonOpen: {
  //   backgroundColor: '#F194FF',
  // },
  // buttonClose: {
  //   backgroundColor: '#2196F3',
  // },
  // textStyle: {
  //   color: 'white',
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  // },
  // modalText: {
  //   marginBottom: 15,
  //   textAlign: 'center',
  // },  
  plusButtonText: {
        color: '#00b5ec',
        paddingLeft: 10,
    },
    // container: {
    //     flex: 1,
    //     flexDirection: 'row',
    //     justifyContent: 'center',
    //     alignContent: 'space-between',
    //     marginTop: 30,
    // },
    textInput: {
      height: 30,
      marginVertical: 12,
      padding: 10,
      paddingHorizontal: 15,
      borderRadius: 15,
      backgroundColor: '#413FEB',
      color: 'white',
      width: '45%',
      textAlign: 'center',
      marginHorizontal: '3%',
    },

    dateInput: {
      height: 30,
      marginVertical: 12,
      padding: 10,
      // borderRadius: 15,
      // backgroundColor: '#413FEB',
      // textColor: 'white',
      width: '95%',
      marginHorizontal: '3%',
      // textAlign: 'left',
      alignContent: 'right',
      // justifyContent: 'center',
      alignItems: 'flex-end',
    },
    datePicker: {
      // margin:-2,
      // borderWidth: 1,
      width: '80%',
      // alignSelf: 'flex-end',
    },
    diverProfile: {
      marginVertical: 20,
      borderColor: '#DDDDDD',
      borderWidth: 1,
      borderRadius: 16,
      // marginTop: 30,
    },
    diverProfileHeader: {
      flexDirection: 'row',
      flex: 1,
      justifyContent: 'center',
      marginTop: 20,
    },
    diverProfileText: {
      fontSize: 16,
      color: '#413FEB',
      marginHorizontal: 10,
      fontFamily: 'Helvetica',
    },
    cellTitleText: {
      fontSize: 14,
      fontFamily: 'Helvetica',
      fontWeight: 'bold',
    },
    smallIcon: {
      width: 20,
      height: 20,
      paddingTop: 5,
    },
    wave: {
      marginTop: 20,
    },
    diverProfileBody: {
      backgroundColor: '#EBF6FA',
      marginTop: -15,
      paddingTop: 15,
      flex: 1, 
      
      // flexDirection: 'column',     
    },
    diverProfileBodyContents: {
      marginHorizontal: 30,
    },
    diverProfileBodyRow: {
      flexDirection: 'row',
      // justifyContent: 'space-between',
      // marginHorizontal: 30,
      marginBottom: 10,
      width: '100%',
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'space-around',
    },
    leftAlignedRow: {
      justifyContent: 'flex-start',
    },
    centerAlignedRow: {
      justifyContent: 'center',
      marginTop: -20,
    },
    leftAlignedText:{
      textAlign: 'left',
    },
    diverProfileBodyColumn: {
      flexDirection: 'column',
      flex: 1,
      width: '100%',
      alignItems: 'stretch',
    },
    diverProfileBodyText: {
      color: '#413FEB',
      fontWeight: 'bold',
    },
    diverProfileBodyInput: {
      color: '#626262',
      marginHorizontal: 5,
      borderBottomColor: '#626262',
      borderBottomWidth: 1,
      width: 40,
    },
    diveProfileImage: {
      alignSelf: 'stretch',
      marginTop: -10,
    },
})