import React, { useState, useEffect } from 'react';
import { View, Text, FlatList} from 'react-native';
import { Button} from 'react-native-paper';

import firebaseConfig from '../firebase-config';
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
  
    const getUserData = async (uid) => {
      const doc = await firestore()
        .collection('users')
        .doc(uid)
        .get();
      return doc.data();
    };
  
    return (
        <View>
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
      