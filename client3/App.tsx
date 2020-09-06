import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from 'react-native-appearance';
import { ThemeProvider } from 'react-native-elements'

import { StoriesContext, StoryFetchStatus } from './contexts'

import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './routes'

import Constants from "expo-constants"

let apiUrl = Constants.manifest.extra.api_url

function reformatData(json: Object): Object[] {
    return Object.entries(json).map(function([k, v]) { return { ...v, id: k, url: apiUrl } })
}

const theme = {};

export default function App() {

    const [fetchStatus, setFetchStatus] = useState(StoryFetchStatus.InProgress);
    const [fetchNeeded, setFetchNeeded] = useState(true);
    const [storyData, setStoryData] = useState(reformatData({}));

    const storyContext = {
        storyData: storyData,
        fetchStatus: fetchStatus,
        refresh: () => setFetchNeeded(true)
    }

    useEffect(() => {
        if (fetchNeeded) {
            setFetchNeeded(false)
            setFetchStatus(StoryFetchStatus.InProgress);
            fetch(apiUrl + '/api/get_stories')
                .then((response) => response.json())
                .then((json) => setStoryData(reformatData(json)))
                .then(() => setFetchStatus(StoryFetchStatus.Done))
                .catch((error) => { setFetchStatus(StoryFetchStatus.Failed); })
        }
    }, [fetchNeeded]);

    // const colorScheme = useColorScheme();
    const colorScheme = 'light'
    console.log(colorScheme)

    return (
        <ThemeProvider theme={theme} useDark={colorScheme === 'dark'}>
            <StoriesContext.Provider value={storyContext}>
                <NavigationContainer>
                    <StatusBar style="auto" hidden={false} />
                    <RootNavigator />
                </NavigationContainer>
            </StoriesContext.Provider>
        </ThemeProvider>
    );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
