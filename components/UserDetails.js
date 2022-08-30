import { Image, View, Text } from 'react-native'
import React from 'react'
import { TableView, Section, Cell } from 'react-native-tableview-simple';

import AppStyles from '../styles/AppStyles';
import Icon from 'react-native-ico-material-design';

const UserDetails = ({...props}) => {
    const displayName = props.displayName;
    const profilePic = props.profilePic;

  return (
    <TableView>
        <Section
            hideSeparator={true}
            hideSurroundingSeparators={true}
        >
          <Cell
            cellStyle="Basic"
            contentContainerStyle={AppStyles.cellMinimalContainer}
            cellContentView={
                <View style={[AppStyles.section]}>
                      { profilePic &&  
                          <Image source={{uri: profilePic,}} style={[AppStyles.profilePic]}/> 
                      }
                      {/* If no user profile picture, show generic avatar icon */}
                      { !profilePic &&  
                          <Icon name='round-account-button-with-user-inside' width='100' height='100' color='gray' /> 
                      }    
                    <Text style={[AppStyles.profileText, {marginLeft: 10}]}>{displayName}</Text>  
                </View>
                }
            hideSeparator={true}
          ></Cell>
        </Section>
      </TableView>
  )
}

export default UserDetails