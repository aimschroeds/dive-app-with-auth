import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { CreateBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-ico-material-design';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import navData from '../data/navigation.json';

export function NavigationBar({ navigation }) {
    const styles = StyleSheet.create({
        navContainer: {
            absolute: 'absolute',
            alignItems: 'center',
            marginBottom: 10,
            paddingLeft: 30,
            paddingTop: 100,
        },
        navBar: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
            // alignItems: 'center',
        },
        menuItemText: {
            fontSize: 18,
            fontWeight: "300",
            color: "grey",
            // alignSelf: 'center',

        },
        icons: {
            padding: 10,
        }
    });
    let nav_items = navData.navigation;
    console.log(nav_items);
    return (
        
        <View style={styles.navContainer}>
            <SafeAreaView style={styles.navBar}>
                {nav_items.map((element) => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate(element.page)}
                    style={styles.icons}
                >
                    <Icon name={element.icon} height='40' width='40' color="grey" />
                    <Text style={styles.menuItemText}>{element.title}</Text>
                </TouchableOpacity>
                ))}
            </SafeAreaView>
        </View>
    );
}

