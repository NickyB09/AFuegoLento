import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export function Section({ title, subtitle, children, right }) {
  return (
    <View className="mb-8 rounded-[28px] border border-brand-olive/20 bg-brand-ivory px-5 py-5 md:px-7 md:py-7">
      <View className="mb-5 flex-row items-start justify-between gap-4">
        <View style={{ flex: 1 }}>
          <Text className="mb-2 text-3xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{title}</Text>
          {subtitle ? <Text className="text-brand-charcoal/75 leading-6">{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Input({ label, value, onChangeText, placeholder, multiline = false, secureTextEntry = false }) {
  return (
    <View className="mb-4">
      {label ? <Text className="mb-2 text-sm font-semibold text-brand-charcoal">{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b705c"
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        className="rounded-2xl border border-brand-olive/25 bg-white px-4 py-3 text-brand-charcoal"
        style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : undefined}
      />
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled = false }) {
  const base = 'rounded-full px-5 py-3';
  const variants = {
    primary: 'bg-brand-copper',
    secondary: 'border border-brand-charcoal/20 bg-transparent',
    dark: 'bg-brand-charcoal',
    danger: 'bg-brand-wine',
  };
  const textVariants = {
    primary: 'text-brand-ivory',
    secondary: 'text-brand-charcoal',
    dark: 'text-brand-ivory',
    danger: 'text-brand-ivory',
  };

  return (
    <TouchableOpacity className={`${base} ${variants[variant]} ${disabled ? 'opacity-50' : ''}`} onPress={onPress} disabled={disabled}>
      <Text className={`text-center font-semibold ${textVariants[variant]}`}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Pill({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-brand-charcoal/10 text-brand-charcoal',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <View className={`self-start rounded-full px-3 py-1 ${tones[tone]}`}>
      <Text className="text-xs font-semibold uppercase tracking-wide">{children}</Text>
    </View>
  );
}

export function Notice({ tone = 'info', children }) {
  const tones = {
    info: 'border-brand-olive/20 bg-brand-ivory text-brand-charcoal',
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  };
  return (
    <View className={`mb-4 rounded-2xl border px-4 py-3 ${tones[tone]}`}>
      <Text>{children}</Text>
    </View>
  );
}
