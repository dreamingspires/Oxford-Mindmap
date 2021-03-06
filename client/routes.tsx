import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Text, Button, Icon } from 'react-native-elements'

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { HeaderBackButton } from '@react-navigation/stack';


import { MapScreen } from './screens/Map'
import { StoryListScreen } from './screens/StoryList'
import { ModalScreen } from './screens/Modal'
import { SettingsScreen } from './screens/Settings'
import { OpenFormScreen } from './screens/OpenForm'


const screens = {
    Map: {
        screen: MapScreen,
        label: 'Explore Map',
        icon: () => <Icon name="map" />
    },
    StoryList: {
        screen: StoryListScreen,
        label: 'Unlocked Stories',
        icon: () => <Icon name="list" />
    },
    FormButton: {
        screen: OpenFormScreen,
        label: 'Submit Own Story',
        icon: () => <Icon name="send" />
    },
}

// const Drawer = createDrawerNavigator();
// const DrawerNavigator = () => {
//     return (
//         <Drawer.Navigator
//             drawerType="front">
//             {Object.entries(screens).map(function([k, v]) {
//                 return (
//                     <Drawer.Screen
//                         name={k}
//                         key={k}
//                         component={v.screen}
//                         options={{ drawerLabel: v.label }}
//                     />
//                 )
//             })}
//         </Drawer.Navigator>
//     )
// }

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
    return (
        <Tab.Navigator backBehavior='initialRoute'>
            {Object.entries(screens).map(function([k, v]) {
                return (
                    <Tab.Screen
                        name={k}
                        key={k}
                        component={v.screen}
                        options={{ tabBarLabel: v.label, tabBarIcon: v.icon }}
                    />
                )
            })}
        </Tab.Navigator>
    )
}

const Stack = createStackNavigator();
export const RootNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Tabs"
            mode="card"
            headerMode="screen">
            <Stack.Screen name="Tabs" component={TabNavigator}
                options={({ navigation }) => ({
                    title: "Oxford MindMap",
                    headerLeft: () => <Image
                        style={{ marginLeft: 10, width: 50, height: 50 }}
                        source={require('./assets/brain_transparent.png')}
                        resizeMode='contain'
                    />,
                    headerRight: () => (
                        <Button
                            icon={{
                                name: "settings",
                            }}
                            TouchableComponent={TouchableOpacity}
                            type='clear'
                            onPress={() => navigation.navigate("Settings")}
                        />
                    )
                })} />
            <Stack.Screen name="Modal" component={ModalScreen}
                options={({ route }) => ({
                    title: route.params?.story?.title || "No Title",
                })} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </ Stack.Navigator>
    )
}
