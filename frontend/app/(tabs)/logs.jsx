import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView} from 'react-native';
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
              console.log(data);
              
            }
          }
          fetchLogs();
          console.log(logs)
          
        }, [])
      );
	return(
		<ScrollView style={styles.background} showsVerticalScrollIndicator={false}>
			{logs.map((value) =>(
				<LogText tempo_de_inicio={value.datetime} duracao={value.tempo_leitura_s} distancia_array={value.values_json_cms} />
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        padding: 100
    }
})