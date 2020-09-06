import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar, Icon } from 'react-native-elements'

import { ActivityIndicator, FlatList } from 'react-native';

// function

export const StoryListItem = (props) => {

    const item = props.story

    return (
        <ListItem
            bottomDivider
            onPress={() => { props.onPress(item) }}>
            <Avatar
                // rounded
                source={{ uri: item.url + item.thumbnail }}
                renderPlaceholderContent={<Icon name='image' />} />
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
        </ListItem>
    )
};

