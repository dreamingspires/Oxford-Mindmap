import React, { useEffect, useState, useContext } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native'
import { StyleSheet } from 'react-native'

import { FlatList, Alert } from 'react-native'
import { ListItem, Avatar, Card, Icon, Button, Text, Divider } from 'react-native-elements'

import { StoriesContext, StoryFetchStatus } from '../contexts'
import { ControlsContext, TriggerContext } from '../contexts'

export const SettingsScreen = (props) => {

    const { storyData, unlockedSet, fetchStatus } = useContext(StoriesContext)
    const { refresh, clearUnlocks } = useContext(ControlsContext)
    const { knownTriggers, blacklist, toggle } = useContext(TriggerContext)

    const emptyMessage =
        <View style={{ flex: 1, margin: 5, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 15 }}>No loaded stories have any trigger warnings.</Text>
        </View>

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <Card>
                    <ListItem
                        bottomDivider
                        onPress={refresh}
                    >
                        <ListItem.Content>
                            <ListItem.Title>Refresh Stories</ListItem.Title>
                        </ListItem.Content>
                        {fetchStatus === StoryFetchStatus.Failed
                            ? <ListItem.Subtitle>Failed</ListItem.Subtitle> : null}
                        {fetchStatus === StoryFetchStatus.InProgress ? <ActivityIndicator /> : null}
                    </ListItem>
                    <ListItem
                        // bottomDivider
                        onPress={
                            () => Alert.alert(
                                "Are you sure?",
                                "This will lock all stories ever unlocked.",
                                [{
                                    text: "Cancel"
                                }, {
                                    text: "Reset Progress",
                                    onPress: clearUnlocks
                                }], { cancelable: true })
                        }
                    >
                        <ListItem.Content>
                            <ListItem.Title>Reset Progress</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                </Card>
                <Card containerStyle={{ marginBottom: 15 }}>
                    <Card.Title>Trigger Filter</Card.Title>
                    {Array.from(knownTriggers.entries()).sort().map(([k, v], index) =>
                        <ListItem
                            key={k}
                            topDivider={index !== 0}
                        >
                            <ListItem.Content>
                                <ListItem.Title>{v}</ListItem.Title>
                            </ListItem.Content>
                            <ListItem.CheckBox
                                checked={!blacklist.has(k)}
                                onPress={() => toggle(k)}
                            />
                        </ListItem>
                    )}
                    {knownTriggers.size === 0 ? emptyMessage : null}
                </Card>
            </ScrollView>
        </View >
    );
}
