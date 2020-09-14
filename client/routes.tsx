import React from 'react';
import { View, TouchableOpacity } from 'react-native'
import { Text, Button, Icon } from 'react-native-elements'

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { HeaderBackButton } from '@react-navigation/stack';


import { MapScreen } from './screens/Map'
import { StoryListScreen } from './screens/StoryList'
import { ModalScreen } from './screens/Modal'
import { SettingsScreen } from './screens/Settings'


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
                    headerRight: () => (
                        // <TouchableOpacity
                        //     onPress={() => navigation.navigate("Settings")}
                        // >
                        //     <View style={{ justifyContent: 'center', alignContent: 'center', paddingRight: 15 }}>
                        //         <Icon
                        //             // size={30}
                        //             name="settings"
                        //         />
                        //     </View>
                        // </TouchableOpacity>
                        <Button
                            icon={{
                                name: "settings",
                                // color: "black"
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
