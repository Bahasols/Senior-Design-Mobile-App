import * as React from 'react';
import { Button, View, Text, TextInputStyleSheet, StyleSheet, TextInput, SafeAreaView, StatusBar, TouchableOpacity, Platform} from 'react-native';


import {db} from './firebase/firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc, getDocs, collection, query, where, DocumentReference, addDoc, documentId, } from "firebase/firestore/lite";
import { authentication } from './firebase/firebase-config';
import { auth } from './firebase/firebase-config';


import { CheckBox } from '@rneui/base';

import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator} from '@react-navigation/stack';
import { createNativeStackNavigator} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Route } from '@react-navigation/native';




function LoginScreen({ navigation }) {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const SignInUser = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const userUID = user.uid;
        console.log(user.uid);
        const userRef = doc(db, 'users', user.uid);
        getDoc(userRef).then((doc) => {
          if (doc.exists()) {
            navigation.navigate('Home', {userUID: userUID, userRef: userRef});
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        ).catch((error) => {
          console.log("Error getting document:", error);
        }
        );

      }
      )
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
      });
  }


    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login Screen</Text>
        <TextInput placeholder='Email' value={email} onChangeText={(text) => setEmail(text)} keyboardType='ascii-capable' />
        <TextInput placeholder='Password' value={password} onChangeText={(text) => setPassword(text)} />
        <Button title='Login' onPress={SignInUser} />
        <Text>Don't have an account? Register below.</Text>
        <Button title='Register' onPress={() => navigation.navigate('Register')} />
      </View>
    );
  }










  function RegisterScreen({ navigation }) {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [isProfessor, setIsProfessor] = React.useState(false);
  
    const RegisterUser = () => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          console.log(user.uid);
          //add the user to the users collection in firestore
          const userRef = doc(db, 'users', user.uid);
          setDoc(userRef, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            isProfessor: isProfessor,
            coursesInvolved: [],
            accountCreated: userCredential.user.metadata.creationTime,
          });
        }
        )
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode);
          console.log(errorMessage);
        }
        );
    }
  

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Create an account.</Text>
        <TextInput placeholder='Email' value={email} onChangeText={(text) => setEmail(text)} keyboardType='ascii-capable' />
        <TextInput placeholder='Password' value={password} onChangeText={(text) => setPassword(text)} />
        <TextInput placeholder='First Name' value={firstName} onChangeText={(text) => setFirstName(text)} />
        <TextInput placeholder='Last Name' value={lastName} onChangeText={(text) => setLastName(text)} />
        <CheckBox title='Are you a Professor?' checked={isProfessor} onPress={() => setIsProfessor(!isProfessor) } />
        <Button title='Register' onPress={RegisterUser} />
  
      </View>
    );
  
  }






  function HomeScreen({ route, navigation }) {

    const { userUID, userRef } = route.params;

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');

    const [isProfessor, setIsProfessor] = React.useState(false);

    const [coursesInvolved, setCoursesInvolved] = React.useState([]);
    const [coursesInvolvedNames, setCoursesInvolvedNames] = React.useState([]);



    const getUserInfo = () => {
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          setFirstName(doc.data().firstName);
          setLastName(doc.data().lastName);
          setIsProfessor(doc.data().isProfessor);
        } else {
          console.log("No such document!");
        }
      }
      ).catch((error) => {
        console.log("Error getting document:", error);
      }
      );
    }

    const getCoursesInvolved = () => {
      //for both professors and students, get the courseCodes from the coursesInvolved array in the user's document.
      
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          setCoursesInvolved(doc.data().coursesInvolved);
          
        } else {
          console.log("No such document!");
        }
      }
      ).catch((error) => {
        console.log("Error getting document:", error);
      }
      );
    }

    const getCoursesInvolvedNames = () => {

      coursesInvolved.forEach((courseCode) => {
        const courseRef = doc(db, 'courses', courseCode);
        getDoc(courseRef).then((doc) => {
          if (doc.exists()) {
            setCoursesInvolvedNames((coursesInvolvedNames) => [...coursesInvolvedNames, doc.data().courseName]);

          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        ).catch((error) => {
          console.log("Error getting document:", error);
        }
        );
      }
      );
    }

    React.useEffect(() => {
      getUserInfo();
    }, []);


    //the course screen only shows if you save App.js while already on this screen, need to fix
    React.useEffect(() => {
      getCoursesInvolved();
      getCoursesInvolvedNames();
    }, []);



    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Welcome {firstName} {lastName}!</Text>
        <Text>Your UID is {userUID}.</Text>
        <Text>You are a {isProfessor ? 'Professor' : 'Student'}.</Text>

        <Text></Text>

        {isProfessor ? <Button title='Create a Course' onPress={() => navigation.navigate('CreateCourse', {userUID: userUID, userRef: userRef})} /> : null}
        {!isProfessor ? <Button title='Join a Course' onPress={() => navigation.navigate('JoinCourse', {userUID: userUID, userRef: userRef})} /> : null}

        <Text></Text>

        <Text>Your courses:</Text>



        {
        coursesInvolvedNames.filter((v, i, a) => a.indexOf(v) === i).map((courseName) => {
          return (
            <View key={courseName}>
              <Text></Text>

              {/*this really should also pass in the courseCode, but it can still be accessed from userRef in the course screen*/}
              <Button title={courseName} onPress={() => navigation.navigate('Course', {userUID: userUID, userRef: userRef, courseName: courseName})} />
            </View>
          );
        }
        )
        }


      
        





      </View>
    );
  }




  function CreateCourseScreen({ route, navigation }) {
    //just display a text that says WIP
    const { userUID, userRef } = route.params;

    const [courseName, setCourseName] = React.useState('');
    const [courseCode, setCourseCode] = React.useState('');

    const [professorEmail, setProfessorEmail] = React.useState('');
    const [professorFirstName, setProfessorFirstName] = React.useState('');
    const [professorLastName, setProfessorLastName] = React.useState('');

    //get the professor's first and last name, and email
    const getProfessorInfo = () => {
      getDoc(userRef).then((doc) => {
        if (doc.exists()) {
          setProfessorFirstName(doc.data().firstName);
          setProfessorLastName(doc.data().lastName);
          setProfessorEmail(doc.data().email);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }
      ).catch((error) => {
        console.log("Error getting document:", error);
      }
      );
    }

    const createCourse = () => {
      //create a course in the courses collection with id of courseCode
      const courseRef = doc(db, 'courses', courseCode);
      setDoc(courseRef, {
        courseName: courseName,
        courseCode: courseCode,
        professorEmail: professorEmail,
        professorFirstName: professorFirstName,
        professorLastName: professorLastName,
        professorUID: userUID,
        studentsEnrolled: [],
      });

      //add the course to the professor's coursesInvolved array
      updateDoc(userRef, {
        coursesInvolved: arrayUnion(courseCode),
      });


      //add an entry to the attendance collection with id of courseCode
      const attendanceRef = doc(db, 'attendance', courseCode);
      setDoc(attendanceRef, {
        courseCode: courseCode,
        courseName: courseName,
      });

    }

    React.useEffect(() => {
      getProfessorInfo();
    }, []);

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput placeholder='Course Name' value={courseName} onChangeText={(text) => setCourseName(text)} />
        <TextInput placeholder='Course Code' value={courseCode} onChangeText={(text) => setCourseCode(text)} />
        <Button title='Create Course' onPress={createCourse} />
      </View>
    );
    }





    function JoinCourseScreen({ route, navigation }) {
      //just display a text that says WIP
      const { userUID, userRef } = route.params;
  
      //default state is code since if it's empty then a course reference fails since the document ends in "" 
      const [courseCode, setCourseCode] = React.useState('Code');
  


      const test = () => {
        console.log(courseCode);
        //create a ref to the course
        const courseRef = doc(db, 'courses', courseCode);
        //get the course document
        getDoc(courseRef).then((doc) => {
          if (doc.exists()) {
            //add the course to the student's coursesInvolved array
            updateDoc(userRef, {
              coursesInvolved: arrayUnion(courseCode),
            });

            //add the student to the course's studentsEnrolled array
            updateDoc(courseRef, {
              studentsEnrolled: arrayUnion(userUID),
            });
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        ).catch((error) => {
          console.log("Error getting document:", error);
        }
        );

        //Since the default state of courseCode is 'code' it adds that the student to that placeholder course. Leaving courseCode as an empty string causes the app to crash since that's a null document reference. Fix later.
        updateDoc(userRef, {
          coursesInvolved: arrayRemove('code'),
        });

      }



      React.useEffect(() => {
        test();
      }, []);


      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <TextInput placeholder='Course Code' value={courseCode} onChangeText={(text) => setCourseCode(text)} />
          <Button title='Join Course' onPress={test} />
        </View>
      );
      }

    
















    function CourseScreen ({ route, navigation }) {
      //just display a text that says WIP
      const { userUID, userRef, courseName } = route.params;
  
      //get the course code from the course name
      const [courseCode, setCourseCode] = React.useState('');

      const [isProfessor, setIsProfessor] = React.useState(false);


      const getCourseCode = () => {
        const courseRef = query(collection(db, 'courses'), where('courseName', '==', courseName));
        getDocs(courseRef).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setCourseCode(doc.data().courseCode);
          });
        });
      }

      const getUserInfo = () => {
        getDoc(userRef).then((doc) => {
          if (doc.exists()) {
            setIsProfessor(doc.data().isProfessor);
            console.log(doc.data().isProfessor);
          } else {
            console.log("No such document!");
          }
        }
        ).catch((error) => {
          console.log("Error getting document:", error);
        }
        );
      }


      React.useEffect(() => {
        getCourseCode();
        getUserInfo();
      }, []);
  

      const generateAttendanceEvent = () => {

      }



        const submitStudentAttendance = () => {

        }








      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Welcome to {courseName}!</Text>
          <Text>The course code is {courseCode}.</Text>
          {isProfessor ? <Text>You are a professor.</Text> : <Text>You are a student.</Text>}

          
          {isProfessor ? <Button title='Take Attendance' onPress={() => generateAttendanceEvent()} /> : <Text></Text>}

          {!isProfessor ? <Button title='Submit Student Attendance' onPress={ submitStudentAttendance } /> : <Text></Text>}


        </View>
      );
    }


































const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initalRouteNate="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
        <Stack.Screen name="JoinCourse" component={JoinCourseScreen} />
        <Stack.Screen name="Course" component={CourseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
