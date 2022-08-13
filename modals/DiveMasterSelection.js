
import { Button, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import React, { useState } from 'react';
import Icon from 'react-native-ico-material-design';
import Feather from 'react-native-vector-icons/Feather'
import AppStyles from '../styles/AppStyles';
import SearchDiveMaster from '../components/SearchDiveMaster';

const DiveMasterSelection = (({...props}) => {
const [diveMaster, setDiveMaster] = useState(null);
const [diveMasterClear, setDiveMasterClear] = useState(false);

const onDiveMasterSelect = (diveMaster) => {
    setDiveMaster(diveMaster);
    props.onSelect(diveMaster);
    console.log("onDiveMasterSelect", diveMaster);
}

const onDiveMasterClear = () => {
    props.onClose();
    setDiveMasterClear(true);
    
}

return (
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
            <SearchDiveMaster
                onClose={onDiveMasterClear}
                onSelect={(diveMaster) => onDiveMasterSelect(diveMaster)}
            />
        </View>
        
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
    <Text style={AppStyles.modalText}>Hello World!</Text>
    <Pressable
        style={[AppStyles.button, AppStyles.buttonClose]}
        onPress={() => setDiveMasterSearchModalVisible(!diveMasterSearchModalVisible)}>
        <Text style={AppStyles.textStyle}>Hide Modal</Text>
    </Pressable>
</View>)
})

export default DiveMasterSelection;