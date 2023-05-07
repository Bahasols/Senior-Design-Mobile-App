import React from 'react';
import {StyleSheet,Text,View,ToastAndroid} from 'react-native';

import { TextInput } from 'react-native-paper';
import { Button } from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

export default function JoinCourseScreen( {navigation, route} ) {

    const uid  = route.params.uid;

    const [courseCode, setCourseCode] = React.useState('');


    const handleJoinCourse = () => {
      // Check if course exists
      firestore()
        .collection('courses')
        .doc(courseCode)
        .get()
        .then((doc) => {
          if (doc.exists) {
            // Check if user is already enrolled in course
            if (doc.data().studentsEnrolled.includes(uid)) {
              ToastAndroid.show(
                'You are already enrolled in this course',ToastAndroid.SHORT,
              );
              return;
            }
            // Add user to course
            firestore()
              .collection('courses')
              .doc(courseCode)
              .update({
                studentsEnrolled: [...doc.data().studentsEnrolled, uid],
              });
    
            // Add course to user
            firestore()
              .collection('users')
              .doc(uid)
              .get()
              .then((userDoc) => {
                const coursesInvolved = userDoc.data().coursesInvolved || []; 
                coursesInvolved.push({
                  courseCode: courseCode,
                  courseName: doc.data().courseName,
                });
                firestore()
                  .collection('users')
                  .doc(uid)
                  .update({
                    coursesInvolved: coursesInvolved,
                  });
                ToastAndroid.show(
                  'Course joined successfully',
                  ToastAndroid.SHORT,
                );
                navigation.navigate('Student Home', { uid: uid });
              })
              .catch((error) => {
                ToastAndroid.show('Error joining course', ToastAndroid.SHORT);
              });
          } else {
            ToastAndroid.show('Course does not exist', ToastAndroid.SHORT);
          }
        })
        .catch((error) => {
          ToastAndroid.show('Error joining course', ToastAndroid.SHORT);
        });
    };
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'}}>
          <Text>Join Course Screen</Text>
          <TextInput
              style={style.textinput}
              label="Course Code"
              left={<TextInput.Icon icon="pencil" />}
              value={courseCode}
              onChangeText={setCourseCode}
              mode="outlined"
              selectionColor="#0000FF"
              outlineColor='gainsboro'
              activeOutlineColor='#0000FF'  
          />
          <Button
              style={style.button}
              mode="contained"
              onPress={ () => handleJoinCourse() }
          >Join Course</Button>
          
          
      </View>
  );
}

const style = StyleSheet.create({
    textinput: {
      width: '95%',
      marginBottom: 10,
    },
    button: {
      width: '95%',
      backgroundColor: '#0000FF',
      marginBottom: 10,
      color: 'orange',
    },
    courseButton: {
      width: '95%',
      marginBottom: 10,
      backgroundColor: 'white',
      borderColor: 'black',
      borderWidth: 1,
    },
  });
  