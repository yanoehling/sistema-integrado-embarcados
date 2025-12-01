import { Text, View } from "react-native";


export default function LogText({tempo_de_inicio, duracao, distancia_array}){
    const [dataBr, timeBr] = traduzirHorario(tempo_de_inicio);
    const finalDate = somarHorario(tempo_de_inicio, duracao);
    return(
        <Text>[{dataBr} {timeBr} - {finalDate}]: {distancia_array}</Text>
    )
}

function traduzirHorario(horario){
    const date = new Date(horario);
    const dateBr = date.toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo"
    });

    const timeBr = date.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    return [dateBr, timeBr]
}

function somarHorario(horario, duracao){
    const date = new Date(horario);
    const segundos = parseFloat(duracao);
    const final_date = new Date(date.getTime() + segundos * 1000);
    return final_date.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
}