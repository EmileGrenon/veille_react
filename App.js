import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, FlatList, Pressable,Vibration, Dimensions, Image } from 'react-native';
import {useEffect,useState, useRef}  from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons,Foundation} from '@expo/vector-icons';

import { SafeAreaView } from 'react-native';
import Canvas from 'react-native-canvas';

import Connect from './connection.js';


import * as SQLite from 'expo-sqlite'
const db = SQLite.openDatabase('college.db') // returns Database object

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;

import * as Localization from 'expo-localization';
import {I18n} from 'i18n-js';

import Intl from "intl";
import 'intl/locale-data/jsonp/fr-CA';
import 'intl/locale-data/jsonp/en-CA';

const translations = {
  en: {
  password: "Password",
  username: "Username",
  connect: "Connect",
  propos: "Application made by Emile and Raphael",
  gored: "Go Back",
  gore: "Gore",
  trou: "Hole",
  troud: "The Hole",
  cow: "Cow island",
  cowd: "the cow domain",
  centre: "Center",
  centred: "The center of operations",
  pointe: "Pointe",
  pointed: "The city of the elite",
  author: "Emile and Raphael",
  product: "Products",
  addProduct: "Add a product",
  name: "Name",
  desc: "Description",
  price: "Price",
  image: "Image",
  remove: "Remove from cart",
  clear: "Clear cart",
  add: "Add to cart",
  localization: "Localization",
  delete: "Delete product",
  pay: "Pay cart",
  about: "About",
  addi: "Add",
  cart: "Cart",
  emptyCart: "The cart is empty",
  total: "total",
  payed: "Cart Payed, a total of: ",
  charged: ", Has been charged",
  game: "Game",
  locale: "Change Locale",
  },
  fr: {
    password: "Mot de passe",
    username: "Usager",
    connect: "Connecter",
    propos: "Application faire par Emile et Raphael",
    gored: "Faites demi tour",
    gore: "Gore",
    trou: "Hole",
    troud: "Le trou",
    cow: "Ile aux vaches",
    cowd: "le centre de la vache",
    centre: "Domicile",
    centred: "Le centre des opérations",
    pointe: "Pointe",
    pointed: "La ville des Élites",
    author: "Emile et Raphael",
    product: "Produits",
    addProduct: "Ajouter un produit",
    name: "nom",
    desc: "description",
    price: "prix",
    image: "image",
    remove: "Enlever du panier",
    clear: "Vider le panier",
    add: "Ajouter au panier",
    localization: "Localisation",
    delete: "Supprimer le produit",
    pay: "Payer le panier",
    about: "A propos",
    addi: "Ajouter",
    cart: "Panier",
    emptyCart: "Le panier est vide",
    total: "total",
    payed: "Panier payé, un total de: ",
    charged: ", a été payé.",
    game: "Jeu",
    locale: "Changer la locale",
  }
  }
  const i18n = new I18n(translations);

  i18n.enableFallback = true;
i18n.defaultLocale = "fr-CA";
i18n.locale = Localization.locale
//i18n.locale = "fr-CA";

var money = new Intl.NumberFormat(i18n.locale, { style: 'currency', currency: "CAD"});



const createTable=() => db.transaction((tx)=> { tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Produit (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, description TEXT, prix FLOAT, image TEXT);");
    tx.executeSql("CREATE TABLE IF NOT EXISTS " +
    "Connexion (usager TEXT PRIMARY KEY, mdp TEXT, admin BOOLEAN);");});

var ctx;

var name = " ";

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

  function createAdmin() {
    if(!connectUser()) {
      addUser();
      connectUser();
    }
  }




  
  const ConnectView = ({navigation}) => <View>
  <Text>{i18n.t("connect")}</Text>
  <Connect i18n={i18n} connectUser={connectUser}/>
  <Text>{i18n.t("author")}</Text>
</View>
const [locale, setlocale] = useState(i18n.locale)
const AproposView = ({navigation}) => <View>
<Text>{i18n.t("propos")}</Text>
<Pressable style={({pressed}) => [styles.submit, {backgroundColor: pressed ? "#0066ff" : styles.submit.backgroundColor}]}
onPress={() => {console.log(i18n.locale);
  if(i18n.locale == "fr-CA") {i18n.locale = "en-CA"; 
money = new Intl.NumberFormat(i18n.locale, { style: 'currency', currency: "USD"});}else{
  money = new Intl.NumberFormat(i18n.locale, { style: 'currency', currency: "CAD"});
  i18n.locale = "fr-CA";
} Vibration.vibrate(50);
setlocale(i18n.locale)
}}><Text>{i18n.t("locale")}</Text></Pressable>
</View>

function ProfilView() {
  return <View><Text>test</Text></View>
} 



return (
<NavigationContainer>
<Tab.Navigator>
<Tab.Screen name={i18n.t("connect")} component={ConnectView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}}/>
<Tab.Screen name={i18n.t("about")} component={AproposView}
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
    justifyContent: 'center',
  },
  submit: {
    backgroundColor: '#00ccff',
    width: 'auto',
  
  },
  remove: {
    backgroundColor: '#cc0000',
  },
  icon: {
    width: '100%',
    height: height/4,
  }
});
