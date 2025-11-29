import { StyleSheet, Text} from 'react-native';
import { View } from 'react-native';

export default function OpcoesDetail({text, value}){
    return(
        <View style={styles.item}>
            <Text>{text}</Text>
            <Text>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        width: "48%",
        height: 120,
        marginBottom: 12,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderBlockColor: "black",
        borderWidth: 1,
        backgroundColor: "gray",
        borderRadius: 30
      }
})