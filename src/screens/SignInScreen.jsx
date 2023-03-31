import React from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View,Colors,TouchableOpacity,ToastAndroid} from 'react-native';

import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';



export default function SignInScreen( {navigation, route} ) {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSignIn = async () => {

        if (!email.trim() || !password.trim()) {
            ToastAndroid.show('Please fill out both fields', ToastAndroid.SHORT);
            return;
        }

        try {
            await auth().signInWithEmailAndPassword(email, password);
            console.log('User account created & signed in!');

            firestore().collection('users').doc(auth().currentUser.uid).get().then((doc) => {
                if (doc.data().isProfessor) {
                    //navigate to professor home screen, with current user's uid as a parameter
                    navigation.navigate("Professor Home", {uid: auth().currentUser.uid});
                } else {
                    //navigate to student home screen, with current user's uid as a parameter
                    navigation.navigate("Student Home", {uid: auth().currentUser.uid});
                }
            }
            );




        } catch (error) {
            console.log('Error:', error.message);
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
    };
      

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'}}>
    
          
          <TextInput
            style={style.textinput}
            label="Email"
            left={<TextInput.Icon icon="email" />}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            selectionColor="#0000FF"
            outlineColor='gainsboro'
            activeOutlineColor='#0000FF'
          />
    
          <TextInput
            style={style.textinput}
            label="Password"
            left={<TextInput.Icon icon="lock" />}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            mode="outlined"
            selectionColor="#0000FF"
            outlineColor='gainsboro'
            activeOutlineColor='#0000FF'  
          />
    
          <Button 
            style={style.button}
            mode="contained"
            onPress={handleSignIn}
          >
            Sign In
          </Button>
    
          <View style={{flexDirection: 'row'}}>
            <Text>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Sign Up")}>
              <Text 
                style={{color: '#0000FF'}}> 
                   Sign Up</Text>
            </TouchableOpacity>
            </View>
    
            
    
    
    
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
    

