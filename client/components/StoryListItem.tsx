import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements'

import { ActivityIndicator, FlatList} from 'react-native';


import { Text, View } from './Themed';

export const StoryListItem = (props) => {

    const item = props.story

    // return <Avatar rounded icon={{ name: 'home' }} />

    // return (
    //     <View>
    //         <Text>{JSON.stringify(item)}</Text>
    //     </View>
    // )
            // <Avatar source={{ uri: item.thumbnail }} />
    return (
        <ListItem bottomDivider>
            <Avatar rounded icon={{ name: 'home' }} />
        </ListItem>
    )
            // <ListItem.Chevron />
            // <ListItem.Content>
            //     <ListItem.Title>{item.title}</ListItem.Title>
            //     <ListItem.Subtitle>{item.description}</ListItem.Subtitle>
            // </ListItem.Content>
};

