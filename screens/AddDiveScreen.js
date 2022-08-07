import { ActivityIndicator, Image, StyleSheet, SafeAreaView, ScrollView, Switch, Text, TextInput, View  } from 'react-native'
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react';
import { firebase } from '../firebase';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddDiveScreen = () => {

    const navigation = useNavigation()
    
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

    const [dives, setDives] = useState([]);
    const diveRef = firebase.firestore().collection('dives');
    const [diveSite, setDiveSite] = useState('');
    const [diveRegion, setDiveRegion] = useState('');
    const [diveDate, setDiveDate] = useState(new Date());

    const onChangeDate = (event, selectedDate) => {
      const currentSelectedDate = selectedDate;
      setDiveDate(currentSelectedDate);
    };
  return (
    <SafeAreaView style={{backgroundColor: 'white'}}>
        <ScrollView style={{height:"100%",  marginHorizontal: 20}}>
          <View style={styles.container}>
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
            <View style={styles.dateInput}>
              <DateTimePicker 
                testID="datePicker"
                style={styles.datePicker}
                maximumDate={new Date()} 
                mode="date"
                value={diveDate}
                onChange={onChangeDate}
              />
            </View>
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
              <View style={styles.diverProfileBodyRow}>
                <Text style={styles.diverProfileBodyText}>Surface Interval:</Text>
                <TextInput style={styles.diverProfileBodyInput} />
                <Text style={styles.diverProfileBodyMeasure}>minutes</Text>
              </View>

              {/* Second row: Start and End pressure */}
              <View style={styles.diverProfileBodyRow}>
                {/* First column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* Start pressure */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>Start:</Text>
                    <TextInput style={styles.diverProfileBodyInput} />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
                  {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow, styles.horizontalTopLine, styles.clearRow]}>
                  </View>
                   {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow]}>
                  </View>
                </View>
                {/* Second column */}
                <View style={[styles.diverProfileBodyColumn]}>
                  {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow]}>
                    {/* <Text style={styles.diverProfileBodyText}>Depth:</Text>
                    <TextInput style={styles.diverProfileBodyInput} />
                    <Text style={styles.diverProfileBodyMeasure}>m</Text> */}
                  </View>
                  {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow, styles.horizontalBottomLine, styles.blankBlock, styles.clearRow, styles.verticalLine]}>
                    <Text style={styles.diverProfileBodyText}>Depth:</Text>
                    <TextInput style={styles.diverProfileBodyInput} />
                    <Text style={styles.diverProfileBodyMeasure}>m</Text>
                  </View>
                  {/* Depth */}
                  <View style={[styles.diverProfileBodyRow]}>
                    
                  </View>
                </View>
                {/* Third column */}
                <View style={styles.diverProfileBodyColumn}>
                  {/* End pressure */}
                  <View style={[styles.diverProfileBodyRow]}>
                    <Text style={styles.diverProfileBodyText}>End:</Text>
                    <TextInput style={styles.diverProfileBodyInput} />
                    <Text style={styles.diverProfileBodyMeasure}>bar</Text>
                  </View>
                  {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow, styles.horizontalTopLine, styles.clearRow]}>
                  </View>
                  {/* Blank block */}
                  <View style={[styles.diverProfileBodyRow]}>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AddDiveScreen

const styles = StyleSheet.create({
    plusButtonText: {
        color: '#00b5ec',
        paddingLeft: 10,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'space-between',
        marginTop: 30,
    },
    textInput: {
      height: 30,
      marginVertical: 12,
      padding: 10,
      paddingHorizontal: 15,
      borderRadius: 15,
      backgroundColor: '#413FEB',
      color: 'white',
      width: '30%',
      textAlign: 'center',
      marginRight: '5%',
    },
    dateInput: {
      height: 30,
      marginVertical: 12,
      // padding: 10,
      borderRadius: 15,
      backgroundColor: '#413FEB',
      textColor: 'white',
      width: '30%',
      alignContent: 'center',
    },
    datePicker: {
      margin:-2,
    },
    diverProfile: {
      marginTop: 20,
      borderColor: '#DDDDDD',
      borderWidth: 1,
      borderRadius: 16,
      marginTop: 30,
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
      marginBottom: 20,
      width: '100%',
      // borderWidth: 1,
      flex: 1,
      // borderColor: 'yellow',
    },
    diverProfileBodyColumn: {
      flexDirection: 'column',
      flex: 1,
      // borderWidth: 1,
      // borderColor: 'green',
      width: '100%',
      height: 100,
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
      width: '10%',
    },
    verticalLine: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'black',
      height: '100%',
      justifyContent: 'center',
      alignContent: 'center',
    },
    horizontalLine: {
      borderBottomWidth: 1,
      borderColor: 'black',
      borderTopWidth: 1,
    },
    horizontalBottomLine: {
      borderBottomWidth: 1,
      borderColor: 'black',
    },
    horizontalTopLine: {
      borderTopWidth: 1,
      borderColor: 'black',
    },
    blankBlock: {
      // height: 100,
    },
    clearRow: {
      height: 30,
      paddingVertical: 30,
    },
})