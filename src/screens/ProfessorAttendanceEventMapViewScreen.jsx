import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, FlatListProps, TouchableOpacity, Platform} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';

export default function ProfessorAttendanceEventMapViewScreen({ navigation, route }) {
    const { courseCode, uid, courseName, totalAttendanceEvents, eventID, event } = route.params;
    const [geolocationData, setGeolocationData] = useState(null);
    const [studentMarkers, setStudentMarkers] = useState([]);

    useEffect(() => {
        getGeolocation();
        getStudentMarkers();
    }, []);

    let getGeolocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                setGeolocationData(position);
                console.log(position);
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    let getStudentMarkers = async () => {
        const geolocationRef = firestore().collection('courses').doc(courseCode).collection('attendance').doc(eventID.toLocaleString());
        const geolocationDoc = await geolocationRef.get();
        const geolocationData = geolocationDoc.data().geolocation;
        const studentMarkers = [];

        for (const [studentUID, studentGeolocation] of Object.entries(geolocationData)) {
            if (studentGeolocation.coords) {
                const userRef = firestore().collection('users').doc(studentUID);
                const userDoc = await userRef.get();
                const userName = userDoc.data().name;
                const studentMarker = {
                    latitude: studentGeolocation.coords.latitude,
                    longitude: studentGeolocation.coords.longitude,
                    title: userName,
                    color: 'red',
                };
                studentMarkers.push(studentMarker);
            }
        }
        setStudentMarkers(studentMarkers);
    };

    return (
        <View style={styles.container}>
            <Text>Course Name {courseName}</Text>
            <Text>Total Attendance Events: {totalAttendanceEvents}</Text>
            <Text>Professor UID: {uid}</Text>
            <Text>Course Code: {courseCode}</Text>
            <Text>Event ID: {eventID.toLocaleString()}</Text>
            <Text>Event Start Time: {event.startTime.toDate().toLocaleString()}</Text>
        
            <MapView style={styles.map}
                initialRegion={geolocationData && {
                    latitude: geolocationData.coords.latitude,
                    longitude: geolocationData.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {geolocationData && (
                    <Marker
                        coordinate={{
                            latitude: geolocationData.coords.latitude,
                            longitude: geolocationData.coords.longitude,
                        }}
                        title='Professor location'
                        pinColor='blue'
                    />
                )}
                {studentMarkers.map((marker, index) => (
                    <Marker key={index} coordinate={marker} title={marker.title} pinColor={marker.color} />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    map: {
      width: '100%',
      height: '100%',
    },
    animatedMap: {
      width: '100%',
      height: '100%',
    },
    markerIcon: {
      width: 30,
      height: 30,
    },
    marker: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    professorMarker: {
      borderColor: 'blue',
    },
    studentMarker: {
      borderColor: 'red',
    },
    callout: {
      width: 100,
    },
    calloutText: {
      textAlign: 'center',
    },
  });