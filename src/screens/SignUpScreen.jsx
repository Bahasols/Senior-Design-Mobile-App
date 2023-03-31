import React from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,View,Colors,TouchableOpacity,ToastAndroid} from 'react-native';

import { TextInput } from 'react-native-paper';
import { Image } from '@rneui/themed';
import { CheckBox } from '@rneui/base';
import { Button } from 'react-native-paper';

import firebaseConfig from './firebase-config';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function SignInScreen( {navigation, route} ) {

    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isProfessor, setIsProfessor] = React.useState(false);

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            ToastAndroid.show('Please fill out all fields.', ToastAndroid.SHORT);
            return;
        }
    
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            firestore().collection('users').doc(auth().currentUser.uid).set({
                name: name,
                email: email,
                isProfessor: isProfessor,
                coursesInvolved: [],
                uid: auth().currentUser.uid,

            });
            console.log('User account created & signed in!');
            ToastAndroid.show('User account created & signed in!', ToastAndroid.SHORT);
            setTimeout(() => {
                navigation.navigate("Sign In");
            }, 2000);






        } catch (error) {
            console.log('Error:', error.message);
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
    };
    
      

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', alignContent: 'flex-end'}}>
            <TextInput
                style={style.textinput}
                label="Name"
                
                left={<TextInput.Icon icon="odnoklassniki" />}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                mode="outlined"
                selectionColor="#0000FF"
                outlineColor='gainsboro'
                activeOutlineColor='#0000FF'
            />

            <TextInput
                style={style.textinput}
                label="Email"
                left={<TextInput.Icon icon="mail" />}
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
                mode="outlined"
                selectionColor="#0000FF"
                outlineColor='gainsboro'
                activeOutlineColor='#0000FF'
                secureTextEntry={true}
            />

            <CheckBox
                title="Create a professor account?"
                checked={isProfessor}
                onPress={() => setIsProfessor(!isProfessor)}
                iconType="material-community"
                checkedIcon="checkbox-outline"
                uncheckedIcon={'checkbox-blank-outline'}
                style={style.checkbox}
                containerStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}

            />

            <Button
                style={style.button}
                mode="contained"
                onPress={() => {
                    console.log('\n')
                    console.log('name field:', name);
                    console.log('email field:', email);
                    console.log('password field:', password);
                    console.log('isProfessor field:', isProfessor);
                    handleSignUp();

                }}
            >Create Account</Button>
        </View>
    )
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
    },
    checkbox: {
        width: '95%',
    }
  })