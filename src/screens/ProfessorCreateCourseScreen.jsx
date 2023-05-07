import React from 'react';
import { StyleSheet,Text,View,ToastAndroid } from 'react-native';

import { TextInput } from 'react-native-paper';
import { Button } from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

export default function CreateCourseScreen( {navigation, route} ) {

    const uid  = route.params.uid;
    const [courseName, setCourseName] = React.useState('');

    const handleCreateCourse = async () => {

        if (courseName == '') {
            ToastAndroid.show("Course name cannot be empty", ToastAndroid.SHORT);
            return;
        }

        if (courseName.length > 25) {
            ToastAndroid.show("Course name cannot be more than 25 characters", ToastAndroid.SHORT);
            return;
        }

        const courseCode = generateCourseCode();
        const courseRef = firestore().collection('courses').doc(courseCode);
        //if the course code already exists, generate a new one
        if (await courseRef.get().exists) {
            handleCreateCourse();
            return;
        }

        await courseRef.set({
            courseName: courseName,
            courseCode: courseCode,
            professorUID: uid,
            studentsEnrolled: [],
        });

        await courseRef.collection('attendance').doc('attendanceData').set({
            totalAttendanceEvents: 0,
        });
        const professorRef = firestore().collection('users').doc(uid);
        const professorData = await professorRef.get();
        //Add a object to the coursesInvolved array in the professor's document, with each new index having 'courseCode' and it's value, and courseName and it's value.
        await professorRef.update({
            coursesInvolved: [...professorData.data().coursesInvolved, {courseCode: courseCode, courseName: courseName}],
        
        });

        ToastAndroid.show("Course created successfully", ToastAndroid.SHORT);
        navigation.navigate("Professor Home", {uid: uid}); 
    }


    const generateCourseCode = () => {
        //returns a string of any letters (lowercase or capital) or numbers, of size 28.
        let courseCode = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < 28; i++ ) {
            courseCode += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return courseCode;
    }


return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'}}>
            <Text>Create Course Screen</Text>
            <TextInput
                style={style.textinput}
                label="Course Name"
                left={<TextInput.Icon icon="pencil" />}
                value={courseName}
                onChangeText={setCourseName}
                mode="outlined"
                selectionColor="#0000FF"
                outlineColor='gainsboro'
                activeOutlineColor='#0000FF'  
            />
            <Button
                style={style.button}
                mode="contained"
                onPress={ () => handleCreateCourse() }
            >Create Course</Button>
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
    }
  })
