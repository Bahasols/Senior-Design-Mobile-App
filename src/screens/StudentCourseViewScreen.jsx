import React, { useState } from 'react';
import { StyleSheet, Text, View, ToastAndroid, PermissionsAndroid } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';

export default function StudentCourseViewScreen({ navigation, route }) {

    const courseCode = route.params.courseCode;
    const uid = route.params.uid;
    const courseName = route.params.courseName;
    
    const [code, setCode] = useState('');

    let isOnEmulator = async () => {
        let isEmulator = await DeviceInfo.isEmulator();
        if(isEmulator){
          ToastAndroid.show('Running on Emulator (Deny User from submitting attendance)', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Running on Device', ToastAndroid.SHORT);
        }
      }

    let getGeolocationPermission = async () => {
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

    let getGeolocation = () => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            console.log(position);
            resolve(position);
          },
          (error) => {
             console.log(error.code, error.message);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    };
      
      
    let submitAttendance = async () => {

      let geolocation = await getGeolocation();

      let hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (!hasPermission) {
          console.log('Has Geolocation Permission Disabled');
          ToastAndroid.show('Please enable geolocation permission', ToastAndroid.SHORT);
          return;
      }
      
      if(code == ''){
          ToastAndroid.show('Please enter a code', ToastAndroid.SHORT);
          return;
      }
        
        let attendanceRef = firestore().collection('courses').doc(courseCode).collection('attendance').orderBy('startTime', 'desc').limit(1);
        let attendanceDoc = await attendanceRef.get();
        let attendanceStartTime = attendanceDoc.docs[0].data().startTime.toDate().toString();
        let attendanceEndTime = attendanceDoc.docs[0].data().endTime.toDate().toString();

        console.log("Date of most recent Attendance Event Start Time:" + attendanceStartTime);

        let currentTime = new Date().toString();
        
        if(currentTime > attendanceStartTime && currentTime < attendanceEndTime){
            console.log('Attendance is open');
        } else {
            console.log('Attendance is closed');
            ToastAndroid.show('Attendance is closed', ToastAndroid.SHORT);
            return;
        }

        if(code == attendanceDoc.docs[0].data().code){ 
            console.log('Code is correct');

        } else {
            console.log('Code is incorrect');
            ToastAndroid.show('Code is incorrect', ToastAndroid.SHORT);
            return;
        }

        let attendanceStatus = attendanceDoc.docs[0].data().attendanceStatus;

        if(attendanceStatus[uid] == true){
            ToastAndroid.show('Attendance already submitted', ToastAndroid.SHORT);
            return;
        }

        attendanceStatus[uid] = true;

        let attendanceDocRef = attendanceDoc.docs[0].ref;
        await attendanceDocRef.update({ attendanceStatus: attendanceStatus });

        let geolocationField = attendanceDoc.docs[0].data().geolocation;
        
        geolocationField[uid] = geolocation;
        await attendanceDocRef.update({ geolocation: geolocationField });

      }
      
    return (
        <View>
            <Text>Student Course View Screen</Text>
            <Text>Course Name: {courseName}</Text>
            <Text>Course Code: {courseCode}</Text>
            <Text>Student UID: {uid}</Text>

            <TextInput
            style={style.textinput}
            label="Code"
            left={<TextInput.Icon icon="lock" />}
            value={code}
            onChangeText={setCode}
            mode="outlined"
            selectionColor="#0000FF"
            outlineColor='gainsboro'
            activeOutlineColor='#0000FF'
            maxLength={6}
            />
            <Button 
                style={style.button}
                mode="contained"
                onPress={() => submitAttendance()}
                >Submit Attendance
            </Button>
            <Button 
                style={style.button}
                mode="contained"
                onPress={() => getGeolocationPermission()}
                >TEST: Has Geolocation Permission?
            </Button>
            <Button
                style={style.button}
                mode="contained"
                onPress={() => getGeolocation()}
                >TEST: Get Geolocation
            </Button>
            <Button
                style={style.button}
                mode="contained"
                onPress={() => isOnEmulator()}
                >TEST: On Emulator?
            </Button>
        </View>
    )
}

const style = StyleSheet.create({
    textinput: {
        width: '95%',
        alignSelf: 'center',
    },
    button: {
      width: '95%',
      backgroundColor: '#0000FF',
      marginTop: 10,
        alignSelf: 'center',
    }
  })
  


