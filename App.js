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
import PanierFragment from './panier.js';
import ProduitFragment from './articles.js';
import AddProduit from './admin.js';
import MapV from './map.js';


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

import Game from './game.js';

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

 // useEffect(createAdmin,[]);

  
  
  //produits

  const produitInit ={nom:"", description: "", prix: "", image: ""}
  const [produits, setProduits] = useState([]);
  const [produit, setProduit] = useState({"nom" : "cuillere", "description": "only a spoonfull", "prix": 10, "image" : "https://w7.pngwing.com/pngs/408/165/png-transparent-spoon-tableware-gratis-spoon-food-eating-wooden-spoon-thumbnail.png"});
  

  const addProduit = (input) => {
    if(input.nom != "" && input.description != "" && input.image != "" && input.prix != "") {
        try {
          db.transaction( (tx) => {
            tx.executeSql("INSERT INTO Produit (nom,description,prix,image) VALUES (?,?,?,?)", [input.nom, input.description, input.prix, input.image]);
          })
            console.log("Ajouté nom: " + input.nom + ", description: " + input.description + ", prix: " + input.prix + ", image: " + input.image); 
            Vibration.vibrate(50);
        } catch (error) {
            console.log(error);
        
    }
    reloadProduits();
    return;
  }
  Vibration.vibrate(200)
  }

  function removeProduit(id) {
    try {
      db.transaction( (tx) => {
        tx.executeSql("delete from Produit where id = ?", [id]);
        Vibration.vibrate(50)
        reloadProduits();
        
      })
        console.log("Supprime: " + id); 
    } catch (error) {
        console.log(error);
    
}
  }

  function reloadProduits() {
    try {
      db.transaction((tx) => { tx.executeSql(`SELECT id,nom,description,prix,image FROM Produit;`, [], (_, { rows: { _array }}) =>
      {console.log(JSON.stringify(_array));
       setProduits(_array);
      }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  //useEffect(()=> {
   // addProduit();
  //},[]);

  useEffect(()=> {
    reloadProduits();
  },[]);

  
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

const PanierView = ({navigation}) => {//console.log(produits)
  return(
      <Stack.Navigator  screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="panierHome" component={PanierViewLst}/>
    <Stack.Screen name="details" component={PanierDetailsView}/>
  </Stack.Navigator>
);}

const PanierDetailsView = ({navigation,route}) => {
  const {nom,prix,image,id,description} = route.params;
return(<View>
  <Text>{nom}</Text>
  <Text>{money.format(prix)}</Text>
  <Text>{description}</Text>
  <Image style={styles.icon} source={{uri: image}}></Image>
</View>);}

const [total, setTotal] = useState(0);

const TotalPanier = () => {
  let total = 0;
  let prix = panier.map(item => item.prix*item.quantite);
  for(let p of prix) {
    total+= p;
  }}

const PanierViewLst = ({navigation}) =>{
  useEffect(TotalPanier, [panier]);
  return(<View>
    {(panier.length > 0) &&
    <View>
      <Text>{i18n.t("cart") + " - " + connexion.usager}</Text>
  <Text>{i18n.t("total")} : {money.format(total)}</Text>
  <Pressable style={({pressed}) => [styles.submit, {backgroundColor: pressed ? "#0066ff" : styles.submit.backgroundColor}]}
   onPress={() => {
   Vibration.vibrate(40); 
   Alert.alert(i18n.t("payed") + money.format(total) + i18n.t("charged"));
   setpanier([]);}}
  ><Text>{i18n.t("pay")}</Text></Pressable>
  <Pressable style={({pressed}) => [styles.remove, {backgroundColor: pressed ? "#0066ff" : styles.remove.backgroundColor}]}
  onPress={() => {setpanier([]);Vibration.vibrate(50)}}>
    <Text>{i18n.t("clear")}</Text>
  </Pressable>
  <FlatList
  data={panier}
keyExtractor={item => item.id}
renderItem={({item}) => <PanierFragment total={total} setTotal={setTotal} setpanier={setpanier} panier={panier} navigation={navigation} id={item.id} nom={item.nom} image={item.image} description={item.description} prix={item.prix} quantite={item.quantite} money={money} i18n={i18n}></PanierFragment>}
  >

  </FlatList>
  </View>
}
{(panier.length) == 0 &&
<View>
  <Text>{i18n.t("emptyCart")}</Text>
  </View>
}
</View>
);};
const [panier, setpanier] = useState([]);

const ProduitViewLst = ({navigation}) => <View><Text>{i18n.t("product")} - {connexion.usager}</Text>
<FlatList
data={produits} 
renderItem={({item}) => <ProduitFragment connexion={connexion} navigation={navigation} id={item.id} nom={item.nom} prix={item.prix} description={item.description} image={item.image} money={money} i18n={i18n} panier={panier} setpanier={setpanier} />}
keyExtractor={(item) => item.id}
numColumns={2}/>
</View>;

const ProduitsView = ({navigation}) => {//console.log(produits)
  return(
      <Stack.Navigator  screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen name="produitsHome" component={ProduitViewLst}/>
    <Stack.Screen name="details" component={DetailsView}/>
  </Stack.Navigator>
);}

const DetailsView = ({navigation,route}) => {
  const [quantite, setQuantite] = useState("1");
  const {nom,prix,image,id,description} = route.params;
return(<View>
  <Text>{nom}</Text>
  <Text>{money.format(prix)}</Text>
  <Text>{description}</Text>
  <Image style={styles.icon} source={{uri: image}}></Image>
  {connexion.connected == true &&
  <View>
   <TextInput value={quantite} onChangeText={(e) => setQuantite(e.replace(/[^0-9]/g, ''))}/>
  <Pressable
  style={({pressed}) => [styles.submit, {backgroundColor: pressed ? (panier.map(item=>item.id).includes(id) ? "#cc0000" : "#0066ff") : styles.submit.backgroundColor}]}
   onPress={() => {
   // console.log(selected);
    if(!panier.map(item=>item.id).includes(id)) {
     Vibration.vibrate(30); 
     setpanier([{id: id, quantite: quantite, nom: nom, prix: prix, description: description, image : image}, ...panier]);
  }else{Vibration.vibrate(100)}}}>
      <Text>{i18n.t("add")}</Text>
     </Pressable>
     </View>
}
{connexion.admin == true &&
     <Pressable 
     style={({pressed}) => [styles.remove, {backgroundColor: pressed ? "#0066ff" : styles.remove.backgroundColor}]}
     onPress={() => {removeProduit(id);
     navigation.goBack()}}>
     <Text>{i18n.t("delete")}</Text>
    </Pressable>}
</View>);}

const inputProduitInit = {nom : "", description: "", image: "https://www.circulaire-en-ligne.ca/data/media_uploads/paysagement-qualite_banner.jpg", prix: "" };

const AddProduitsView = ({navigation}) => {
  return(
  <AddProduit i18n={i18n} connexion={connexion} addProduit={addProduit} inputProduitInit={inputProduitInit} />)
}

const marqueurs = require("./markers.json");
const points = require("./route.json");
const LocalisatonView = ({navigation}) => {


  

  const initialRegion =  {
    latitude: 45.6235448,
    longitude: -73.8639533,
    latitudeDelta: 1,  
    longitudeDelta: 1
  }
  return(<MapV initialRegion={initialRegion} points={points} marqueurs={marqueurs} i18n={i18n}/>  );
}

const GameView = ({navigation}) => {

  return(<View style={styles.game}>
    <Game style={styles.game}>

    </Game>
  </View>);
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
<Tab.Screen name={i18n.t("product")} component={ProduitsView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
}
<Tab.Screen name={i18n.t("localization")} component={LocalisatonView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
{connexion.connected &&
<Tab.Screen name={i18n.t("cart")} component={PanierView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
}
{connexion.admin == true&&
<Tab.Screen name={i18n.t("addi")} component={AddProduitsView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />
}

<Tab.Screen name={i18n.t("game")} component={GameView}
options={{tabBarIcon: ({focused}) => <Ionicons name="home" size={24}
color={focused ? "blue" : "lightblue"} />}} />

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
  map: {
   width: width,
   height: height,

  },
  icon: {
    width: '100%',
    height: height/4,
  },
  game: {
    position: "absolute",
    flex: 1,
    elevation: 1,
  }
});
