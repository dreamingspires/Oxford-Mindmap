import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'

import { Text, Button } from 'react-native-elements'
import { Card, Icon } from 'react-native-elements'

import { ControlsContext, LocationContext, StoriesContext, StoryFetchStatus } from '../contexts'

export const StoryFloat = (props) => {

    const story = props.story

    const { unlockedSet } = useContext(StoriesContext)
    const { location, distanceAdjusted } = useContext(LocationContext)

    const distance = distanceAdjusted(story);
    const inDistance = distance <= 0;

    const makeButton = (story) => {
        if (unlockedSet.has(story.id)) {
            return (
                <Button
                    title={"View"}
                    onPress={props.view}
                    type='solid'
                />
            )
        }
        else {
            return (
                <Button
                    title={inDistance ? "Unlock" : `You are ${distance} metres too far to unlock.`}
                    onPress={props.unlock}
                    type='clear'
                    disabled={!inDistance}
                />
            )
        }
    }

    // https://github.com/facebook/react-native/issues/12360
    // iOS press propagation works differently to Android
    // pointerEvents="box-none" resolves the issue
    return (
        <View pointerEvents="box-none" style={{ flex: 1, justifyContent: 'space-between' }}>
            <Card containerStyle={{ opacity: 0.8, marginTop: 15 }}>
                <Card.Image
                    onPress={props.unlock}
                    source={{ uri: story.url + story.display_image }}
                    resizeMode={'cover'}
                    PlaceholderContent={<ActivityIndicator size='large' />}
                />
            </Card>
            <Card containerStyle={{ opacity: 0.8, marginBottom: 15 }}>
                <Card.Title>{story.title}</Card.Title>
                <Text>{story.description}</Text>
                <Card.Divider />
                {makeButton(story)}
            </Card>
        </View>
    );
}
