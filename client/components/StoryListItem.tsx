import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar, Icon } from 'react-native-elements'

import { ActivityIndicator, FlatList } from 'react-native';
import { getImageUrl } from '../constants'

class StoryListItem extends React.Component {

    shouldComponentUpdate = (nextProps) => {
        const story = this.props.story;
        const nextStory = nextProps.story;
        return story !== nextStory;
    }

    render() {

        const story = this.props.story

        console.log('Rendering story ' + story.id)

        return (
            <ListItem
                bottomDivider
                onPress={() => { this.props.onPress(story) }}>
                <Avatar
                    rounded
                    source={{ uri: getImageUrl(story.thumbnail) }}
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
};

export { StoryListItem }
