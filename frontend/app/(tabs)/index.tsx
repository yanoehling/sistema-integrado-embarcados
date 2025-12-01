import { useRef, useEffect } from 'react';
import { Animated, View, Text, Image, Button, StyleSheet, BackHandler, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animation]);

  return (
    <ImageBackground
      source={require('../../assets/images/BackgoundMainScreen.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.Image
        style={[styles.logo, { transform: [{ translateY: animation }] }]}
        source={require('../../assets/images/Volante.png')}
      />

      <Text style={styles.title}>Sense of Direction</Text>

      <View style={styles.button}>
        <Button title="Selecionar Opção" onPress={() => router.push('/opcoes')} />
      </View>

      <View style={styles.button}>
        <Button title="Sair" onPress={() => BackHandler.exitApp()} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 160,
    width: 160,
  },
  title: {
    padding: 30,
    fontSize: 20,
    width: 250,
    textAlign: 'center',
  },
  button: {
    padding: 15,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
});
