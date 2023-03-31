import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, FlatListProps, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

export default function ProfessorAttendanceEventViewScreen({ navigation, route }) {
    const { courseCode, uid, courseName, totalAttendanceEvents, eventID, event } = route.params;
    const [students, setStudents] = useState([]);
  
    useEffect(() => {
      const unsubscribe = firestore()
        .collection('courses')
        .doc(courseCode)
        .collection('attendance')
        .doc(eventID.toLocaleString())
        .onSnapshot((doc) => {
          const attendanceStatus = doc.data()?.attendanceStatus;
          const studentsUIDs = Object.keys(attendanceStatus || {});
          const promises = studentsUIDs.map((uid) => {
            return getUserData(uid).then((userData) => {
              return {
                uid: uid,
                name: userData?.name || '',
                present: attendanceStatus?.[uid] || false,
                geolocation: doc.data()?.geolocation?.[uid] || null,
              };
            });
          });
          Promise.all(promises).then(setStudents);
        });
  
      return () => unsubscribe();
    }, []);
  
    const getUserData = (uid) => {
      return firestore()
        .collection('users')
        .doc(uid)
        .get()
        .then((doc) => {
          return doc.data();
        });
    };
  
    const markAttendance = (uid, present) => {
      firestore()
        .collection('courses')
        .doc(courseCode)
        .collection('attendance')
        .doc(eventID.toLocaleString())
        .update({
          [`attendanceStatus.${uid}`]: present,
        })
        .then(() => console.log('Attendance marked successfully'))
        .catch((error) => console.log('Error marking attendance:', error));
    };
  
    const renderStudentItem = ({ item }) => (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1 }}>{item.name}: </Text>
          <Text style={{ fontWeight: 'bold', color: item.present ? 'green' : 'red' }}>
            {item.present ? 'Present' : 'Absent'}
          </Text>
          {item.present && item.geolocation && (
            <View style={{ marginLeft: 10 }}>
              <Text>Latitude: {item.geolocation?.coords?.latitude}</Text>
              <Text>Longitude: {item.geolocation?.coords?.longitude}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Button
            mode="contained"
            onPress={() => markAttendance(item.uid, true)}
            style={{ marginRight: 10 }}
          >
            Mark Present
          </Button>
          <Button mode="contained" onPress={() => markAttendance(item.uid, false)}>
            Mark Absent
          </Button>
        </View>
      </View>
    );

    return (
        <View>
          <Text>Course Name {courseName}</Text>
          <Text>Total Attendance Events: {totalAttendanceEvents}</Text>
          <Text>Professor UID: {uid}</Text>
          <Text>Course Code: {courseCode}</Text>
          <Text>Event ID: {eventID.toLocaleString()}</Text>
          <Text>Event Start Time: {event.startTime.toDate().toLocaleString()}</Text>

          <Button mode='contained' onPress={() => navigation.navigate("Professor Attendance Event Map View", { courseCode, uid, courseName, totalAttendanceEvents, eventID, event })}>View Map</Button>
          <FlatList
            data={students}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'column', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 1 }}>{item.name}: </Text>
                  <Text style={{ fontWeight: 'bold', color: item.present ? 'green' : 'red' }}>
                    {item.present ? 'Present' : 'Absent'}
                  </Text>
                  {item.present && item.geolocation && (
                    <View style={{ marginLeft: 10 }}>
                      <Text>Latitude: {item.geolocation?.coords?.latitude}</Text>
                      <Text>Longitude: {item.geolocation?.coords?.longitude}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Button
                    mode="outlined"
                    style={{ marginRight: 10 }}
                    onPress={() => {
                      const newStudents = [...students];
                      const index = newStudents.findIndex((s) => s.uid === item.uid);
                      newStudents[index].present = true;
                      firestore()
                        .collection('courses')
                        .doc(courseCode)
                        .collection('attendance')
                        .doc(eventID.toLocaleString())
                        .update({
                          [`attendanceStatus.${item.uid}`]: true,
                        });
                      setStudents(newStudents);
                    }}
                  >
                    Mark Present
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      const newStudents = [...students];
                      const index = newStudents.findIndex((s) => s.uid === item.uid);
                      newStudents[index].present = false;
                      firestore()
                        .collection('courses')
                        .doc(courseCode)
                        .collection('attendance')
                        .doc(eventID.toLocaleString())
                        .update({
                          [`attendanceStatus.${item.uid}`]: false,
                        });
                      setStudents(newStudents);
                    }}
                  >
                    Mark Absent
                  </Button>
                </View>
              </View>
            )}
          />
        </View>
      );
    

}
      