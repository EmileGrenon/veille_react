import { View, Text,TextInput, Pressable, Image,StyleSheet,Vibration,Dimensions } from 'react-native';
import {useState}  from 'react';

export default ProduitFragment = ({navigation,description,id,nom,image,prix,i18n,money,panier,setpanier,connexion}) => {
    const [quantite, setQuantite] = useState("1");
      return(
    <View style={{width: '45%'}}>
      <Pressable
      onPress={() => navigation.navigate("details", {id: id, nom: nom, prix: prix, description: description, image: image})}>
      <Text>{nom + " " + money.format(prix)}</Text>
      <Image style={styles.icon} source={{uri: image}}></Image>
      </Pressable>
      {connexion.connected == true &&
      <View>
        <TextInput value={quantite} onChangeText={(e) => setQuantite(e.replace(/[^0-9]/g, ''))}/>
      <Pressable
      style={({pressed}) => [styles.submit, {backgroundColor: pressed ? (panier.map(item=>item.id).includes(id) ? "#cc0000" : "#0066ff") : styles.submit.backgroundColor}]}
       onPress={() => {
        if(!panier.map(item=>item.id).includes(id)) {
         Vibration.vibrate(30); 
         setpanier([{id: id, quantite: quantite, nom: nom, prix: prix, description: description, image : image}, ...panier]);
      }else{Vibration.vibrate(100)}}}>
          <Text>{i18n.t("add")}</Text>
         </Pressable>
         </View>
    }
    </View>)
    }
    const height = Dimensions.get("window").height;
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