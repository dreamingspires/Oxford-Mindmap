import React from 'react';
import { Text, Button, View } from 'react-native'

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { HeaderBackButton } from '@react-navigation/stack';


import { MapScreen } from './screens/Map'
import { StoryListScreen } from './screens/StoryList'
import { ModalScreen } from './screens/Modal'


const screens = {
    Map: {
        screen: MapScreen,
        label: 'Explore Map'
    },
    StoryList: {
        screen: StoryListScreen,
        label: 'Explore Stories'
    },
}

const Drawer = createDrawerNavigator();
const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerType="front">
            {Object.entries(screens).map(function([k, v]) {
                return (
                    <Drawer.Screen
                        name={k}
                        key={k}
                        component={v.screen}
                        options={{ drawerLabel: v.label }}
                    />
                )
            })}
        </Drawer.Navigator>
    )
}

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
    return (
        <Tab.Navigator>
            {Object.entries(screens).map(function([k, v]) {
                return (
                    <Tab.Screen
                        name={k}
                        key={k}
                        component={v.screen}
                        options={{ tabBarLabel: v.label }}
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
            <Stack.Screen name="Tabs" component={TabNavigator} options={{
                headerShown: true
            }} />
            <Stack.Screen name="Modal" component={ModalScreen} />
        </ Stack.Navigator>
    )
}
