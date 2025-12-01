import * as React from 'react';
import {useRef, useEffect, useState, useCallback} from 'react';
import {Animated, View, Text, Image, TouchableOpacity, StyleSheet, Alert, Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import OpcoesDetail from '@/components/detalhes_opcoes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

const { LOCALIP } = require("./LOCALIP");

export default function OpcoesScreen(){
  const platform = Platform.OS
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
          const res = await fetch(`http://${LOCALIP}:8000/controle/get-all`);
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
    if(platform == "web"){
      const ok = window.confirm("Você tem certeza que deseja excluir?")
      if(ok) deleteHandle();
    }else if(platform == "android" || platform == "ios"){
      Alert.alert(
        "Confirmação",
        "Você tem certeza que deseja excluir?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: () => deleteHandle()
          }
        ]
      )
    }
    return;
  }

  const deleteHandle = async () =>{
    const res = await fetch(`http://${LOCALIP}:8000/controle/delete-config/${selectedOpc.id}`,
      {
        method: "DELETE",
      }
    );
    if(res.ok){
      router.push("/(tabs)");
    }
  }

  const applyHandler = async () =>{
    const res = await fetch(`http://${LOCALIP}:8040/config-atual/aplica-config`,
      {method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          max_distance_cm: selectedOpc.max_distance_cm,
          min_delay_ms: selectedOpc.min_delay_ms,
          max_delay_ms: selectedOpc.max_delay_ms,
          light_on: selectedOpc.light_on,
          sound_on: selectedOpc.sound_on
        })
      }
    );
    if (res.ok){
      if(platform == "web"){
        window.alert("Configuração aplicada com sucesso!");
      }else if(platform == "android" || platform == "ios"){
        Alert.alert(
          "Configuração selecionada!",
          "Configuração foi aplicada com sucesso!",
          [
            {
              text: "ok"
            }
          ]
        )
      }
    }
  }
  return(
  <View style={styles.container}>
    <Text style={styles.title}>Configuração</Text>
    <Picker style={{ width: "95%", zIndex: 10, elevation: 10, marginBottom: 30, textAlign: "center", backgroundColor: "#f5f5f5"}} selectedValue={selectedOpc.id} onValueChange={(value) => {
      const configSelected = opc.find((item) => item.id == value);
      setSelectedOpc(configSelected);
    }}>
      {opc.map((c) => (
        <Picker.Item key={c.id} label={`Opção ${c.id}`} value={c.id} />
      ))}
    </Picker>
    <View style={styles.grid_container}>
      <OpcoesDetail text={"Distancia Máxima"} value={selectedOpc.max_distance_cm}/>
      <OpcoesDetail text={"Delay Minimo"} value={selectedOpc.min_delay_ms}/>
      <OpcoesDetail text={"Delay Máximo"} value={selectedOpc.max_delay_ms}/>
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
      <TouchableOpacity style={styles.button} onPress={applyHandler}>
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
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "white",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },

  picker: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    marginBottom: 25,
  },

  grid_container: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },

  flex_container: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  button: {
    backgroundColor: "#4e73df",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});
