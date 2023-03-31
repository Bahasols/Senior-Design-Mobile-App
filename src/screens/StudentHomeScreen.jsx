import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Colors, TouchableOpacity, ToastAndroid, Pressable, PermissionsAndroid} from 'react-native';

import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import Geolocation from 'react-native-geolocation-service';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

let getPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This App needs access to your location',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Location permission granted');
    } else {
      console.log('Location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

let getLocation = () => {
  Geolocation.getCurrentPosition(
    (position) => {
      console.log(position);
    },
    (error) => {
      // See error code charts below.
      console.log(error.code, error.message);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
};

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
      <Button style={style.button} mode="contained" onPress={() => getPermission()}>TEST: Get Location Permission</Button>
      <Button style={style.button} mode="contained" onPress={() => getLocation()}>TEST: Get Location</Button>
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
          <Text style={{ fontSize: 10, fontStyle: 'italic' }}>{course.courseCode}</Text>
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
