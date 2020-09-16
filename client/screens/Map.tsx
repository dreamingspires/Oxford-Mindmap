import React, { useEffect, useState, useContext } from 'react';
import { View } from 'react-native'
import { StyleSheet } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native'

import { ControlsContext, LocationContext, StoriesContext, StoryFetchStatus } from '../contexts'

import MapView from 'react-native-maps';
import { Marker, Callout, UrlTile } from 'react-native-maps'
import { StoryFloat } from '../components/StoryFloat'
import { Button } from 'react-native-elements'

import { oxfordRegion } from '../constants'

export const MapScreen = (props) => {

    const { storyData, unlockedSet } = useContext(StoriesContext)
    const { location, awaitingLocation, distanceAdjusted } = useContext(LocationContext)
    const { refresh, lock, unlock, requestLocation } = useContext(ControlsContext)

    const [currentStory, setCurrentStory] = useState(null)
    const isSelected = (id) => { return currentStory !== null && id == currentStory.id }

    const makeLocationError = () => {
        // this is a check against null, not truthiness, because location
        // is undefined before the first location permisson rejection,
        // and null afterwards
        // other part of the massive kludge scheme
        if (location !== null) return null;
        else {
            return (
                <Button
                    title='Could not access location, press to try again.'
                    onPress={requestLocation}
                    type='solid'
                    // apparently 0 is not small enough
                    buttonStyle={{ borderRadius: -1 }}
                    loading={awaitingLocation}
                />
            )
        }
    }

    // construct a float for a story
    const makeFloat = (story) => {
        if (story === null || !storyData.some((story) => story.id === currentStory.id)) return null;
        else
            return (
                <StoryFloat
                    story={story}
                    view={() => props.navigation.navigate("Modal", { story })}
                    unlock={() => unlock(story.id)}
                />
            )
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
            {makeLocationError()}
            <View style={{ flex: 1 }}>
                <MapView
                    provider="google"
                    style={styles.map}
                    initialRegion={oxfordRegion}
                    showsUserLocation={true}
                    onPress={() => setCurrentStory(null)}
                >
                    {storyData.map((story) => <Marker
                        // https://github.com/react-native-community/react-native-maps/issues/1611
                        // workaround for marker update issue
                        // it works because colour is the only property that changes
                        key={story.id + computeColor(story.id)}
                        coordinate={{ latitude: story.latitude, longitude: story.longitude }}
                        opacity={0.75}
                        pinColor={computeColor(story.id)}
                        onPress={() => {
                            setCurrentStory(story);
                        }}
                        stopPropagation={true}
                    />
                    )}
                </MapView>
                {makeFloat(currentStory)}
            </View>
        </View>
    );
}
                    // <UrlTile
                    //     urlTemplate={'http://c.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    //     maximumZ={19}
                    //     flipY={false}
                    // />

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
