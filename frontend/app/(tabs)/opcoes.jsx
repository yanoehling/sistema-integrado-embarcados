import * as React from 'react';
import {useRef, useEffect, useState, useCallback} from 'react';
import {Animated, View, Text, Image, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import OpcoesDetail from '@/components/detalhes_opcoes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

export default function OpcoesScreen(){
  //opc é a lista de todos as configs puxadas pelo get_all
  const [opc, setOpc] = useState([]);
  //selectedOpc é a configuração atualmente selecionada
  const [selectedOpc, setSelectedOpc] = useState("")
  const router = useRouter()
  useFocusEffect(
    useCallback(()=>{
      const assyncfunc = async () =>{
        try{
          console.log("Tela opcoes renderizou!")
          const res = await fetch(`http://${window.location.hostname}:5000/controle/get-all`);
          const json = await res.json()
          if (json.length > 0){
            setSelectedOpc(json[0])
          }
          setOpc(json)
        }catch(err){
          console.log(err);
        }

      }
    assyncfunc();
  }, []))

  const deleteConfirm = () => {
    const ok = window.confirm("Você tem certeza que deseja excluir?")
    if(ok) deleteHandle();
    return;
  }

  const deleteHandle = async () =>{
    const res = await fetch(`http://${window.location.hostname}:5000/controle/delete-config/${selectedOpc.id}`,
      {
        method: "DELETE",
      }
    );
    if(res.ok){
      router.push("/(tabs)");
    }
  }

  return(
  <View style={styles.container}>
    <Text>Escolha uma Opção</Text>
    <Picker selectedValue={selectedOpc.id} onValueChange={(value) => {
      const configSelected = opc.find((item) => item.id == value);
      setSelectedOpc(configSelected);
    }}>
      {opc.map((c) => (
        <Picker.Item key={c.id} label={`Opção ${c.id}`} value={c.id}/>
      ))}
    </Picker>
    <View style={styles.grid_container}>
      <OpcoesDetail text={"Distancia Máxima"} value={selectedOpc.max_distance}/>
      <OpcoesDetail text={"Delay Minimo"} value={selectedOpc.min_delay}/>
      <OpcoesDetail text={"Delay Máximo"} value={selectedOpc.max_delay}/>
      <OpcoesDetail text={"Luzes Ligadas?"} value={selectedOpc.light_on}/>
      <OpcoesDetail text={"Som Ligado?"} value={selectedOpc.sound_on}/>
    </View>
    <View style={styles.flex_container}>
      <TouchableOpacity style={styles.button} onPress={()=>router.push("/creation_opc")}>
        <Text>Adicionar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={deleteConfirm}>
        <Text>Remover</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
        <Text>Aplicar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={()=>router.push("/(tabs)")}>
        <Text>Voltar</Text>
      </TouchableOpacity>
    </View>
  </View>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: 'white'
  },
  grid_container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 50
  },

  flex_container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  button: {
    backgroundColor: "#bdbdbd",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    margin: 20,
    justifyContent: "center"
  }
})