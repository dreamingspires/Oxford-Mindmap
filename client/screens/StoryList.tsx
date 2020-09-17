import React, { useEffect, useState, useContext, useMemo } from 'react';

import { StyleSheet } from 'react-native';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Text, Button } from 'react-native-elements'

import { ControlsContext, StoriesContext, StoryFetchStatus } from '../contexts'
import { StoryListItem } from '../components/StoryListItem'


export const StoryListScreen = (props) => {

    const { storyData, unlockedSet, fetchStatus, auxiliaryMap } = useContext(StoriesContext)
    const { refresh, lock, unlock } = useContext(ControlsContext)

    const emptyMessage =
        <View style={{ flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15 }}>No stories to display.</Text>
        </View>

    const renderItem = ({ item, index }) =>
        <StoryListItem
            story={item}
            onPress={(story) => props.navigation.navigate("Modal", { story })} />

    const storyList = useMemo(
        () => storyData.filter(x => unlockedSet.has(x.id)).sort((a, b) => {
            return -(auxiliaryMap.get(a.id).unlockTime
                   - auxiliaryMap.get(b.id).unlockTime);
        }), [storyData, unlockedSet]);

    return (
        <FlatList
            data={storyList}
            keyExtractor={({ id }) => id}
            renderItem={renderItem}
            ListEmptyComponent={emptyMessage}
        />
    );
};
