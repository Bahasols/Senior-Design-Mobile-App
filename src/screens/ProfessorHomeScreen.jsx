import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Colors,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function ProfessorHomeScreen({ navigation, route }) {
  const uid = route.params.uid;

  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot((doc) => {
        setUserDoc(doc.data());
      });

    return unsubscribe;
  }, []);

  const handleCoursePress = (courseCode, courseName) => {
    navigation.navigate('Professor Course View', {
      courseCode: courseCode,
      uid: uid,
      courseName: courseName,
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'flex-end',
      }}
    >
      <Button
        style={style.button}
        mode="contained"
        onPress={() => navigation.navigate('Create Course', { uid: uid })}
      >
        Create Course
      </Button>

      {userDoc && (
        <ScrollView style={{ width: '100%' }}>
          {userDoc.coursesInvolved.map((course) => (
            <Button
              key={course.courseCode}
              style={style.courseButton}
              labelStyle={{ color: 'black' }}
              onPress={() => handleCoursePress(course.courseCode, course.courseName)}
              contentStyle={{ flexWrap: 'wrap' }}
            >
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                {course.courseName}
              </Text>
              <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
                {course.courseCode}
              </Text>
            </Button>
          ))}
        </ScrollView>
      )}
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
  },
  courseButton: {
    width: '95%',
    marginBottom: 10,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center', 
    paddingLeft: 10,
  },
  
});
