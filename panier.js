
import { View, Text,TextInput, Pressable, Image,StyleSheet,Dimensions } from 'react-native';
import {useEffect,useState}  from 'react';


export default PanierFragment = ({navigation,id,nom,image,description,prix,quantite,panier,setpanier,total,setTotal,money,i18n}) => {
    let pluriel = (quantite > 1) ? "s" : "";
    const [qt, setqt] = useState(quantite);
    useEffect(() => {
        let total = 0;
        let prix = panier.map(item => item.prix*item.quantite);
        for(let p of prix) {
          total+= p;
        }
        setTotal(total);
      },[qt]);
    return (
      <View>
          <Pressable
    onPress={() => navigation.navigate("details", {id: id, nom: nom, prix: prix, description: description, image: image})}>
        <Text>{quantite + " " + nom + pluriel + " " + money.format(prix)}</Text>
        <Image style={styles.icon} source={{uri: image}}></Image>
        </Pressable>
        <TextInput value={qt} onChangeText={(q) => {setqt(q); setpanier(panier.map(p=>{if(p.id == id) {return {...p, quantite: q}} return p}))}}/>
        <Pressable style={({pressed}) => [styles.remove, {backgroundColor: pressed ? "#0066ff" : styles.remove.backgroundColor}]}
        onPress={() => {setpanier([...panier.filter(item=>item.id!=id)]);}}><Text>{i18n.t("remove")}</Text></Pressable>
      </View>
    );
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