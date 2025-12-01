import * as React from 'react';
import {useRef, useEffect, useState} from 'react';
import {Animated, View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import InputComponent from '@/components/fom_component';
import Checkbox from "expo-checkbox"
import { useRouter } from 'expo-router';

const { LOCALIP } = require("./LOCALIP");

export default function CreationScreen(){
  const [maxDistanceError, setMaxDistanceError] = useState(false);
  const [maxDelayError, setmaxDelayError] = useState(false);
  const [minDelayError, setminDelayError] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minDelay, setMinDelay] = useState(0);
  const [maxDelay, setMaxDelay] = useState(0);
  const [lightsOn, setLightsOn] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const router = useRouter();
  const buttonHandler = async () =>{
    let erro = false
    if(maxDistance < 10){
      setMaxDistanceError(true);
      erro = true;
    }
    if(minDelay < 10){
      setminDelayError(true);
      erro = true;
    }
    if(maxDelay < 20){
      setmaxDelayError(true);
      erro = true;
    }
    if(erro)return false;

    const res = await fetch(`http://${LOCALIP}:5000/controle/add-config`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        max_distance_cm: maxDistance,
        min_delay_ms: minDelay,
        max_delay_ms: maxDelay,
        light_on: lightsOn,
        sound_on: soundOn
      })
    });
    const data = await res.text();
    console.log("Respota: " + data)
    return res.ok;
  }
  return(
  <View style={styles.container}>
    <Text style={styles.title}>Criando uma Configuração</Text>

    <InputComponent placeholder={"Distancia Máxima"} label={"Distancia Máxima (cm)"}  onChangeValue={(distance)=> {setMaxDistance(distance); setMaxDistanceError(false)}} boolError={maxDistanceError} messageError={"A distancia máxima tem que ser maior do que 10"}/>
    <InputComponent placeholder={"Delay Mínimo"} label={"Delay Mínimo (ms)"} onChangeValue={(delay) => {setMinDelay(delay); setminDelayError(false)}} boolError={minDelayError} messageError={"O Delay mínimo precisa ser maior do que 10"}/>
    <InputComponent placeholder={"Delay Máximo"} label={"Delay Máximo (ms)"} onChangeValue={(delay)=>{setMaxDelay(delay); setmaxDelayError(false)}} boolError={maxDelayError} messageError={"O Delay máximo precisa ser maior do que 20"}/>
    <View style={styles.check_box_container}>
      <Text style={styles.label}>Luzes Ligadas?</Text>
      <Checkbox value={lightsOn} onValueChange={setLightsOn} />
    </View>
    <View style={styles.check_box_container}>
      <Text style={styles.label}>Sons Ligados?</Text>
      <Checkbox value={soundOn} onValueChange={setSoundOn}/>
    </View>
    <TouchableOpacity style={styles.button} onPress={()=>{buttonHandler().then((ok)=>{console.log("Sucesso? " + ok); if(ok)router.push("/opcoes")})}}>
      <Text>Criar Opção</Text>
    </TouchableOpacity>
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
  title: {
    fontSize: 30,
    fontWeight: "bold"
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
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  check_box_container: {
    width: '100%',
    marginBottom: 10
  }
})