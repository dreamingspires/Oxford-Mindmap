import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { StoriesContext, StoryFetchStatus } from './constants/Contexts'

function reformatData(json: Object): [Object] {
    return Object.entries(json).map(function([k, v]) { return { ...v, id: k } })
}

const App = () => {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();


    const [fetchStatus, setFetchStatus] = useState(StoryFetchStatus.InProgress);
    const [storyData, setStoryData] = useState({});

    const storyContext = {
        storyData: storyData,
        fetchStatus: fetchStatus
    }

    useEffect(() => {
        setFetchStatus(StoryFetchStatus.InProgress);
        fetch('https://client.dreamingspires.dev/oxford-mindmap/api/get_stories')
            .then((response) => response.json())
            .then((json) => setStoryData(reformatData(json)))
            .catch((error) => { console.error(error); setFetchStatus(StoryFetchStatus.Failed); })
            .finally(() => setFetchStatus(StoryFetchStatus.Done));
    }, []);

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <SafeAreaProvider>
                <StoriesContext.Provider value={storyContext}>
                    <Navigation colorScheme={colorScheme} />
                    <StatusBar />
                </StoriesContext.Provider>
            </SafeAreaProvider>
        );
    }
};

export default App;
