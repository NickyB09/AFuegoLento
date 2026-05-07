import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const featureCards = [
  {
    title: 'Menú degustación',
    body: 'Experiencias gastronómicas editables desde base de datos y pensadas para una reserva elegante.',
  },
  {
    title: 'Reservas simples',
    body: 'Fecha, hora, comensales, tipo de mesa, restricciones y notas del comensal.',
  },
  {
    title: 'Cuenta del cliente',
    body: 'Login, registro, recuperación de contraseña y revisión de reservas activas.',
  },
];

export function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-brand-charcoal" contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar style="light" />
      <View className="w-full flex-1 px-6 py-10" style={{ maxWidth: 1180, alignSelf: 'center' }}>
        <View className="mb-12 rounded-[32px] border border-brand-olive/30 bg-brand-charcoal px-6 py-12">
          <Text className="mb-3 text-xs uppercase text-brand-copper" style={{ letterSpacing: 4 }}>
            AFuegoLento
          </Text>
          <Text className="mb-5 text-5xl leading-[56px] text-brand-ivory" style={{ fontFamily: 'serif', maxWidth: 780 }}>
            Una experiencia editorial para reservas gastronómicas memorables.
          </Text>
          <Text className="mb-8 text-base leading-7 text-brand-ivory/80" style={{ maxWidth: 680 }}>
            Monorepo inicial con Expo Web, Express, Postgres, Docker y JWT. Punto de partida listo para construir el restaurante gourmet AFuegoLento.
          </Text>
          <View className="flex-col gap-4" style={{ maxWidth: 320 }}>
            <TouchableOpacity className="rounded-full bg-brand-copper px-6 py-4">
              <Text className="text-center font-semibold text-brand-ivory">Reservar experiencia</Text>
            </TouchableOpacity>
            <TouchableOpacity className="rounded-full border border-brand-ivory/25 px-6 py-4">
              <Text className="text-center font-semibold text-brand-ivory">Ver menú</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-col gap-4">
          {featureCards.map((card) => (
            <View key={card.title} className="rounded-[28px] border border-brand-olive/20 bg-brand-ivory px-6 py-7">
              <Text className="mb-3 text-3xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>
                {card.title}
              </Text>
              <Text className="leading-7 text-brand-charcoal/80">{card.body}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
