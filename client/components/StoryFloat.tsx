import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator, Image } from 'react-native'

import { Card, Icon, Text, Button } from 'react-native-elements'
import { TWText } from '../components/StoryElements'

import { ControlsContext, LocationContext, StoriesContext, StoryFetchStatus } from '../contexts'
import { getImageUrl, window } from '../constants'

export const StoryFloat = (props) => {

    const story = props.story

    const { unlockedSet } = useContext(StoriesContext)
    const { location, distanceAdjusted } = useContext(LocationContext)

    const distance = distanceAdjusted(story);
    const inDistance = distance <= 0;

    const makeLockedText = () => {
        if (inDistance) return "Unlock";
        else if (distance === Infinity) return "Cannot unlock without location data.";
        else return `You are ${distance} metres too far to unlock.`;
    }

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
                    title={makeLockedText()}
                    onPress={props.unlock}
                    type='clear'
                    disabled={!inDistance}
                />
            )
        }
    }

    const makeImageCard = (story) => {
        const uri = getImageUrl(story.display_image);
        if (uri === 'noimage') return null;
        else return (
            // This makes presses propagate through the image,
            // which actually makes using the map nicer
            <Image
                source={{ uri: uri }}
                style={{ height: window.height / 4, margin: 15, borderRadius: 10, opacity: 0.8 }}
                resizeMode={'contain'}
                // PlaceholderContent={<ActivityIndicator size='large' />}
            />
            // <Card containerStyle={{ opacity: 0.8, marginTop: 15, padding: 5 }}>
            //     <Card.Image
            //         source={{ uri: uri }}
            //         style={{ height: window.height/4, margin: 0 }}
            //         resizeMode={'contain'}
            //         PlaceholderContent={<ActivityIndicator size='large' />}
            //     />
            // </Card>
        )
    }

    // https://github.com/facebook/react-native/issues/12360
    // iOS press propagation works differently to Android
    // pointerEvents="box-none" resolves the issue
    return (
        <View pointerEvents="box-none" style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column-reverse' }}>
            <Card containerStyle={{ opacity: 0.8, marginBottom: 15 }}>
                <Card.Title
                    onPress={props.unlock}    // dev hack
                >{story.title}</Card.Title>
                <Card.FeaturedSubtitle>
                    <Text>{story.description}</Text>
                </Card.FeaturedSubtitle>
                <Card.Divider style={{ marginBottom: 10 }} />
                <TWText story={story} style={{ marginBottom: 10, color: 'red' }} />
                {makeButton(story)}
            </Card>
            {makeImageCard(story)}
        </View>
    );
}

