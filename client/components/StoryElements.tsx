import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet } from 'react-native';

import { Alert } from 'react-native'
import { Text, Tooltip } from 'react-native-elements'

export const isAuthorTextEmpty = (story) => !story.author

export const AuthorText = (props) => {

    // if (isAuthorTextEmpty(props.story)) return null;

    const text = `Author: ${props.story.author ? props.story.author : "Anonymous"}`

    return (
        <Text {...props}>{text}</Text>
    )
};

export const isTWTextEmpty = (story) => story.trigger_warnings.length == 0

export const TWText = (props) => {

    if (isTWTextEmpty(props.story)) return null;

    const text = "TW: " + props.story.trigger_warnings.map(x => x.value).join(', ')
    // <Text>You can filter out specific triggers in the settings.</Text>

    return (
        <Text {...props} onPress={
            () => Alert.alert(null, "Go to settings to filter out specific triggers.", null, { cancelable: true })
        }
        >{text}</Text>
    )
};

