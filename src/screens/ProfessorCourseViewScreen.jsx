import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';


const createAttendanceEvent = async (courseCode, setAttendanceEventInfo, duration) => {
  const attendanceStart = firebase.firestore.Timestamp.now();
  const attendanceEnd = new firebase.firestore.Timestamp(
    attendanceStart.seconds + duration,
    attendanceStart.nanoseconds
  );
  const docName = attendanceStart.toDate().toLocaleString();

  const code = generateCode();

  try {
    const courseDoc = await firestore()
      .collection('courses')
      .doc(courseCode)
      .get();
    const enrolledStudents = courseDoc.data().studentsEnrolled;
    const attendanceDoc = firestore()
      .collection('courses')
      .doc(courseCode)
      .collection('attendance')
      .doc(attendanceStart.toString());

    const attendanceStatusObj = {};
    const geolocationObj = {}; // create an empty object for geolocation

    // create an empty object for each UID in the geolocationObj
    enrolledStudents.forEach((studentUID) => {
      geolocationObj[studentUID] = {};
      attendanceStatusObj[studentUID] = false;
    });

    await attendanceDoc.set({
      startTime: attendanceStart,
      endTime: attendanceEnd,
      code: code,
      attendanceStatus: attendanceStatusObj,
      geolocation: geolocationObj // set geolocationObj in the attendance document
    });
    console.log('Attendance Event Created');
  } catch (error) {
    console.error(error);
  }

  try {
    await firestore()
      .collection('courses')
      .doc(courseCode)
      .collection('attendance')
      .doc('attendanceData')
      .update({
        totalAttendanceEvents: firebase.firestore.FieldValue.increment(1),
      });
    console.log('Attendance Event Count Updated');
  } catch (error) {
    console.error(error);
  }

  const startTime = attendanceStart.toDate().toLocaleString();
  const endTime = attendanceEnd.toDate().toLocaleString();

  setAttendanceEventInfo({ code, startTime, endTime });
};


const generateCode = () => {
  //generate a random 6 digit code of lowercase numbers and letters
  const code = Math.random().toString(36).substring(2, 8);
  return code;
};

export default function ProfessorCourseViewScreen({ navigation, route }) {
  const [attendanceEventInfo, setAttendanceEventInfo] = useState({});
  const { courseCode, uid, courseName } = route.params;
  const [duration, setDuration] = useState('');

  const [showCode, setShowCode] = useState(false);

  const startAttendanceEvent = async () => {
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || duration.trim() === '') {
      alert('Your input must be a postive number between 1 and 600 seconds.');
      return;
    } else if (parsedDuration <= 0) {
      alert('Please enter a positive number');
      return;
    } else if (parsedDuration > 600) {
      alert('Please enter a number less than 600');
      return;
    }
    await createAttendanceEvent(courseCode, setAttendanceEventInfo, parsedDuration);
    setShowCode(true);
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Professor Course View Screen</Text>
      <Text>Course Code: {courseCode}</Text>
      <Text>Professor UID: {uid}</Text>
      <Text>Course Name: {courseName}</Text>

      <Button
        style={styles.button}
        mode="contained"
        onPress={startAttendanceEvent}
      >
        Collect Attendance
      </Button>
      <TextInput
            style={styles.textinput}
            label="Time (seconds)"
            left={<TextInput.Icon icon="clock" />}
            value={duration}
            onChangeText={setDuration}
            mode="outlined"
            selectionColor="#0000FF"
            outlineColor='gainsboro'
            activeOutlineColor='#0000FF'
          />


      {showCode && (
        <View style={styles.qrContainer}>
          <Text style={styles.codeText}>
            The code is {attendanceEventInfo.code}.
          </ Text>
          <Text style={styles.infoText}>
            The attendance event starts at {attendanceEventInfo.startTime} and
            ends at {attendanceEventInfo.endTime}.
          </Text>
          </View>
      )}

     
      <Button
        style={styles.bottomButton}
        mode="contained"
        onPress={() => navigation.navigate('Professor Attendance View', {uid, courseCode, courseName})}
      >
        View Attendance Events
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    width: '95%',
    backgroundColor: '#0000FF',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  textinput: {
    width: '95%',
    marginBottom: 10,
  },
  bottomButton: {
    width: '95%',
    backgroundColor: '#0000FF',
    marginTop: 300,

  },

});
