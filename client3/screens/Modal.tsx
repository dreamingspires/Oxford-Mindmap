import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'

import { Button, Text, Card, Icon } from 'react-native-elements'

import { StoryListItem } from '../components/StoryListItem'
import { AuthorText, TWText } from '../components/StoryElements'
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
                style={{ height: 200, margin: 15 }}
                resizeMode={'contain'}
                PlaceholderContent={<ActivityIndicator size='large' />}
            />
        )
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Card containerStyle={{ marginBottom: 10, margin: 10, paddingBottom: 10, paddingLeft: 15, paddingRight: 1 }}>
                <ScrollView style={{ marginBottom: 10, paddingRight: 14 }}>
                    {makeImageCard(story)}
                    <Card.FeaturedSubtitle>
                        <AuthorText story={story} />
                    </Card.FeaturedSubtitle>
                    <Card.FeaturedSubtitle>
                        <TWText story={story} style={{ color: 'red' }} />
                    </Card.FeaturedSubtitle>
                    <Card.Divider />
                    <Text onPress={() => console.log(story)}
                    >{story.text}</Text>
                </ScrollView>
                <View style={{ paddingRight: 14 }}>
                    {makeButton(story)}
                </View>
            </Card>
        </View>
    );
}
