import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar, Icon } from 'react-native-elements'

import { ActivityIndicator, FlatList } from 'react-native';
import { StoriesContext } from '../contexts'

export const StoryListItem = (props) => {

    const story = props.story
    const { getUrl } = useContext(StoriesContext)

    return (
        <ListItem
            bottomDivider
            onPress={() => { props.onPress(story) }}>
            <Avatar
                rounded
                source={{ uri: getUrl(story.thumbnail) }}
                renderPlaceholderContent={<Icon name='image' />}
            />
            <ListItem.Content>
                <ListItem.Title>{story.title}</ListItem.Title>
                <ListItem.Subtitle>{story.description}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
    )
};

