import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, FlatList, Pressable,Vibration, Dimensions, Image } from 'react-native';
import {useEffect,useState, useRef}  from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons,Foundation} from '@expo/vector-icons';

import Connect from './connection.js';


import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabase('college.db') // returns Database object

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

let usager = "";

const createTable=() => db.transaction((tx)=> { tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Produit (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, description TEXT, prix FLOAT, image TEXT);");
    tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Connexion (usager TEXT PRIMARY KEY, mdp TEXT, admin BOOLEAN);");});


export default function App() {
  //connexion
  const userInit ={usager:"", mdp: "", admin: false, connected: false}
  const admin = {usager: "A", mdp: "A", admin: true, connected:true};
  const user = {usager: "B", mdp: "B", admin: false, connected:true};
  const [connexion, setConnexion] = useState(userInit);



  useEffect(createTable,[]);

  const addUser = (user) => {
    if (user.usager.length == 0 || user.mdp.length == 0) {
        Alert.alert('Attention!', 'SVP tapez des données');
        console.log("erreur, usager: " + user.usager + ", mdp: " + user.mdp + ", admin: " + user.admin);
    } else {
        try {
          db.transaction( (tx) => {
            tx.executeSql("INSERT INTO Connexion (usager, mdp, admin) VALUES (?,?,?)", [user.usager, user.mdp, user.admin]);
          })
            console.log("Ajouté, usager: " + user.usager + ", mdp: " + user.mdp + ", admin: " + user.admin); 
        } catch (error) {
            console.log(error);
        }
    }
   // setConnexion(userInit);
  }
  addUser(user);
  addUser(admin);

  function connectUser(user,pass) {
    usager = user;
    try {
      db.transaction((tx) => { tx.executeSql(`SELECT usager,mdp,admin FROM Connexion WHERE usager = ? AND mdp = ?;`, [user,pass], (_, { rows: { _array }}) =>
      {
        if(_array.length == 1) {
          setConnexion({usager: _array[0].usager, mdp: _array[0].mdp, admin:_array[0].admin * true, connected:true});
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
  function takePhoto() {
    console.log("test");
  }
  const ConnectView = () => <View>
  <Text>Connection</Text>
  <Connect connectUser={connectUser}/>
  <Text>Émile et Raphaël</Text>
</View>
const AproposView = () => <View>
  <Text>Application faite par Émile et Raphaël</Text>
</View>

function ProfilView() {
  return( 
  <View style={styles.container}>
  <Pressable onPress={takePhoto} style={styles.pressable}>
    <Image source={require("./default.png")} style={styles.image}/>
  </Pressable>
</View>)
} 



return (
<NavigationContainer>
<Tab.Navigator>
<Tab.Screen name={"Connection"} component={ConnectView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}}/>
<Tab.Screen name={"À propos"} component={AproposView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
{connexion.connected &&
<Tab.Screen name="profil" component={ProfilView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
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
  submit: {
    backgroundColor: '#00ccff',
    width: 'auto'
  
  },
  remove: {
    backgroundColor: '#cc0000',
  },
  icon: {
    width: '100%',
    height: height/4
  },
  pressable: {
    padding: 10,
    backgroundColor: 'lightblue'
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
});
