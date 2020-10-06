import React, { useEffect, useState, useContext } from 'react';
import { Marker } from 'react-native-maps'
import { oxfordRegion } from './constants';

const carfax = {
    latitude: oxfordRegion.latitude,
    longitude: oxfordRegion.longitude
}

class Portal {
    blueCoords = carfax
    orangeCoords = carfax

    setOrange(coords) {
        if (coords.latitude && coords.longitude) {
            this.orangeCoords = coords
        }
    }

    setBlue(coords) {
        if (coords.latitude && coords.longitude) {
            this.blueCoords = coords
        }
    }

    teleport(location) {
        if (!location) return location;
        return {
            ...location,
            coords: {
                latitude: location.coords.latitude + this.blueCoords.latitude - this.orangeCoords.latitude,
                longitude: location.coords.longitude + this.blueCoords.longitude - this.orangeCoords.longitude
            },
        }
    }
}

export const portal = new Portal();

export const teleportedMarker = (location) => {
    if (!location) return null;
    return <Marker
        key='user'
        coordinate={location.coords}
        opacity={1}
        pinColor='yellow'
    />
}

export const orangeMarker = <Marker
    key='orange'
    coordinate={carfax}
    opacity={0.75}
    pinColor='orange'
    draggable
    onDrag={(e) => portal.setOrange(e.nativeEvent.coordinate)}
/>

export const blueMarker = <Marker
    key='blue'
    coordinate={carfax}
    opacity={0.75}
    pinColor='blue'
    draggable
    onDrag={(e) => portal.setBlue(e.nativeEvent.coordinate)}
/>


