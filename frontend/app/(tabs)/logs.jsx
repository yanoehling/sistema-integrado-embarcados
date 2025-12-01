import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LogText from '../../components/log-text';

const { LOCALIP } = require("./LOCALIP");

export default function LogScreen(){
	const [logs, setLogs] = useState([])
    useFocusEffect(
        useCallback(() => {
          async function fetchLogs(){
            const res = await fetch(`http://${LOCALIP}:8080/logging/get-all`);
            if (res.ok) {
              const data = await res.json();
              setLogs(data);
              
            }
          }
          fetchLogs();       
        }, [])
      );
	return(
        <View style={styles.background} >
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                {logs.map((value, index) =>(
                    <LogText tempo_de_inicio={value.datetime} duracao={value.tempo_leitura_s} distancia_array={value.values_json_cms} key={index}/>
                ))}
            </ScrollView>
        </View>
	);
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        padding: 100,
        justifyContent: "center",
        alignItems: "center"

    },
    scroll: {
        height: "100%"
    }
})