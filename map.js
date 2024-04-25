import MapView, {Marker,Callout, Polygon, Polyline} from 'react-native-maps';
import {  Text,Dimensions,StyleSheet} from 'react-native';
const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;
export default MapV = ({initialRegion,points,marqueurs,i18n}) =>{ return(<MapView
style={styles.map}
initialRegion={initialRegion}>
  <Polyline coordinates={points}></Polyline>
{
  marqueurs.map((marker, i) => { return(
    <Marker
    pinColor={marker.color}
    title={marker.nom}
    key = {i}
    coordinate={{
      latitude: marker.latitude,
      longitude: marker.longitude
    }}
    >
      <Callout>
        <Text>{i18n.t(marker.nom)}</Text>
        <Text>{i18n.t(marker.description)}</Text>
      </Callout>
    </Marker>
  );})
}
</MapView>)}


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
  
    }
  });
  