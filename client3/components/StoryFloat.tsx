import React from 'react';
import { Text, Button } from 'react-native-elements'
import { View, ScrollView, ActivityIndicator } from 'react-native'

import { Card, Icon } from 'react-native-elements'

export const StoryFloat = (props) => {

    const story = props.story

    return (
        <Card containerStyle={{ opacity: 0.8 }}>
            <Card.Image
                source={{ uri: story.url + story.display_image }}
                resizeMode={'cover'}
                PlaceholderContent={<ActivityIndicator size='large' />} />
            <Card.Title>{story.title}</Card.Title>
            <Text>{story.description}</Text>
            <Button
                title={props.buttonTitle}
                onPress={() => { props.onButtonPress(story) }}
                type={props.type}
            />
        </Card>
    );
}
