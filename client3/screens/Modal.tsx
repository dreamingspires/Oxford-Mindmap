import React from 'react';
import { Text, Button, View, ActivityIndicator } from 'react-native'

import { Card, Icon } from 'react-native-elements'

import { StoryListItem } from '../components/StoryListItem'

export const ModalScreen = (props) => {
    const { story } = props.route.params
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Card>
                <Card.Image
                    source={{ uri: story.url + story.display_image }}
                    resizeMode={'cover'}
                    PlaceholderContent={<ActivityIndicator size='large'/>} />
                <Card.Title>{story.title}</Card.Title>
                <Text>{story.description}</Text>
                <Card.Divider />
                <Text>{story.text}</Text>
            </Card>
        </View>
    );
}
