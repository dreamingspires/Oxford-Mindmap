import React, { useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from 'react-native-appearance';
import { ThemeProvider } from 'react-native-elements'

import { ControlsContext, StoriesContext, StoryFetchStatus } from './contexts'

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
    const [storyData, setStoryData] = useState({});
    const [unlockedSet, setUnlockedSet] = useState(new Set());
    const [cacheReady, setCacheReady] = useState(false);

    const storyContext = {
        storyData: reformatData(storyData),
        unlockedSet: unlockedSet,
        fetchStatus: fetchStatus,
    }

    const controlContext = {
        refresh: () => setFetchNeeded(true),
        lock: (x) => {
            unlockedSet.delete(x);
            setUnlockedSet(unlockedSet);
        },
        unlock: (x) => setUnlockedSet(unlockedSet.add(x))
    }

    useEffect(() => {
        // AsyncStorage.multiRemove(['stories', 'unlockedSet'], (err) => {})
    })

    // fetch all data from local storage
    useEffect(() => {
        AsyncStorage.multiGet(['stories', 'unlockedSet'])
            .then((vals) => {
                const s = JSON.parse(vals[0][1] || '{}')
                const u = JSON.parse(vals[1][1] || '[]')
                // console.log(s)
                // console.log(u)

                const newStoryData = { ...s, ...storyData }
                const newUnlockedSet = new Set([...u, ...unlockedSet])

                setStoryData(newStoryData);
                setUnlockedSet(newUnlockedSet);
            })
            .then(() => setCacheReady(true))
            .catch((error) => console.log(error))
    }, [])

    // fetch stories from the internet
    useEffect(() => {
        if (fetchNeeded) {
            console.log('Fetching from ' + apiUrl)
            setFetchNeeded(false)
            setFetchStatus(StoryFetchStatus.InProgress);
            fetch(apiUrl + '/api/get_stories')
                .then((response) => response.json())
                .then((json) => setStoryData(Object.assign(storyData, json)))
                .then(() => setFetchStatus(StoryFetchStatus.Done))
                .catch((error) => { setFetchStatus(StoryFetchStatus.Failed); })
        }
    }, [fetchNeeded]);

    // store stories and unlocked in local storage

    // stories
    useEffect(() => {
        if (cacheReady) {
            console.log('Storing local stories')
            AsyncStorage.setItem("stories", JSON.stringify(storyData))
                .catch((error) => console.log(error))
        }
    }, [storyData, cacheReady])

    // unlocked
    useEffect(() => {
        if (cacheReady) {
            console.log('Storing local unlocked set')
            AsyncStorage.setItem("unlockedSet", JSON.stringify(Array.from(unlockedSet)))
                .catch((error) => console.log(error))
        }
    }, [unlockedSet, cacheReady])

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
