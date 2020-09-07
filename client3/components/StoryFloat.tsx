import React from 'react';
import { Text, Button, View, ScrollView, ActivityIndicator } from 'react-native'

import { Card, Icon } from 'react-native-elements'

export const StoryFloat = (props) => {

    const story = props.story

    return (
        <Card>
            <Card.Image
                source={{ uri: story.url + story.display_image }}
                resizeMode={'cover'}
                PlaceholderContent={<ActivityIndicator size='large' />} />
            <Card.Title>{story.title}</Card.Title>
            <Card.Divider />
            <Button
                title={props.buttonTitle}
                onPress={() => { props.onButtonPress(story) }}
            />
        </Card>
    );
}
