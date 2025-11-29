import { Label } from '@react-navigation/elements';
import { StyleSheet, Text, TextInput} from 'react-native';
import { View } from 'react-native';

export default function InputComponent({label, placeholder, onChangeValue, messageError, boolError}){
    return(
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, boolError && styles.error]}
                placeholder={placeholder}
                placeholderTextColor="#777"
                onChangeText={onChangeValue}
            />
            {boolError && (
              <Text style={styles.errorMenssage}>{messageError}</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    field: {
      width: "100%",
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 6,
    },
    input: {
      width: "100%",
      height: 45,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 16,
    },
    error: {
      borderColor: "red"
    },
    errorMenssage: {
      color: "red",
      fontSize: 10
    }
  });
  