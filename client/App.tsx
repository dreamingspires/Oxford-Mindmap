import React, { useEffect, useState } from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { useColorScheme } from 'react-native-appearance';
import { ThemeProvider } from 'react-native-elements'

import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './routes'

import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view'

import {
    StoriesContext,
    StoryFetchStatus,
    ControlsContext,
    LocationContext,
    TriggerContext,
} from './contexts'
import { Set as ISet, Map as IMap } from 'immutable'
import { AsyncStorage } from 'react-native';
import * as Location from 'expo-location';
import { getDistance } from 'geolib'

import { portal } from './portal'

import {
    reformatStoryData,
    apiUrl,
    storyRadius,
    extractTWs,
    defaultSettings,
    autoRefreshPeriod,
} from './constants'


export default function App() {

    const [fetchStatus, setFetchStatus] = useState(StoryFetchStatus.InProgress);
    const [fetchNeeded, setFetchNeeded] = useState(true);
    const [rawStoryData, setRawStoryData] = useState({});
    const [storyData, setStoryData] = useState([]);

    const [unlockedSet, setUnlockedSet] = useState(ISet());
    const [unlockedReady, setUnlockedReady] = useState(false);

    const [auxiliaryMap, setAuxiliaryMap] = useState(IMap());
    const [auxiliaryReady, setAuxiliaryReady] = useState(false);

    const [settings, setSettings] = useState(defaultSettings);
    const [settingsReady, setSettingsReady] = useState(false);

    const [knownTriggers, setKnownTriggers] = useState(new Map())
    const [blacklistSet, setBlacklistSet] = useState(ISet());
    const [blacklistReady, setBlacklistReady] = useState(false);

    const [location, setLocation] = useState(null);
    const [locationWorking, setLocationWorking] = useState(true);
    const [locationRequestSuggested, setlocationRequestSuggested] = useState(false);
    const [locationRequestNeeded, setLocationRequestNeeded] = useState(false);
    const [dummyFlipper, setDummyFlipper] = useState(true);

    // location

    // invoke a subscription to location service, asking for permission if necessary
    useEffect(() => {
        if (locationRequestNeeded) {
            setDummyFlipper(!dummyFlipper);
        }
    }, [locationRequestNeeded])

    // only run on dummyFlipper changes, so that unsubscribing works properly
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
            let subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1
                },
                (newLocation) => {
                    setLocation(portal.teleport(newLocation));
                });
            // consider location working after we get a subscription without exceptions
            setLocationWorking(true);
            console.log('Subscribed to location service');
            return subscription;
        }

        const quickLocation = async () => {
            try {
                console.log('Trying to get quick location.')
                let newLocation = await Location.getLastKnownPositionAsync();
                // only assign if we have nothing
                if (newLocation && !location) {
                    setLocation(portal.teleport(newLocation));
                    console.log('Successfully set a quick location.')
                } else if (!location) {
                    console.log('Quick location was too slow.')
                } else {
                    console.log('Quick location was falsy.')
                }
            }
            catch (e) {
                console.log('Failed to get quick location: ' + e);
            }
        }

        let subscription = requestPermission()
            .then(() => Promise.all([registerLocation(), quickLocation()]))
            .then(values => values[0])
            .catch((e) => {
                setLocationWorking(false);
                console.log('Failed to register for location updates: ' + e);
                return { remove: () => { } }
            })
            .finally(() => setLocationRequestNeeded(false))

        return () => {
            (async () => (await subscription).remove())();
            console.log('Unsubscribed from location service')
        }
    }, [dummyFlipper]);


    // request re-subscription if location is known not to be working
    useEffect(() => {
        if (locationRequestSuggested) {
            setlocationRequestSuggested(false);
            if (!locationWorking) {
                console.log('Automatically re-subscribing to location service.')
                setLocationRequestNeeded(true);
            }
        }
    }, [locationRequestSuggested])

    // observe status of location settings, suggest a re-subscription if a quiet one is possible
    useEffect(() => {
        const interval = setInterval(
            () => {
                Promise.all([Location.getPermissionsAsync(), Location.hasServicesEnabledAsync()])
                    .then((values) => {
                        // if these values change after the check we will at worst emit another permisson request
                        if (values[1] && values[0].status === 'granted') {
                            setlocationRequestSuggested(true);
                        }
                        else {
                            setLocationWorking(false);
                        }
                    });
            },
            locationWorking ? 2000 : 200)
        return () => clearInterval(interval);
    }, [locationWorking])


    // auxiliary
    // fetch auxiliary from local storage
    useEffect(() => {
        AsyncStorage.getItem('auxiliaryMap')
            .then((val) => {
                setAuxiliaryMap(auxiliaryMap.merge(JSON.parse(val || '[]')));
            })
            .then(() => setAuxiliaryReady(true))
            .catch((error) => console.log(error))
    }, [])

    // store auxiliary to local storage
    useEffect(() => {
        if (auxiliaryReady) {
            // console.log('Storing auxiliary map')
            AsyncStorage.setItem('auxiliaryMap', JSON.stringify(auxiliaryMap.toArray()))
                .catch((error) => console.log(error))
        }
    }, [auxiliaryMap, auxiliaryReady])


    // settings
    // fetch from local storage
    useEffect(() => {
        AsyncStorage.getItem('settings')
            .then((val) => {
                // loaded override previous
                setSettings({ ...settings, ...JSON.parse(val || '{}') });
            })
            .then(() => setSettingsReady(true))
            .catch((error) => console.log(error))
    }, [])

    // store to local storage
    useEffect(() => {
        if (settingsReady) {
            // console.log('Storing settings')
            AsyncStorage.setItem('settings', JSON.stringify(settings))
                .catch((error) => console.log(error))
        }
    }, [settings, settingsReady])

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
            // console.log('Storing unlocked set')
            AsyncStorage.setItem("unlockedSet", JSON.stringify(unlockedSet.toArray()))
                .catch((error) => console.log(error))
        }
    }, [unlockedSet, unlockedReady])

    // triggers
    // fetch blacklist from local storage
    useEffect(() => {
        AsyncStorage.getItem('blacklist')
            .then((val) => {
                setBlacklistSet(blacklistSet.union(JSON.parse(val || '[]')));
            })
            .then(() => setBlacklistReady(true))
            .catch((error) => console.log(error))
    }, [])

    // store blacklist to local storage
    useEffect(() => {
        if (unlockedReady) {
            // console.log('Storing trigger blacklist')
            AsyncStorage.setItem("blacklist", JSON.stringify(blacklistSet.toArray()))
                .catch((error) => console.log(error))
        }
    }, [blacklistSet, blacklistReady])

    // stories
    // fetch stories from the internet and local storage as backup
    useEffect(() => {
        if (fetchNeeded) {

            const fetchRemote = (async () => {
                console.log('Fetching from ' + apiUrl)
                setFetchStatus(StoryFetchStatus.InProgress);
                try {
                    const stories = await fetch(
                        apiUrl + '/oxford-mindmap/api/get_stories',
                        { cache: 'no-cache' })
                        .then((response) => response.json())
                    // await new Promise(r => setTimeout(r, 5000));
                    // console.log("Remote stories: ", Object.keys(stories).length)
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
                    // await new Promise(r => setTimeout(r, 2000));
                    // console.log("Local stories: ", Object.keys(stories).length)
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
                    // console.log('Storing freshly fetched stories');
                    AsyncStorage.setItem('stories', JSON.stringify(stories))
                        .catch((error) => console.log(error));
                })
                .catch((error) => console.log(error))
                .finally(() => setFetchNeeded(false))
        }
    }, [fetchNeeded]);

    // process story data when raw data changes
    useEffect(() => {
        const stories = reformatStoryData(rawStoryData)
        if (JSON.stringify(stories) !== JSON.stringify(storyData)) {
            setStoryData(stories);
            setKnownTriggers(extractTWs(stories));
        }
        else {
            // console.log('Not updating storyData because new version is deeply equal')
        }
    }, [rawStoryData])


    // auto-refresh
    useEffect(() => {
        if (settings.autoRefresh) {
            const interval = setInterval(
                () => {
                    // console.log('Auto-refresh initiated')
                    setFetchNeeded(true);
                },
                autoRefreshPeriod * 1000);
            return () => clearInterval(interval);

        }
    }, [settings]);


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
        locationWorking: locationWorking,
        awaitingLocation: locationRequestNeeded && !locationWorking,
        distance: (story) => { return computeDistance(story); },
        distanceAdjusted: (story) => { return computeDistance(story) - storyRadius; }
    };

    const controlContext = {
        requestLocation: () => setLocationRequestNeeded(true),
        refresh: () => setFetchNeeded(true),
        lock: (x) => {
            // console.log('Locking ' + x);
            setUnlockedSet(unlockedSet.delete(x));
        },
        unlock: (x) => {
            // console.log('Unlocking ' + x);
            setAuxiliaryMap(auxiliaryMap.update(x, {},
                (v) => { return { ...v, unlockTime: Date.now() } }));
            setUnlockedSet(unlockedSet.add(x))
        },
        clearUnlocks: () => {
            // console.log('Clearing all unlocks');
            setUnlockedSet(unlockedSet.clear())
        },
        settings: settings,
        setSettings: setSettings
    }

    const filterByTriggers = (stories) =>
        stories.filter(x => !x.trigger_warnings
            .some(({ name }) => blacklistSet.has(name)))

    const triggerContext = {
        knownTriggers: knownTriggers,
        blacklist: blacklistSet,
        toggle: (t) => {
            if (blacklistSet.has(t)) {
                setBlacklistSet(blacklistSet.delete(t))
            }
            else {
                setBlacklistSet(blacklistSet.add(t))
            }
        }
    }

    const storyContext = {
        storyData: filterByTriggers(storyData),
        unlockedSet: unlockedSet,
        auxiliaryMap: auxiliaryMap,
        fetchStatus: fetchStatus,
    }

    // console.log(location)

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <StoriesContext.Provider value={storyContext}>
                    <LocationContext.Provider value={locationContext}>
                        <ControlsContext.Provider value={controlContext}>
                            <TriggerContext.Provider value={triggerContext}>
                                <NavigationContainer>
                                    <StatusBar style="auto" hidden={false} />
                                    <RootNavigator />
                                </NavigationContainer>
                            </TriggerContext.Provider >
                        </ControlsContext.Provider>
                    </LocationContext.Provider>
                </StoriesContext.Provider>
            </SafeAreaView>
        </SafeAreaProvider>
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
