import React, { useEffect, useState, useContext } from 'react';
import { View } from 'react-native'
import { StyleSheet } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native'

import { ControlsContext, StoriesContext, StoryFetchStatus } from '../contexts'

import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps'
import { StoryFloat } from '../components/StoryFloat'

export const MapScreen = (props) => {

    const { storyData, unlockedSet } = useContext(StoriesContext)
    const { refresh, lock, unlock } = useContext(ControlsContext)

    const [currentStory, setCurrentStory] = useState(null)
    const isSelected = (id) => { return currentStory !== null && id == currentStory.id }

    // construct a float for a story
    const makeFloat = (story) => {
        if (story === null) return null;
        else if (unlockedSet.has(story.id)) {
            return (
                <StoryFloat
                    story={story}
                    buttonTitle={"View"}
                    onButtonPress={(story) => props.navigation.navigate("Modal", { story })} />
            )
        }
        else {
            return (
                <StoryFloat
                    story={story}
                    buttonTitle={"Unlock"}
                    onButtonPress={(story) => unlock(story.id)} />
            )
        }
    }

    // colour of markers depending on story state
    const computeColor = (id) => {
        if (isSelected(id)) {
            return unlockedSet.has(id) ? 'aqua' : 'indigo'
        }
        else return unlockedSet.has(id) ? 'green' : 'tomato'
    }

    // make back button close the float if it's open
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (currentStory == null) {
                    return false;
                }
                else {
                    setCurrentStory(null);
                    return true;
                }
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            }
        }, [currentStory])
        // not sure why it's necessary to re-register on currentStory change
        // behaves as if currentStory was passed by value?
    );

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={styles.map}
                initialRegion={oxfordRegion}
                // showsUserLocation={true}
                onPress={() => setCurrentStory(null)}
            >
                {storyData.map((story) => <Marker
                    // https://github.com/react-native-community/react-native-maps/issues/1611
                    // workaround for marker update issue
                    // it works because colour is the only property that changes
                    key={story.id + computeColor(story.id)}
                    // tracksViewChanges={true}
                    coordinate={{ latitude: story.latitude, longitude: story.longitude }}
                    opacity={0.75}
                    pinColor={computeColor(story.id)}
                    onPress={() => {
                        setCurrentStory(story);
                    }}
                />
                )}
            </MapView>
            {makeFloat(currentStory)}
        </View>
    );
}

const oxfordRegion = {
    latitude: 51.7519,
    longitude: -1.2583,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
