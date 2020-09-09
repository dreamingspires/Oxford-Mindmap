import React, { useEffect, useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { useColorScheme } from 'react-native-appearance';
import { ThemeProvider } from 'react-native-elements'

import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './routes'

import SafeAreaView from 'react-native-safe-area-view';

import { ControlsContext, LocationContext, StoriesContext, StoryFetchStatus } from './contexts'
import { Set } from 'immutable'
import { AsyncStorage } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib'
import Constants from "expo-constants"

let apiUrl = Constants.manifest.extra.api_url

function reformatData(json: Object): Object[] {
    return Object.entries(json).map(function([k, v]) { return { ...v, id: k, url: apiUrl } })
}

// in metres
const storyRadius = 10;

const theme = {};

export default function App() {

    const [fetchStatus, setFetchStatus] = useState(StoryFetchStatus.InProgress);
    const [fetchNeeded, setFetchNeeded] = useState(true);
    const [storyData, setStoryData] = useState({});

    const [unlockedSet, setUnlockedSet] = useState(Set());

    const [cacheReady, setCacheReady] = useState(false);

    const [location, setLocation] = useState(null);
    const [locationRequestNeeded, setLocationRequestNeeded] = useState(true);
    const [dummyFlipper, setDummyFlipper] = useState(true);

    useEffect(() => {
        if (locationRequestNeeded) {
            setDummyFlipper(!dummyFlipper);
        }
    }, [locationRequestNeeded])

    useEffect(() => {

        const requestPermission = async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
            }
            else {
                console.log('Permission to access location was granted');
            }
        }

        const registerLocation = async () => {
            setLocation(await Location.getLastKnownPositionAsync());
            let subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    // distanceInterval: 5
                },
                (location) => {
                    console.log("Location updated")
                    setLocation(location);
                });
            console.log('Subscribed to location service');
            return subscription;
        }

        let subscription = requestPermission()
            .then(registerLocation)
            .catch(() => { console.log('Failed to get location permisson'); return { remove: () => { console.log('Running dummy unsubscribe') } } })
            .finally(() => setLocationRequestNeeded(false))

        return () => {
            (async () => (await subscription).remove())();
            console.log('Unsubscribed from location service')
        }
    }, [dummyFlipper]);

    useEffect(() => {
        // dev hack for clearing cache on every restart
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
                const newUnlockedSet = unlockedSet.union(u)

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
            AsyncStorage.setItem("unlockedSet", JSON.stringify(unlockedSet.toArray()))
                .catch((error) => console.log(error))
        }
    }, [unlockedSet, cacheReady])


    const storyContext = {
        storyData: reformatData(storyData),
        unlockedSet: unlockedSet,
        fetchStatus: fetchStatus,
    }

    const computeDistance = (story) => {
        if (location === null) { return Infinity; }
        else {
            const from = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            const to = { latitude: story.latitude, longitude: story.longitude };
            return getDistance(from, to, 1);
        }
    }

    const locationContext = {
        location: location,
        awaitingLocation: locationRequestNeeded,
        distance: (story) => { return computeDistance(story); },
        distanceAdjusted: (story) => { return computeDistance(story) - storyRadius; }
    };

    const controlContext = {
        requestLocation: () => setLocationRequestNeeded(true),
        refresh: () => setFetchNeeded(true),
        lock: (x) => { console.log('Locking ' + x); setUnlockedSet(unlockedSet.delete(x)); },
        unlock: (x) => { console.log('Unlocking ' + x); setUnlockedSet(unlockedSet.add(x)) },
        clearUnlocks: () => { console.log('Clearing all unlocks'); setUnlockedSet(unlockedSet.clear()) }
    }

    // const colorScheme = useColorScheme();
    const colorScheme = 'light'

    // console.log(colorScheme)
    // console.log(location)

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ThemeProvider theme={theme} useDark={colorScheme === 'dark'}>
                <StoriesContext.Provider value={storyContext}>
                    <LocationContext.Provider value={locationContext}>
                        <ControlsContext.Provider value={controlContext}>
                            <NavigationContainer>
                                <StatusBar style="auto" hidden={false} />
                                <RootNavigator />
                            </NavigationContainer>
                        </ControlsContext.Provider>
                    </LocationContext.Provider>
                </StoriesContext.Provider>
            </ThemeProvider>
        </SafeAreaView>
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
