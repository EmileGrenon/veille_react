import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, FlatList, Pressable, Vibration, Dimensions, Image } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, Foundation } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import Connect from './connection.js';
import { Audio } from 'expo-av';

import { Camera, CameraType } from 'expo-camera';

import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabase('college.db') // returns Database object
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;
let cam = null;
let usager = "";

const createTable = () => db.transaction((tx) => {
  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Produit (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, description TEXT, prix FLOAT, image TEXT);");
  tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Connexion (usager TEXT PRIMARY KEY, mdp TEXT, admin BOOLEAN);");
});
export default function App() {
  //connexion
  const userInit = { usager: "Emile", mdp: "Emile", admin: false, connected: false }
  const admin = { usager: "A", mdp: "A", admin: true, connected: true };
  const user = { usager: "B", mdp: "B", admin: false, connected: true };
  const [connexion, setConnexion] = useState(userInit);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [permissionResponse, requestPermission1] = MediaLibrary.usePermissions();
  const [permissionResponse1, requestPermission2] = Audio.usePermissions();
  function requestAllPermission() {
    requestPermission();
    requestPermission1();
    requestPermission2();
  }
  useEffect(requestAllPermission, []);
  useEffect(createTable, []);

  const addUser = (user) => {
    if (user.usager.length == 0 || user.mdp.length == 0) {
      Alert.alert('Attention!', 'SVP tapez des données');
      console.log("erreur, usager: " + user.usager + ", mdp: " + user.mdp + ", admin: " + user.admin);
    } else {
      try {
        db.transaction((tx) => {
          tx.executeSql("INSERT INTO Connexion (usager, mdp, admin) VALUES (?,?,?)", [user.usager, user.mdp, user.admin]);
        })
        console.log("Ajouté, usager: " + user.usager + ", mdp: " + user.mdp + ", admin: " + user.admin);
      } catch (error) {
        console.log(error);
      }
    }
    // setConnexion(userInit);
  }
  const addUsers = () => {
    addUser(user);
    addUser(admin);
    addUser(userInit);
  }
  useEffect(addUsers, []);


  function connectUser(user, pass) {
    usager = user;
    try {
      db.transaction((tx) => {
        tx.executeSql(`SELECT usager,mdp,admin FROM Connexion WHERE usager = ? AND mdp = ?;`, [user, pass], (_, { rows: { _array } }) => {
          if (_array.length == 1) {
            setConnexion({ usager: _array[0].usager, mdp: _array[0].mdp, admin: _array[0].admin * true, connected: true });
            console.log("connecté: " + JSON.stringify(connexion));
            Vibration.vibrate(40)
            return true;
          }
          Vibration.vibrate(400)
          return false;
        }
        );
      });
    } catch (error) {
      console.log("erreur: " + error);
    }
    return false;
  }
  const ConnectView = () => <View>
    <Text>Connection</Text>
    <Connect connectUser={connectUser} />
    <Text>Émile et Raphaël</Text>
  </View>
  const AproposView = () => <View>
    <Text>Application faite par Émile et Raphaël</Text>
  </View>

  function ProfilView() {
    const [isVisible, setIsVisible] = useState(false);
    const [type, setType] = useState(CameraType.back);

    const toggleVisibility = () => {
      if (!permission) {
        return;
      }
      if (permission.granted) {
        setIsVisible(!isVisible);
      }

    };

    const toggleCameraType = () => {
      setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
    }
    const toggleFlash = () => {

    }
    const takePicture = async () => {

      let picture = await cam.takePictureAsync();
      MediaLibrary.saveToLibraryAsync(picture.uri);
    }

    return (
      <View style={styles.container1}>
        {!isVisible &&
          <View style={styles.container}>

            <Pressable onPress={toggleVisibility} style={styles.pressable}>
              <Text style={styles.text}>{usager}</Text>
              <Image source={require("./default.png")} style={styles.image} />
            </Pressable>

          </View>
        }
        {isVisible &&

          <Camera style={styles.camera} type={type} ref={(r) => cam = r}>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.button1} onPress={toggleCameraType}>
                <Text style={styles.text1}>Flip Camera</Text>
              </Pressable>
              <Pressable style={styles.button1} onPress={takePicture}>
                <Text style={styles.text1}>take picture</Text>
              </Pressable>
            </View>
          </Camera>
        }
      </View>

    )
  }
  function AudioView() {
    const [isRecording, record] = useState(false);
    const [sound, setSound] = useState(false);
    const stopAudio = async () => {
      console.log('Stopping recording..');
    
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    MediaLibrary.saveToLibraryAsync(uri);
    setSound(uri);
    }
    const startAudio = async () => {
      try {
        if (permissionResponse.status !== 'granted') {
          console.log('Requesting permission..');
          await requestPermission();
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
  
        console.log('Starting recording..');
        const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        record(true);
        console.log('Recording started');
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
    const audioPlay = async () => {
      if (!sound) {

      } else {
        const a = await Audio.Sound.createAsync( {uri : sound});
      console.log('Playing Sound');
      await a.playAsync();
      }
      
    }

    return (
      <View style={styles.container}>
        {isRecording &&
          <Pressable onPress={stopAudio} style={styles.pressable}>
            <Text style={styles.text}>Stop Record</Text>
          </Pressable>
        }
        {!isRecording &&
        <View>
          <Pressable onPress={startAudio} style={styles.pressable}>
          <Text style={styles.text}>Record</Text>
          </Pressable>
          <Pressable onPress={audioPlay} style={styles.pressable}>
            <Text style={styles.text}>Play</Text>
          </Pressable>
          </View>
        }

      </View>
    );
  }


  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name={"Connection"} component={ConnectView}
          options={{
            tabBarIcon: ({ focused }) => <Ionicons name="home" size={24}
              color={focused ? "blue" : "lightblue"} />
          }} />
        <Tab.Screen name={"À propos"} component={AproposView}
          options={{
            tabBarIcon: ({ focused }) => <Ionicons name="home" size={24}
              color={focused ? "blue" : "lightblue"} />
          }} />
        {connexion.connected &&
          <Tab.Screen name="profil" component={ProfilView}
            options={{
              tabBarIcon: ({ focused }) => <Ionicons name="home" size={24}
                color={focused ? "blue" : "lightblue"} />
            }} />
        }
        {connexion.connected &&
          <Tab.Screen name="audio" component={AudioView}
            options={{
              tabBarIcon: ({ focused }) => <Ionicons name="home" size={24}
                color={focused ? "blue" : "lightblue"} />
            }} />
        }

      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container1: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  submit: {
    backgroundColor: '#00ccff',
    width: 'auto'

  },
  remove: {
    backgroundColor: '#cc0000',
  },
  icon: {
    width: '100%',
    height: height / 4
  },
  pressable: {
    padding: 10
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
  text: {
    textAlign: 'center',
    padding: 10,
    fontSize: 20
  },
  camera: {
    flex: 1
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button1: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
