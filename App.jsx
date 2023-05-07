import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import StudentHomeScreen from './src/screens/StudentHomeScreen';
import ProfessorHomeScreen from './src/screens/ProfessorHomeScreen';
import ProfessorCreateCourseScreen from './src/screens/ProfessorCreateCourseScreen';
import ProfessorCourseViewScreen from './src/screens/ProfessorCourseViewScreen';
import StudentJoinCourseScreen from './src/screens/StudentJoinCourseScreen';
import StudentCourseViewScreen from './src/screens/StudentCourseViewScreen';
import ProfessorAttendanceViewScreen from './src/screens/ProfessorAttendanceViewScreen';
import ProfessorAttendanceEventViewScreen from './src/screens/ProfessorAttendanceEventViewScreen';
import ProfessorAttendanceEventMapViewScreen from './src/screens/ProfessorAttendanceEventMapViewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Sign In" component={SignInScreen}/>
        <Stack.Screen name="Sign Up" component={SignUpScreen}/>
        <Stack.Screen name="Student Home" component={StudentHomeScreen}/>
        <Stack.Screen name="Professor Home" component={ProfessorHomeScreen}/>
        <Stack.Screen name="Create Course" component={ProfessorCreateCourseScreen}/>
        <Stack.Screen name="Professor Course View" component={ProfessorCourseViewScreen}/>
        <Stack.Screen name="Join Course" component={StudentJoinCourseScreen}/>
        <Stack.Screen name="Student Course View" component={StudentCourseViewScreen}/>
        <Stack.Screen name="Professor Attendance View" component={ProfessorAttendanceViewScreen}/>
        <Stack.Screen name="Professor Attendance Event View" component={ProfessorAttendanceEventViewScreen}/>
        <Stack.Screen name="Professor Attendance Event Map View" component={ProfessorAttendanceEventMapViewScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


