import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function LogText({ tempo_de_inicio, duracao, distancia_array }) {
  const [dataBr, timeBr] = traduzirHorario(tempo_de_inicio);
  const finalDate = somarHorario(tempo_de_inicio, duracao);
  const finalDateStr = new Date(finalDate).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let valores = [];
  try {
    valores = JSON.parse(distancia_array);
  } catch {
    valores = [];
  }

  return (
    <View style={styles.logContainer}>
      <Text style={styles.logHeaderTitle}>
        [{dataBr} {timeBr} - {finalDateStr}]
      </Text>
      <Text style={styles.logHeader}>Tempo de Leitura: {duracao}s</Text>
      <Text style={styles.logHeader}>Valores lidos: </Text>
      <Text style={styles.logValues}>{valores.join("cm, ")}cm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    
  logContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logHeader: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  logHeaderTitle: {
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
    fontSize: 16,
  },
  logValues: {
    color: "#555",
  },
});

// Funções de conversão
function traduzirHorario(horario) {
  const date = new Date(horario);
  const dataBr = date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const timeBr = date.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return [dataBr, timeBr];
}

function somarHorario(horario, duracao) {
  const date = new Date(horario);
  return new Date(date.getTime() + parseFloat(duracao) * 1000);
}
