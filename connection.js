import { View, Text, StyleSheet, TextInput,Pressable } from 'react-native';
import {useEffect,useState, useRef}  from 'react';

export default Connect = ({connectUser}) => {
    const [inputUsager, setUsager] = useState("");
    const [inputPass, setPass] = useState("");
    return (
      <View>
          <TextInput style={styles.input} placeholder={"Usager"} value={inputUsager} 
        onChangeText={setUsager}/>
        <TextInput style={styles.input} placeholder={"Mot de passe"} value={inputPass} 
        onChangeText={setPass}/>
        <Pressable style={
          ({pressed}) => [styles.submit, {backgroundColor: pressed ? "#0066ff" : styles.submit.backgroundColor}]
        } onPress={() =>{connectUser(inputUsager,inputPass);}}><Text>Connecter</Text></Pressable>
      </View>
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
    }
  });

  