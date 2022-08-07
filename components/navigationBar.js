import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { CreateBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-ico-material-design';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import navData from '../data/navigation.json';

export function NavigationBar({ navigation }) {
    const styles = StyleSheet.create({
        navContainer: {
            // absolute: 'absolute',
            // alignItems: 'center',
            marginBottom: 10,
            // paddingLeft: 30,
            paddingTop: 100,
            bottom: 0,
            left: 0,
            right: 0,
            flex: 1,

        },
        navBar: {
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            // alignContent: 'center',
        },
        menuItemText: {
            fontSize: 14,
            fontWeight: "300",
            color: "black",
            paddingTop: 10,
            // alignContent: 'center',

        },
        menuItems: {
            padding: 10,
            alignItems: 'center',
        }
    });
    let nav_items = navData.navigation;

    return (
        
        <View style={styles.navContainer}>
            <SafeAreaView style={styles.navBar}>
                {nav_items.map((element) => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate(element.page)}
                    style={styles.menuItems}
                >
                    <Icon name={element.icon} height='30' width='30' color="#413FEB" />
                    <Text style={styles.menuItemText}>{element.title}</Text>
                </TouchableOpacity>
                ))}
            </SafeAreaView>
        </View>
    );
}

