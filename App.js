import * as React from 'react';
import { Button, View, Text, TextInputStyleSheet, StyleSheet, TextInput, SafeAreaView, StatusBar, TouchableOpacity, Platform} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Route } from '@react-navigation/native';

import {db} from './firebase/firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection, query, where } from "firebase/firestore/lite";
import { authentication } from './firebase/firebase-config';

import { CheckBox } from '@rneui/base';




function LoginScreen({ navigation }) {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

    const SignInUser = () => {
      signInWithEmailAndPassword(authentication, email, password)
        .then((re) => {
          console.log("User signed in successfully");
          //after user is signed in, navigate to home page
          navigation.navigate('Home', {user: re.user});
        })
        .catch((re) => {
          console.log(re);
        }
      );
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



















function RegisterScreen() {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [isProfessor, setIsProfessor] = React.useState(false);

  const RegisterUser = () => {
    createUserWithEmailAndPassword(authentication, email, password)
      .then((re) => {
        console.log("User registered successfully");
        //add the user to the firestore database
        const userRef = doc(db, "users", re.user.uid);
        setDoc(userRef, {
          firstName: firstName,
          lastName: lastName,
          email: email,
          isProfessor: isProfessor,
          accountCreationTime: re.user.metadata.creationTime,
        });
      })
      .catch((re) => {
        console.log(re);
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

















function HomePageScreen( {route, navigation} ) {
//retrive the user object from fire base with the same uid as route params. If the user isProfessor, display text saying true, else display false
  const user = route.params.user;
  const [isProfessor, setIsProfessor] = React.useState(false);

  const [classesTaught, setClassesTaught] = React.useState([]);
  const [classesEnrolled, setClassesEnrolled] = React.useState([]);



  const getClasseseTaught = () => {
    //get the classesTeached map from the user object in firestore and log it, then set the classesTaught state to the map
    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((docSnap) => {
      if (docSnap.exists()) {
        //get the classesTeached map from the user object and add each value to the classesTaught array. Then log it and set the classesTaught state to the array
        const classesTeached = docSnap.data().classesTeached;
        const classesTaughtArray = [];
        for (const value in classesTeached) {
          classesTaughtArray.push(classesTeached[value]);
        }
        console.log(classesTaughtArray);
        setClassesTaught(classesTaughtArray);
      } else {
        console.log("No such document");
      }
    }
    ).catch((re) => {
      console.log(re);
    }
    );
  }

  const getClassesEnrolled = () => {
    getDoc(doc(db, "users", user.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        const classesEnrolled = docSnap.data().classesEnrolled;
        const classesEnrolledArray = [];
        for (const value in classesEnrolled) {
          classesEnrolledArray.push(classesEnrolled[value]);
        }
        console.log(classesEnrolledArray);
        setClassesEnrolled(classesEnrolledArray);
      } else {
        console.log("No such user");
      }
    }).catch((re) => {
      console.log(re);
    });
  }

  const getIsProfessor = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Is Professor:", docSnap.data().isProfessor);
      setIsProfessor(docSnap.data().isProfessor);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }






  React.useEffect(() => {
    getIsProfessor();
    getClasseseTaught();
    getClassesEnrolled();

  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Page</Text>
      <Text>Is Professor: {isProfessor.toString()}</Text>
      {isProfessor? <Button title='Create Classs' onPress={() => navigation.navigate('CreateClass', {user: user})} /> : null}
      {isProfessor? null : <Button title='Join Class' onPress={() => navigation.navigate('JoinClass', {user: user})} />} 

      <Text></Text> 

      {isProfessor? classesTaught.map((item) => <Button title={item} onPress={() => navigation.navigate('Class', {user: user, class: item, isProfessor: isProfessor})} />) : classesEnrolled.map((item) => <Button title={item} onPress={() => navigation.navigate('Class', {user: user, class: item})} />)}

      

    
      
    
    </View>
  );
}


















function ClassScreen({route, navigation}) {

  const user = route.params.user;

  const classCodeArray = route.params.classCodeArray;

  const className = route.params.class;

  const [isProfessor, setIsProfessor] = React.useState(false);
  const [classCode, setClassCode] = React.useState('');

  const [loggedInUserFirstName, setLoggedInUserFirstName] = React.useState('');
  const [loggedInUserLastName, setLoggedInUserLastName] = React.useState('');

  const [studentsFirstName, setStudentsFirstName] = React.useState([]);
  const [studentsLastName, setStudentsLastName] = React.useState([]);

  const [studentsEmailsArray, setStudentsEmailsArray] = React.useState([]);

  const getIsProfessor = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Is Professor:", docSnap.data().isProfessor);
      setIsProfessor(docSnap.data().isProfessor);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  const getCurrentUserName = async () => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("First Name:", docSnap.data().firstName);
      console.log("Last Name:", docSnap.data().lastName);
      setLoggedInUserFirstName(docSnap.data().firstName);
      setLoggedInUserLastName(docSnap.data().lastName);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  const getCurrentClassCode = async () => {
    
    
    if (isProfessor) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const classesTeached = docSnap.data().classesTeached;
        for (const key in classesTeached) {
          if (classesTeached[key] === className) {
            setClassCode(key);
            return key;
          }
        }
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }

  }

  const getCurrentStudentsNames = async () => {
    /*
    //doesnt work, using emails instead
    if (isProfessor) {
      const docRef = doc(db, "classes", classCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const students = docSnap.data().students;
        const studentsFirstNameArray = [];
        const studentsLastNameArray = [];
        for (const key in students) {
          const docRef = doc(db, "users", key);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            studentsFirstNameArray.push(docSnap.data().firstName);
            studentsLastNameArray.push(docSnap.data().lastName);
            console.log(docSnap.data().firstName);
            console.log(docSnap.data().lastName);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        setStudentsFirstName(studentsFirstNameArray);
        setStudentsLastName(studentsLastNameArray);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    */
  }

  const getStudentsEmails = async () => {

    setStudentsEmailsArray([]);

    if (isProfessor) {
      //log the students map
      const docRef = doc(db, "classes", classCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const students = docSnap.data().students;
        const studentsEmailsArray = [];
        for (const key in students) {
          const docRef = doc(db, "users", key);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            studentsEmailsArray.push(docSnap.data().email);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }
        setStudentsEmailsArray(studentsEmailsArray);
      }

    }
  }





  React.useEffect(() => {
    getIsProfessor();
    getCurrentUserName();
    getCurrentClassCode();
    //getCurrentStudentsNames();
    getStudentsEmails();
  }, [isProfessor]);




  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Class: {className}</Text>
      <Text>Is Professor: {isProfessor.toString()}</Text>
      <Text>User email: {user.email}</Text>
      <Text>User UID: {user.uid}</Text>
      <Text>Logged In User: {loggedInUserFirstName} {loggedInUserLastName}</Text>
      {isProfessor? <Text>Class Code: {classCode}</Text> : null}
      {isProfessor? <Text>Students: {studentsEmailsArray.toString()}</Text> : null}
      
      
      </View>
  );

}





















function CreateClassScreen( {route} ) {

  const { user } = route.params;

  const [className, setClassName] = React.useState('');
  const [classCode, setClassCode] = React.useState('');

  const CreateClass = () => {
    const classRef = doc(db, "classes", classCode);
    const userRef = doc(db, "users", user.uid);
    //check if class with this class code already exists
    getDoc(classRef).then((docSnap) => {
      if (docSnap.exists()) {
        console.log("Class with this code already exists");
      } else {
        //create class
        setDoc(classRef, {
          name: className,
          professor: user.email,
          professorUID: user.uid,
          students: []
        }).then(() => {
          console.log("Class created successfully");
        }).catch((re) => {
          console.log(re);
        });
      }
    }).catch((re) => {
      console.log(re);
    });
    //add an array named classesTaught to the user object and add the class code and name to it
    setDoc(userRef, {
      classesTeached: {
      [classCode]: className
      }},
      {merge: true}
    ).then(() => {
      console.log("User updated successfully");
    }
    ).catch((re) => {
      console.log(re);
    }
    );

  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Create Class</Text>
      <TextInput placeholder='Class Name' value={className} onChangeText={(text) => setClassName(text)} />
      <TextInput placeholder='Class Code' value={classCode} onChangeText={(text) => setClassCode(text)} />
      <Button title='Create Class' onPress={CreateClass} />
    </View>
  );
}















function JoinClassScreen( {route} ) {
  //create a text input for the class code, and a button to submit the class code. 
  //if the class code is valid, add the user to the firebase class array and add the class to the user object
  const { user } = route.params;

  const [classCode, setClassCode] = React.useState('');

  const JoinClass = () => {
    const classRef = doc(db, "classes", classCode);
    const userRef = doc(db, "users", user.uid);
    //check if class with this class code already exists
    getDoc(classRef).then((docSnap) => {
      if (docSnap.exists()) {
        console.log("Class with this code exists");
        //add the user to the class
        setDoc(classRef, {
          students: {
            [user.uid]: user.email
          }
        }, {merge: true}).then(() => {
          console.log("User added to class successfully");
        }).catch((re) => {
          console.log(re);
        });
        //add the class to the user
        setDoc(userRef, {
          classesEnrolled: {
            [classCode]: docSnap.data().name
          }
        }, {merge: true}).then(() => {
          console.log("Class added to user successfully");
        }).catch((re) => {
          console.log(re);
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }).catch((re) => {
      console.log(re);
    });
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Join Class</Text>
      <TextInput placeholder='Class Code' value={classCode} onChangeText={(text) => setClassCode(text)} />
      <Button title='Join Class' onPress={JoinClass} />
    </View>
  );
}

 




























const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomePageScreen} />
        <Stack.Screen name="CreateClass" component={CreateClassScreen} />
        <Stack.Screen name="JoinClass" component={JoinClassScreen} />
        <Stack.Screen name="Class" component={ClassScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;
