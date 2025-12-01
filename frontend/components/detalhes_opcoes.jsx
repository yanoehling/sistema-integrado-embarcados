import { StyleSheet, Text} from 'react-native';
import { View } from 'react-native';

export default function OpcoesDetail({text, value}){
    const valueFiltrated = conversorBoolean(value);
    return(
        <View style={styles.item}>
            <Text style={{textAlign: "center"}}>{text}</Text>
            <Text style={{textAlign: "center"}}>{valueFiltrated}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: "#f5f5f5",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        textAlign: "center",
        width: 120,
        margin: 10
      }
})

function conversorBoolean(value){
    let num;
    try{
        num = Number(value);
    }catch{
        return false;
    }
    if(num == 0){
        return "Não";
    }else if(num == 1){
        return "Sim";
    }else{
        return value;
    }
}