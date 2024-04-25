import { View, Text,TextInput, Pressable,StyleSheet, } from 'react-native';
import {useState}  from 'react';
export default AddProduit = ({i18n,connexion,addProduit,inputProduitInit}) => {
    const [inputProduit, setInputProduit] = useState(inputProduitInit);
    return(<View>
    <Text>{i18n.t("addProduct")} - {connexion.usager}</Text>
    <Text>nom</Text>
  <TextInput
  placeholder={i18n.t("name")} onChangeText={(n) => setInputProduit({...inputProduit, nom: n})} value={inputProduit.nom}/>
  <Text>description</Text>
  <TextInput
  placeholder={i18n.t("desc")} multiline onChangeText={(d) => setInputProduit({...inputProduit, description: d})} value={inputProduit.description}/>
  <Text>image</Text>
  <TextInput
  placeholder={i18n.t("image")} multiline onChangeText={(i) => setInputProduit({...inputProduit, image: i})} value={inputProduit.image}/>
  <Text>prix</Text>
  <TextInput
  placeholder={i18n.t("price")} onChangeText={(p) => setInputProduit({...inputProduit, prix: p.replace(/[^0-9]/g, '')})} value={inputProduit.prix}/>
  <Pressable style={({pressed}) => [styles.submit, {backgroundColor: pressed ? "#0066ff" : styles.submit.backgroundColor}]}
  onPress={() => {addProduit(inputProduit); setInputProduit(inputProduitInit)}}><Text>{i18n.t("addProduct")}</Text></Pressable>
  </View>)
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
  }
});