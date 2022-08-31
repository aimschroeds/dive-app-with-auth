import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DiveFull from '../components/DiveFull'

const DiveScreen = ( { route, navigation }) => {
  return (
    <DiveFull
      id={route.params.id}
      navigation={navigation}
    />
  )
}

export default DiveScreen

