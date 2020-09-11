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

import { reformatStoryData, apiUrl, storyRadius } from './constants'

const theme = {};

export default function App() {

    const [fetchStatus, setFetchStatus] = useState(StoryFetchStatus.InProgress);
    const [fetchNeeded, setFetchNeeded] = useState(true);
    const [rawStoryData, setRawStoryData] = useState({});
    const [storyData, setStoryData] = useState([]);

    const [unlockedSet, setUnlockedSet] = useState(Set());
    const [unlockedReady, setUnlockedReady] = useState(false);

    // using undefined here instead of null is a massive kludge
    // only null triggers the location error, and will only be set after at least
    // one failed attempt to get permission
    const [location, setLocation] = useState(undefined);
    const [locationRequestNeeded, setLocationRequestNeeded] = useState(true);
    const [dummyFlipper, setDummyFlipper] = useState(true);


    // location
    useEffect(() => {
        if (locationRequestNeeded) {
            setDummyFlipper(!dummyFlipper);
        }
    }, [locationRequestNeeded])

    useEffect(() => {

        const requestPermission = async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                // first time will change it from undefined to null
                setLocation(null);
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
                    distanceInterval: 1
                },
                (location) => {
                    setLocation(location);
                });
            console.log('Subscribed to location service');
            return subscription;
        }

        let subscription = requestPermission()
            .then(registerLocation)
            .catch(() => { console.log('Failed to get location permisson'); return { remove: () => { } } })
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




    // unlocked stories
    // fetch unlocked from local storage
    useEffect(() => {
        AsyncStorage.getItem('unlockedSet')
            .then((val) => {
                setUnlockedSet(unlockedSet.union(JSON.parse(val || '[]')));
            })
            .then(() => setUnlockedReady(true))
            .catch((error) => console.log(error))
    }, [])

    // store unlocked to local storage
    useEffect(() => {
        if (unlockedReady) {
            console.log('Storing local unlocked set')
            AsyncStorage.setItem("unlockedSet", JSON.stringify(unlockedSet.toArray()))
                .catch((error) => console.log(error))
        }
    }, [unlockedSet, unlockedReady])


    // stories
    // fetch stories from the internet and local storage as backup
    useEffect(() => {
        if (fetchNeeded) {

            const fetchRemote = (async () => {
                console.log('Fetching from ' + apiUrl)
                setFetchStatus(StoryFetchStatus.InProgress);
                try {
                    const stories = await fetch(apiUrl + '/oxford-mindmap/api/get_stories')
                        .then((response) => response.json())
                    await new Promise(r => setTimeout(r, 5000));
                    console.log("Remote stories: ", Object.keys(stories).length)
                    setFetchStatus(StoryFetchStatus.Done);
                    return stories;
                }
                catch (error) {
                    console.log('Failed to fetch from internet')
                    setFetchStatus(StoryFetchStatus.Failed);
                    throw error;
                }
            })();

            const fetchLocal = (async () => {
                try {
                    const stories = await AsyncStorage.getItem('stories')
                        .then((val) => JSON.parse(val || '{}'))
                    await new Promise(r => setTimeout(r, 2000));
                    console.log("Local stories: ", Object.keys(stories).length)
                    return stories;
                }
                catch (error) {
                    return {};
                }
            })();

            // Promise.any not implemented yet it seems
            // const backupStories = Promise.any([fetchRemote(), fetchLocal()]);

            // either fetchRemote if that is somehow faster, or fetchLocal
            const storiesInitial = Promise.race([fetchRemote, fetchLocal])
                .catch(() => fetchLocal);

            storiesInitial
                .then(stories => setRawStoryData(stories))
                .then(() => fetchRemote)
                .then(stories => {
                    setRawStoryData(stories);
                    console.log('Storing freshly fetched stories');
                    AsyncStorage.setItem('stories', JSON.stringify(stories))
                        .catch((error) => console.log(error));
                })
                .finally(() => setFetchNeeded(false))
        }
    }, [fetchNeeded]);

    useEffect(() => {
        setStoryData(reformatStoryData(rawStoryData));
    }, [rawStoryData])



    const storyContext = {
        storyData: storyData,
        unlockedSet: unlockedSet,
        getUrl: (suffix) => { return suffix ? apiUrl + suffix : 'noimage'; },
        fetchStatus: fetchStatus,
    }

    const computeDistance = (story) => {
        if (!location) { return Infinity; }
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
