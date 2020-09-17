import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { StyleSheet } from 'react-native';

import { Button, Text, Card, Icon } from 'react-native-elements'

import { StoryListItem } from '../components/StoryListItem'
import { AuthorText, TWText, isAuthorTextEmpty, isTWTextEmpty } from '../components/StoryElements'
import { ControlsContext, StoriesContext } from '../contexts'
import { getImageUrl, window } from '../constants'

export const ModalScreen = (props) => {

    const { story } = props.route?.params

    const { unlockedSet } = useContext(StoriesContext)
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

    const makeHeader = (story) => {

        let elements = new Array();

        const uri = getImageUrl(story.display_image);
        if (uri !== 'noimage') {
            elements.push(
                <Card.Image
                    key={1}
                    source={{ uri: uri }}
                    style={{ height: window.height/4, margin: 15 }}
                    resizeMode={'contain'}
                    PlaceholderContent={<ActivityIndicator size='large' />}
                />
            );
        }

        if (!isAuthorTextEmpty(story)) {
            elements.push(
                <Card.FeaturedSubtitle key={2}>
                    <AuthorText story={story} />
                </Card.FeaturedSubtitle>);
        }

        if (!isTWTextEmpty(story)) {
            elements.push(
                <Card.FeaturedSubtitle key={3}>
                    <TWText story={story} style={{ color: 'red' }} />
                </Card.FeaturedSubtitle>);
        }

        if (elements.length > 0) {
            elements.push(<Card.Divider key={4} />)
        }

        return elements;
    }

    return (
        <Card containerStyle={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15, marginTop: 15,
            paddingBottom: 10, paddingLeft: 15, paddingRight: 1
        }}>
            <ScrollView contentContainerStyle={{ paddingRight: 14 }}>
                {makeHeader(story)}
                <Text onPress={() => console.log(story)}>
                    {story.text}
                </Text>
            </ScrollView>
            <View style={{ marginTop: 10, paddingRight: 14 }}>
                {makeButton(story)}
            </View>
        </Card>
    );
}
