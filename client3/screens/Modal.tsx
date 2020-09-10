import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'

import { Button, Text, Card, Icon } from 'react-native-elements'

import { StoryListItem } from '../components/StoryListItem'
import { ControlsContext, StoriesContext } from '../contexts'

export const ModalScreen = (props) => {

    const { story } = props.route?.params

    const { unlockedSet, getUrl } = useContext(StoriesContext)
    const { lock, unlock } = useContext(ControlsContext)

    const makeButton = (story) => {
        if (unlockedSet.has(story.id)) {
            return (
                <Button
                    title='Lock'
                    onPress={() => { lock(story.id) }}
                    type='clear'
                />
            )
        }
        else {
            return (
                <Button
                    title='Undo'
                    onPress={() => { unlock(story.id) }}
                    type='solid'
                />
            )
        }
    }

    const makeImageCard = (story) => {
        const uri = getUrl(story.display_image);
        if (uri === 'noimage') return null;
        else return (
            <Card.Image
                source={{ uri: uri }}
                style={{ height: 300, margin: 15 }}
                resizeMode={'contain'}
                PlaceholderContent={<ActivityIndicator size='large' />}
            />
        )
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Card containerStyle={{ marginBottom: 10, margin: 10, paddingLeft: 15, paddingRight: 1 }}>
                <ScrollView style={{ marginBottom: 10, paddingRight: 14 }}>
                    {makeImageCard(story)}
                    <Text>{story.text}</Text>
                </ScrollView>
                {makeButton(story)}
            </Card>
        </View>
    );
}
