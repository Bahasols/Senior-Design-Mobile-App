import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, FlatListProps, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

export default function ProfessorAttendanceViewScreen({ navigation, route }) {
  const { courseCode, uid, courseName } = route.params;
  const [studentsEnrolled, setStudentsEnrolled] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalAttendanceEvents, setTotalAttendanceEvents] = useState(0);
  const [studentAttendance, setStudentAttendance] = useState([]);

  useEffect(() => {
    const courseRef = firestore()
      .collection('courses')
      .doc(courseCode);

    const unsubscribeStudents = courseRef.onSnapshot((doc) => {
      setStudentsEnrolled(doc.data().studentsEnrolled);
    });

    const unsubscribeAttendance = courseRef.collection('attendance')
      .where('startTime', '!=', null)
      .onSnapshot((querySnapshot) => {
        const data = [];
        let totalEvents = 0;
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
          totalEvents++;
        });
        setAttendanceData(data);
        setTotalAttendanceEvents(totalEvents);
      });

    return () => {
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, []);

  useEffect(() => {
    const getAttendanceCounts = async () => {
      const counts = await Promise.all(studentsEnrolled.map(async (studentUID) => {
        const studentRef = firestore().collection('users').doc(studentUID);
        const studentDoc = await studentRef.get();
        const studentName = studentDoc.data().name;
        const attendanceDoc = await firestore()
          .collection('courses')
          .doc(courseCode)
          .collection('attendance')
          .doc('attendanceData')
          .get();
        const totalEvents = attendanceDoc.data().totalAttendanceEvents;
        const attendanceQuerySnapshot = await firestore()
          .collection('courses')
          .doc(courseCode)
          .collection('attendance')
          .where('startTime', '!=', null)
          .get();
        let attendedClasses = 0;
        attendanceQuerySnapshot.forEach((doc) => {
          const attendanceStatus = doc.data().attendanceStatus;
          if (attendanceStatus && attendanceStatus[studentUID]) {
            if (attendanceStatus[studentUID]) {
              attendedClasses++;
            }
          }
        });
        return {
          studentUID,
          studentName,
          attendedClasses,
          totalEvents,
        };
      }));
      setStudentAttendance(counts);
    };
    getAttendanceCounts();
  }, [studentsEnrolled]);

  
    return (
      <View style={[styles.container, { height: 400 }]}>
 
      

        <Text style={styles.title}>{courseName}</Text>

        <FlatList style={{height: 75}}
        data={studentAttendance}
        keyExtractor={(item) => item.studentUID}
        renderItem={({ item }) => (
            <Text>{item.studentName}: {item.attendedClasses} / {item.totalEvents}</Text>
        )}
      />
      
        <Text>Total Attendance Events: {totalAttendanceEvents}</Text>
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Professor Attendance Event View", {uid, courseCode, courseName, totalAttendanceEvents, eventID: item.id, event: item})}>
              <Text>{item.startTime.toDate().toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
  

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#DDDDDD',
        marginVertical: 5,
        minWidth: 200,
    },
});