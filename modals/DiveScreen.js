import { StyleSheet, Text, View } from 'react-native'
import React, { useLayoutEffect } from 'react'
import DiveFull from '../components/DiveFull'

import AppStyles from '../styles/AppStyles'

const DiveScreen = ( { route, navigation }) => {

  // Add back button to header
  useLayoutEffect(() => {
    const unsubscribe = navigation.setOptions({
        headerLeft: () => (
            <Text 
            onPress={()=>navigation.goBack()}
            style={AppStyles.plusButtonText}>Back</Text>
            ),
        })
    return unsubscribe
    }, [navigation])
  return (
    <DiveFull
      id={route.params.id}
      navigation={navigation}
    />
  )
}

export default DiveScreen

