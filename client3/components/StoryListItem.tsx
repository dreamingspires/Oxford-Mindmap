import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar, Icon } from 'react-native-elements'

import { ActivityIndicator, FlatList } from 'react-native';

// function

export const StoryListItem = (props) => {

    const story = props.story

    return (
        <ListItem
            bottomDivider
            onPress={() => { props.onPress(story) }}>
            <Avatar
                // rounded
                source={{ uri: story.url + story.thumbnail }}
                renderPlaceholderContent={<Icon name='image' />} />
            <ListItem.Content>
                <ListItem.Title>{story.title}</ListItem.Title>
                <ListItem.Subtitle>{story.description}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
    )
};

