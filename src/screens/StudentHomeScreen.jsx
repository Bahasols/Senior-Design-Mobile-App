import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

export default function StudentHomeScreen({ navigation, route }) {
  const uid = route.params.uid;

  const [courses, setCourses] = React.useState([]);

  React.useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot((doc) => {
        const coursesInvolved = doc.data().coursesInvolved || [];
        const coursesData = coursesInvolved.map((course) => ({
          courseCode: course.courseCode,
          courseName: course.courseName,
        }));
        setCourses(coursesData);
      });

    return () => {
      unsubscribe();
    };
  }, [uid]);

  return (
    <SafeAreaView
      style={{flex: 1,justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end',}}
      >
      <Button style={style.button} mode="contained" onPress={() => navigation.navigate("Join Course", { uid: uid })}>Join Course</Button>
      <ScrollView style={{ width: '100%' }}>
        {courses.map((course, index) => (
          <Button
          key={index}
          style={style.courseButton}
          contentStyle={{ width: '95%' }}
          labelStyle={{ color: 'black' }}
          onPress={() => navigation.navigate("Student Course View", { courseCode: course.courseCode, uid: uid, courseName: course.courseName })}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{course.courseName}</Text>
          <Text style={{ fontSize: 10, fontStyle: 'italic' }}> - {course.courseCode}</Text>
        </Button>
        
        ))}
      </ScrollView>
    </SafeAreaView>
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
    borderRadius: 20,
    marginTop: 10,
  },
  courseButton: {
    width: '95%',
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center', 
    marginLeft: 10,
  },
  
});
