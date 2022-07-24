import { ActivityIndicator, Image, StyleSheet, SafeAreaView, ScrollView, Switch, Text, TextInput, View  } from 'react-native'
import { Cell, Section, TableView } from 'react-native-tableview-simple';
import { useNavigation } from '@react-navigation/native'
import React from 'react'

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

  return (
    <SafeAreaView>
        <ScrollView style={{height:"100%"}}>
            <TableView>
              <Section>
              <Cell 
                cellStyle="Basic"
                title="Basic cell"
              />
              <Cell 
                cellStyle="RightDetail"
                title="Cell with right details"
                detail="Right detail"
              />
              <Cell 
                cellStyle="LeftDetail"
                title="Cell with left details"
                detail="Left detail"
              />
              </Section>
              <Section 
                header="Cells with accessories"
              >
              <Cell 
                cellStyle="Basic"
                title="Basic cell with pressable"
                accessory="DisclosureIndicator"
                onPress={() => alert("test!")}
              />
              <Cell 
                cellStyle="RightDetail"
                title="Cell with right detail"
                detail="Detail"
                accessory="DetailDisclosure"
              />
              <Cell 
                cellStyle="Subtitle"
                title="Basic cell"
                accessory="Checkmark"
                detail="with subtitle! And checkmark"
              />              
              </Section>
              <Section
                header="Cells with other elements"
              >
              <Cell
                title="Cell with image"
                image={
                  <Image
                    source={require('../assets/logo.png')}
                    style={{ borderRadius: 5}}
                  />
                }
              >
              </Cell>
              <Cell
                cellStyle='RightDetail'
                detail="Detail"
                rightDetailColor="red"
                title="Cell with custom detail color"
              >
              </Cell>
              <Cell
                cellAccessoryView={<Switch />}
                contentContainerStyle={{ paddingVertical: 4 }}
                title="Cell with a switch"
              >
              </Cell>
              <Cell
                cellAccessoryView={<ActivityIndicator />}
                title="Cell with an activity indicator"
              >
              </Cell>
              <Cell
                cellContentView={
                  <TextInput 
                    style={{ fontSize: 16, flex: 1 }}
                    placeholder="A text input cell"
                  />
                }
              >
              </Cell>
              </Section>
              <Section
                header="Custom cells"
              >
                <Cell
                  contentContainerStyle={{ alignItems: 'center', height: 60, backgroundColor:"lightblue" }}
                  cellContentView={
                    <Text style={{ flex: 1, fontSize: 16, textAlign: 'center', color:"darkblue", fontWeight:"bold" }}>
                      Custom height, and content view
                    </Text>
                  }
                >
                </Cell>
              </Section>
            </TableView>
        </ScrollView>
    </SafeAreaView>
  )
}

export default AddDiveScreen

const styles = StyleSheet.create({
    plusButtonText: {
        color: '#00b5ec',
    },
})