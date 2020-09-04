import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';


// import { Text, View } from './Themed';
import { StoriesContext, StoryFetchStatus } from '../constants/Contexts'
import { StoryListItem } from './StoryListItem'


export const StoryList = () => {

    const { storyData, fetchStatus } = useContext(StoriesContext)
    console.log(storyData)
    console.log(fetchStatus)

    if (fetchStatus === StoryFetchStatus.InProgress) {
        return (<ActivityIndicator />)
    }
    else if (fetchStatus === StoryFetchStatus.Failed) {
        return (<Text>Failed to fetch story data.</Text>)
    }
    else if (fetchStatus === StoryFetchStatus.Done) {
        return (
            <FlatList
                data={storyData}
                keyExtractor={({ id }) => id}
                renderItem={({ item, index }) => <StoryListItem story={item} />}
            />
        );
    }
    else return null;

};

