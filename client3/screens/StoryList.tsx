import React, { useEffect, useState, useContext } from 'react';

import { StyleSheet } from 'react-native';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text, Button } from 'react-native-elements'

import { ControlsContext, StoriesContext, StoryFetchStatus } from '../contexts'
import { StoryListItem } from '../components/StoryListItem'


export const StoryListScreen = (props) => {

    const { storyData, unlockedSet, fetchStatus } = useContext(StoriesContext)

    // console.log(storyData.length)
    // console.log(unlockedSet)
    // console.log(fetchStatus)

    const { refresh, lock, unlock } = useContext(ControlsContext)

    const text = storyData.length == 0
        ? "Failed to fetch stories."
        : "Failed to refresh stories."
    const statusMessage = fetchStatus === StoryFetchStatus.Failed
        ?
        <View style={{ flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15 }}>{text}</Text>
        </View>
        : null;

    const emptyMessage =
        <View style={{ flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15 }}>No stories to display.</Text>
        </View>

    return (
        <FlatList
            data={storyData.filter(x => unlockedSet.has(x.id))}
            keyExtractor={({ id }) => id}
            renderItem={({ item, index }) =>
                <StoryListItem
                    story={item}
                    onPress={(story) => props.navigation.navigate("Modal", { story })} />
            }
            onRefresh={refresh}
            refreshing={fetchStatus === StoryFetchStatus.InProgress}
            ListHeaderComponent={statusMessage}
            ListEmptyComponent={emptyMessage}
        />
    );
};
