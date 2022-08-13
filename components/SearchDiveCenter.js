import React, { memo, useCallback, useRef, useState } from 'react'
import { Button, Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import Icon from 'react-native-ico-material-design';
import Feather from 'react-native-vector-icons/Feather'
Feather.loadFont()

const SearchDiveCenter = memo(() => {
  const [loading, setLoading] = useState(false)
  const [suggestionsList, setSuggestionsList] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const dropdownController = useRef(null)

  const searchRef = useRef(null)
    
  const getSuggestions = useCallback(async q => {
    console.log('getSuggestions', q)
    const filterToken = q.toLowerCase()
    if (typeof q !== 'string' || q.length < 3) {
      setSuggestionsList(null)
      return
    }
    setLoading(true)
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    const items = await response.json()
    const suggestions = items
      .filter(item => item.title.toLowerCase().includes(filterToken))
      .map(item => ({
        id: item.id,
        title: item.title,
      }))
    setSuggestionsList(suggestions)
    setLoading(false)
  }, [])

  const onClearPress = useCallback(() => {
    setSuggestionsList(null)
  }, [])

  const onOpenSuggestionsList = useCallback(isOpened => {}, [])

  return (
    <>
      <AutocompleteDropdown
        dataSet={suggestionsList}
        closeOnBlur={false}
        useFilter={false}
        clearOnFocus={false}
        controller={controller => {
            dropdownController.current = controller
          }}
        textInputProps={{
          placeholder: 'Search Name of Dive Center',
        }}
        onSelectItem={setSelectedItem}
        loading={loading}
        onChangeText={getSuggestions}
        suggestionsListTextStyle={{
          color: '#8f3c96',
        }}
        EmptyResultComponent={<Text style={{ padding: 10, fontSize: 15 }}>Oops ¯\_(ツ)_/¯</Text>}
      />
      { selectedItem && <View style={{ flex: 1, flexDirection: 'row', borderRadius: 15, backgroundColor: '#413FEB', padding: 10, marginTop: 10, alignSelf: 'flex-start' }}>
        <Text style={{ color: 'white', fontSize: 13}}>{selectedItem.title}</Text>
        <TouchableOpacity style={{padding: 2, marginLeft: 3, justifyContent: 'center'}} onPress={() => dropdownController.current.clear()}>
            <Icon name='clear-button' height='13' color='white' />
        </TouchableOpacity>
      </View> }
    </>
  )
});


export default SearchDiveCenter;
