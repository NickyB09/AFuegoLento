import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { unstable_createElement as createWebElement } from 'react-native-web';
import { StatusBar } from 'expo-status-bar';

import { Button, Notice, Pill, Section, Input } from '../../components/UI';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { formatCurrency, formatDate } from '../../utils/format';

// Páginas principales usadas por el menú y el render condicional.
const pages = [
  { key: 'home', label: 'Inicio' },
  { key: 'menu', label: 'Menú' },
  { key: 'reserve', label: 'Reservas' },
  { key: 'account', label: 'Cuenta' },
  { key: 'contact', label: 'Contacto' },
];

// Imágenes externas que dan la identidad visual editorial del sitio.
const heroImage = 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9uZG8lMjBkZSUyMGNvbWlkYXxlbnwwfHwwfHx8MA%3D%3D';
const philosophyImage = 'https://img.freepik.com/foto-gratis/vista-arriba-mesa-llena-comida_23-2149209253.jpg?semt=ais_hybrid&w=740&q=80';
const productImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXblMFmC8i3p374xaVnvESQa57J8tJ5c0CUhyFf2cZLJg0CrN7TAjcvXpbX8D4jk3BGIbFrUgfyKsmAVgrRPObYhh6zg5--qjXsgqlQlc7sGdnpHdw6qK7Q6MXWj-DZ8h5YC-KaqIA1hBc7uFCqsPiFlV6PU6F1_ZddCZ8qhAjG0YUToR7ozl9WJBOW2GG4kPrLWi1RinzdeOrlDa3MWeDgzDsVznaOuOHff64pQ-guEHu3M-zaFeEV3Mj0sboR35lr1uKsc3uPy4';
const techniqueImage = 'https://st2.depositphotos.com/1046535/7932/i/450/depositphotos_79326892-stock-photo-female-chef-in-restaurant-kitchen.jpg';
const atmosphereImage = 'https://img.freepik.com/foto-gratis/composicion-acogedora-velas-elemento-tejido-guirnalda_169016-48476.jpg?semt=ais_hybrid&w=740&q=80';
const tastingImage = 'https://images.ctfassets.net/pujs1b1v0165/7ndXxKorH27YELFGoeGMXE/13a5356cbf6ab4145823a65670d0f4fc/venison-tartare.jpg?w=1200&fit=fill&fm=webp';
const reserveCtaImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd5CaZnvNb3BJVNvD4a24LQCpuMugdjcnoVCmdX3K08J2gQqzq68I3yDrg3rTK2X6cTRbCgGPXe22hPhRscpifmZ1Qylhqd1pVzorgrgcz__1DjQOLRB3UrQZYdHewffM1yS87QrWjL06PJhvlugR8ymbqj5clPclMtk4yGC33p5yrqIIOSHvt7BmIxV-TaY9HT-a7I5zaLS8T9EiGEw7ltmiHK68cXbxy9FvVrCYMouPA6I0FLhBU6Af2wLE_4UpCM17O3KL1xfg';
const authBackground = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmTDc1F3jnRg6zLnWHzH0gBGWeLfhDUB3HfxUkqO1rzyfBU-uo1twnx0E3u5hhNJpCFgiSLruztw5K-61AGe2n2-FkWyzayJjtwqWjoYhdcP4SjqpO71gVYpHVa_RXHmYRQDat2kILhEalduZyO1XgZ_qbLMx06yBZECX9M8oxA4deHeJBc2dv7JBJ-Kuzsjeb13e701MQkKE1qswgz255LTvk1w8N2X9PH6v0plddV7oKgO5t-_s05QRvtMF0rkz-BRyiEgX0tRk';
const reservePromptImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
const registerBackground = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80';
const reserveBackground = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80';
const accountBackground = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80';
const contactBackground = 'https://images.unsplash.com/photo-1515669097368-22e68427d265?auto=format&fit=crop&w=1400&q=80';

// Estados iniciales de formularios; ayudan a limpiar campos después de cada acción.
const emptyRegister = { name: '', email: '', password: '', phone: '' };
const emptyLogin = { email: '', password: '' };
const emptyForgot = { email: '' };
const emptyReset = { token: '', newPassword: '' };
const emptyReservation = {
  reservationDate: '',
  reservationTime: '',
  guestCount: '2',
  tableTypeId: '',
  diningExperienceId: '',
  allergies: '',
  dietaryRestrictions: '',
  specialOccasion: '',
  guestNotes: '',
};
const emptyCategory = { name: '', description: '', sortOrder: '0' };
const emptyExperience = { name: '', description: '', price: '', isActive: true };
const emptyItem = { categoryId: '', experienceId: '', name: '', description: '', price: '', imageUrl: '', isAvailable: true };

// Traducción visual de estados de reserva para mostrarlos como etiquetas.
const reservationStatusMeta = {
  pending: { label: 'Pendiente', tone: 'default' },
  confirmed: { label: 'Confirmada', tone: 'success' },
  finalized: { label: 'Finalizada', tone: 'default' },
  cancelled: { label: 'Cancelada', tone: 'danger' },
};

// Convierte una reserva existente al formato que usa el formulario de edición.
function reservationToForm(reservation) {
  return {
    reservationDate: reservation?.reservation_date || '',
    reservationTime: reservation?.reservation_time ? reservation.reservation_time.slice(0, 5) : '',
    guestCount: reservation?.guest_count ? String(reservation.guest_count) : '2',
    tableTypeId: reservation?.table_type_id || '',
    diningExperienceId: reservation?.dining_experience_id || '',
    allergies: reservation?.allergies || '',
    dietaryRestrictions: reservation?.dietary_restrictions || '',
    specialOccasion: reservation?.special_occasion || '',
    guestNotes: reservation?.guest_notes || '',
  };
}

// Evita romper la UI si llega un estado desconocido desde la API.
function normalizeStatus(status) {
  return reservationStatusMeta[status] || { label: status, tone: 'default' };
}

// Botón reutilizable para abrir el drawer de navegación.
function HamburgerButton({ onPress, className = '' }) {
  return (
    <Pressable onPress={onPress} className={`self-start rounded-full border border-white/12 bg-[#171514]/78 px-4 py-3 ${className}`}>
      <View className="flex-row items-center gap-3">
        <View className="gap-[3px]">
          <View className="h-[2px] w-4 rounded-full bg-brand-copper" />
          <View className="h-[2px] w-4 rounded-full bg-brand-ivory" />
          <View className="h-[2px] w-4 rounded-full bg-brand-copper" />
        </View>
        <Text className="text-xs uppercase tracking-[3px] text-brand-ivory">Menú</Text>
      </View>
    </Pressable>
  );
}

// Hook central: concentra navegación, sesión, carga de datos y avisos globales.
function useAppData() {
  const [page, setPage] = useState('home');
  const [content, setContent] = useState(null);
  const [menu, setMenu] = useState({ categories: [], items: [], experiences: [] });
  const [tableTypes, setTableTypes] = useState([]);
  const [auth, setAuth] = useState(storage.getAuth());
  const [reservations, setReservations] = useState([]);
  const [adminReservations, setAdminReservations] = useState([]);
  const [adminMenu, setAdminMenu] = useState({ categories: [], items: [], experiences: [] });
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = auth?.accessToken || null;
  const user = auth?.user || null;
  const isAdmin = user?.role === 'admin';

  const showNotice = (tone, message) => setNotice({ tone, message });

  // Carga la información que cualquier visitante puede ver.
  async function loadPublicData() {
    const [contentResponse, menuResponse, tableTypesResponse] = await Promise.all([
      api.getContent(),
      api.getMenu(),
      api.getTableTypes(),
    ]);
    setContent(contentResponse.data);
    setMenu(menuResponse.data);
    setTableTypes(tableTypesResponse.data);
  }

  // Valida la sesión actual y usa refresh token si el access token venció.
  async function refreshSession(nextAuth = auth) {
    if (!nextAuth?.accessToken) return null;
    try {
      const me = await api.me(nextAuth.accessToken);
      const updatedAuth = { ...nextAuth, user: me.data };
      storage.setAuth(updatedAuth);
      setAuth(updatedAuth);
      return updatedAuth;
    } catch (error) {
      if (!nextAuth?.refreshToken) throw error;
      const refreshed = await api.refresh({ refreshToken: nextAuth.refreshToken });
      const payload = refreshed.data;
      storage.setAuth(payload);
      setAuth(payload);
      return payload;
    }
  }

  // Carga reservas y, si aplica, datos administrativos.
  async function loadPrivateData(nextAuth = auth) {
    if (!nextAuth?.accessToken) {
      setReservations([]);
      setAdminReservations([]);
      return;
    }

    const activeAuth = await refreshSession(nextAuth);
    const mine = await api.myReservations(activeAuth.accessToken);
    setReservations(mine.data);

    if (activeAuth.user.role === 'admin') {
      const [reservationsResponse, menuResponse] = await Promise.all([
        api.adminReservations(activeAuth.accessToken),
        api.adminMenu(activeAuth.accessToken),
      ]);
      setAdminReservations(reservationsResponse.data);
      setAdminMenu(menuResponse.data);
    } else {
      setAdminReservations([]);
      setAdminMenu({ categories: [], items: [], experiences: [] });
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await loadPublicData();
        if (auth) {
          await loadPrivateData(auth);
        }
      } catch (error) {
        showNotice('error', error.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const groupedItems = useMemo(() => {
    return menu.categories.map((category) => ({
      ...category,
      items: menu.items.filter((item) => item.category_id === category.id),
    }));
  }, [menu]);

  return {
    page,
    setPage,
    content,
    menu,
    groupedItems,
    tableTypes,
    auth,
    token,
    user,
    isAdmin,
    reservations,
    adminReservations,
    adminMenu,
    notice,
    loading,
    showNotice,
    clearNotice: () => setNotice(null),
    reloadPublic: loadPublicData,
    reloadPrivate: loadPrivateData,
    setAuthAndPersist(payload) {
      storage.setAuth(payload);
      setAuth(payload);
    },
    logout: async () => {
      try {
        if (auth?.refreshToken) {
          await api.logout({ refreshToken: auth.refreshToken });
        }
      } catch {}
      storage.clearAuth();
      setAuth(null);
      setReservations([]);
      setAdminReservations([]);
      setPage('home');
    },
  };
}

// Contenedor oscuro común para bloques destacados.
function DarkPanel({ children, className = '' }) {
  return <View className={`overflow-hidden rounded-[28px] border border-white/10 bg-[#171514]/95 ${className}`}>{children}</View>;
}

// Campo con estilo de línea usado en formularios con fondo oscuro.
function LineField({ label, value, onChangeText, placeholder, secureTextEntry = false, multiline = false }) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/55">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8f877d"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        className={`border-b border-white/15 text-[17px] text-brand-ivory ${multiline ? 'pb-3 pt-3' : ''}`}
        style={
          multiline
            ? { minHeight: 96, textAlignVertical: 'top' }
            : { height: 52, paddingTop: 0, paddingBottom: 0, lineHeight: 22, textAlignVertical: 'center' }
        }
      />
    </View>
  );
}

// Modal que guía al usuario a iniciar sesión antes de reservar.
function ReservePromptModal({ visible, onClose, onLogin, onRegister }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/82 px-4" onPress={onClose}>
        <Pressable className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-[#1d1a19]" onPress={() => {}}>
          <View className="relative px-6 py-7">
            <Image source={{ uri: reservePromptImage }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-15" />
            <View className="absolute inset-0 bg-[#1d1a19]/92" />
            <View className="relative">
              <View className="mb-5 flex-row items-center justify-between">
                <Text className="text-xs uppercase tracking-[4px] text-brand-copper">Reservas</Text>
                <Pressable onPress={onClose} className="rounded-full border border-white/10 px-3 py-2">
                  <Text className="text-[11px] uppercase tracking-[3px] text-brand-ivory/70">Cerrar</Text>
                </Pressable>
              </View>
              <Text className="text-3xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Antes de reservar</Text>
              <Text className="mt-2 text-base italic text-brand-ivory/62" style={{ fontFamily: 'serif' }}>Tu mesa merece un ingreso elegante.</Text>
              <Text className="mt-4 leading-7 text-brand-ivory/75">
                Para continuar con la reserva necesitas una cuenta. Puedes iniciar sesión si ya tienes una o registrarte en segundos.
              </Text>
              <View className="mt-6 gap-3">
                <Button title="Iniciar sesión" onPress={onLogin} />
                <Button title="Registrarme" variant="secondary" onPress={onRegister} />
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Navegación principal con drawer para mantener la interfaz limpia en web/móvil.
function Navigation({ page, setPage, isAdmin, onReservePress, drawerOpen, setDrawerOpen, hideBar = false }) {
  const navItems = isAdmin ? [...pages, { key: 'admin', label: 'Admin' }] : pages;

  function handleNavigation(item) {
    if (item.key === 'reserve') {
      onReservePress();
    } else {
      setPage(item.key);
    }
    setDrawerOpen(false);
  }

  return (
    <>
      {!hideBar ? (
        <DarkPanel className="mb-4">
          <View className="flex-row items-center justify-between px-3 py-3 md:px-6 md:py-5">
            <Pressable onPress={() => setDrawerOpen(true)} className="rounded-full border border-white/10 bg-[#1b1817] px-4 py-3">
              <Text className="text-xs uppercase tracking-[3px] text-brand-copper md:text-sm">Menú</Text>
            </Pressable>
            <Pressable onPress={() => setPage('home')} className="px-2">
              <Text className="text-xl italic text-brand-ivory md:text-2xl" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
            </Pressable>
            <Pressable onPress={onReservePress} className="rounded-full border border-brand-copper/40 bg-[#1b1817] px-4 py-3">
              <Text className="text-xs uppercase tracking-[3px] text-brand-copper md:text-sm">Reservar</Text>
            </Pressable>
          </View>
        </DarkPanel>
      ) : null}

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View className="flex-1 flex-row bg-black/74">
          <View className="h-full w-[310px] border-r border-white/10 bg-[#1c1918] px-5 py-10">
            <View className="mb-8 flex-row items-center justify-between">
              <Text className="text-2xl italic text-brand-ivory" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
              <Pressable onPress={() => setDrawerOpen(false)} className="rounded-full border border-white/10 px-3 py-2">
                <Text className="text-xs uppercase tracking-[3px] text-brand-ivory/70">Cerrar</Text>
              </Pressable>
            </View>

            <Text className="mb-6 text-sm leading-6 text-brand-ivory/58">
              Navega la experiencia, descubre la carta y reserva tu próxima mesa con calma.
            </Text>

            <View className="gap-2">
              {navItems.map((item) => (
                <Pressable key={item.key} onPress={() => handleNavigation(item)} className={`rounded-[20px] px-4 py-4 ${page === item.key ? 'border border-white/10 bg-white/5' : 'border border-transparent'}`}>
                  <Text className={`${page === item.key ? 'text-brand-copper' : 'text-brand-ivory/70'} text-sm uppercase tracking-[3px]`}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="mt-8 rounded-[24px] border border-white/10 bg-[#171514] px-4 py-5">
              <Text className="text-xs uppercase tracking-[4px] text-brand-copper">Disponibilidad limitada</Text>
              <Text className="mt-3 text-2xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Reserve una experiencia</Text>
              <Text className="mt-2 text-sm leading-6 text-brand-ivory/62">Mesas íntimas y un recorrido de temporada diseñado para una noche memorable.</Text>
              <Pressable onPress={() => handleNavigation({ key: 'reserve' })} className="mt-5 rounded-full bg-brand-copper px-4 py-3">
                <Text className="text-center text-xs uppercase tracking-[3px] text-brand-ivory">Ir a reservas</Text>
              </Pressable>
            </View>
          </View>

          <Pressable className="flex-1" onPress={() => setDrawerOpen(false)} />
        </View>
      </Modal>
    </>
  );
}

// Landing editorial: presenta marca, propuesta y llamados a la acción.
function HomePage({ data, setPage, onReservePress }) {
  const featuredDishes = [
    { name: 'Tartar de ciervo ahumado', price: '28', description: 'Yema curada, mostaza antigua y pan de masa madre.' },
    { name: 'Rodaballo a la brasa', price: '42', description: 'Emulsión de sus espinas y alcachofas confitadas.' },
    { name: 'Lomo madurado 60 días', price: '55', description: 'Puré rústico y demiglase de huesos tostados.' },
  ];

  const experienceCards = [
    { title: 'Producto local', body: 'Ingredientes de temporada, seleccionados a mano cada mañana.', image: productImage },
    { title: 'Técnica ancestral', body: 'Cocción a la leña y brasas para sabores auténticos y profundos.', image: techniqueImage },
    { title: 'Atmósfera íntima', body: 'Un santuario diseñado para la pausa y el disfrute sensorial.', image: atmosphereImage },
  ];

  return (
    <>
      <DarkPanel className="mb-8">
        <View className="relative min-h-[560px] overflow-hidden md:min-h-[760px]">
          <Image source={{ uri: heroImage }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-65" />
          <View className="absolute inset-0 bg-black/50" />
          <View className="absolute inset-0 bg-gradient-to-t from-[#171514] via-[#171514]/78 to-transparent" />
          <View className="relative items-center justify-center px-5 py-14 md:px-12 md:py-24" style={{ minHeight: 560 }}>
            <Text className="text-center text-[38px] leading-[44px] text-brand-ivory md:text-[82px] md:leading-[88px]" style={{ fontFamily: 'serif' }}>
              AFuegoLento
            </Text>
            <Text className="mt-3 px-4 text-center text-[18px] italic leading-[30px] text-brand-ivory/85 md:text-3xl" style={{ fontFamily: 'serif' }}>
              El arte de la paciencia en cada plato.
            </Text>
            <Text className="mt-5 max-w-2xl px-4 text-center text-[15px] leading-8 text-brand-ivory/60 md:text-lg">
              {data?.brand?.description || 'Restaurante gourmet de inspiración Michelin donde el tiempo, la técnica y el detalle construyen una experiencia íntima.'}
            </Text>
            <View className="mt-8 w-full max-w-md gap-3 md:flex-row md:justify-center">
              <Pressable onPress={onReservePress} className="bg-brand-copper px-8 py-4">
                <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Reservar</Text>
              </Pressable>
              <Pressable onPress={() => setPage('menu')} className="border border-white/80 bg-transparent px-8 py-4">
                <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Ver menú</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </DarkPanel>

      <View className="mb-8 gap-6 md:grid md:grid-cols-12 md:items-center md:gap-10">
        <View className="md:col-span-5 md:col-start-1">
          <DarkPanel>
            <Image source={{ uri: philosophyImage }} resizeMode="cover" className="h-[320px] w-full md:h-[520px]" />
          </DarkPanel>
        </View>
        <View className="md:col-span-6 md:col-start-7 px-1 md:px-2">
          <Text className="text-xs uppercase tracking-[4px] text-brand-copper">Nuestra Filosofía</Text>
          <Text className="mt-4 text-[28px] leading-[36px] text-brand-ivory md:text-5xl md:leading-[58px]" style={{ fontFamily: 'serif' }}>
            Tiempo y{'\n'}<Text className="italic text-brand-copper">dedicación.</Text>
          </Text>
          <Text className="mt-5 max-w-[320px] text-[16px] leading-9 text-brand-ivory/60 md:max-w-none md:text-lg md:leading-8">
            Creemos que los mejores sabores no se pueden apresurar. Nuestro enfoque de la gastronomía es una reverencia al proceso, permitiendo que cada ingrediente alcance su máxima expresión a través de técnicas lentas y deliberadas.
          </Text>
          <View className="mt-6 max-w-[300px] border-l-2 border-brand-copper/60 pl-4">
            <Text className="text-base leading-8 text-brand-ivory/60">Una experiencia diseñada para detener el reloj.</Text>
          </View>
        </View>
      </View>

      <DarkPanel className="mb-8 px-5 py-10 md:px-8 md:py-14">
        <Text className="text-center text-xs uppercase tracking-[4px] text-brand-copper">La Experiencia</Text>
        <Text className="mt-4 text-center text-3xl text-brand-ivory md:text-5xl" style={{ fontFamily: 'serif' }}>Más allá de un restaurante</Text>
        <View className="mt-10 gap-6 md:grid md:grid-cols-3">
          {experienceCards.map((card, index) => (
            <View key={card.title} className={`${index === 1 ? 'md:-mt-10' : ''}`}>
              <DarkPanel>
                <Image source={{ uri: card.image }} resizeMode="cover" className="h-[280px] w-full md:h-[360px]" />
              </DarkPanel>
              <Text className="mt-4 text-3xl italic text-brand-ivory" style={{ fontFamily: 'serif' }}>{card.title}</Text>
              <Text className="mt-2 leading-7 text-brand-ivory/65">{card.body}</Text>
            </View>
          ))}
        </View>
      </DarkPanel>

      <View className="mb-8 gap-8 md:grid md:grid-cols-2 md:items-center md:gap-12">
        <View>
          <Text className="text-xs uppercase tracking-[4px] text-brand-copper">Degustación</Text>
          <Text className="mt-4 text-3xl leading-[40px] text-brand-ivory md:text-5xl md:leading-[58px]" style={{ fontFamily: 'serif' }}>
            Un viaje a través del sabor
          </Text>
          <View className="mt-8 gap-6">
            {featuredDishes.map((dish) => (
              <View key={dish.name} className="border-b border-white/10 pb-5">
                <View className="mb-2 flex-row items-start justify-between gap-4">
                  <Text className="flex-1 text-xl italic text-brand-ivory md:text-2xl" style={{ fontFamily: 'serif' }}>{dish.name}</Text>
                  <Text className="text-lg text-brand-copper">{dish.price}</Text>
                </View>
                <Text className="text-sm leading-6 text-brand-ivory/60">{dish.description}</Text>
              </View>
            ))}
          </View>
          <Pressable onPress={() => setPage('menu')} className="mt-8 self-start border border-brand-copper/35 px-4 py-3">
            <Text className="text-xs uppercase tracking-[4px] text-brand-copper">Ver menú completo</Text>
          </Pressable>
        </View>

        <DarkPanel>
          <View className="relative">
            <Image source={{ uri: tastingImage }} resizeMode="cover" className="h-[340px] w-full md:h-[600px]" />
            <View className="absolute bottom-4 left-4 bg-[#171514]/92 px-4 py-4 md:bottom-6 md:left-6 md:px-6">
              <Text className="text-xl italic text-brand-ivory md:text-2xl" style={{ fontFamily: 'serif' }}>Menú de temporada</Text>
              <Text className="mt-2 text-xs uppercase tracking-[4px] text-brand-copper">Otoño / Invierno</Text>
            </View>
          </View>
        </DarkPanel>
      </View>

      <DarkPanel className="mb-4">
        <View className="relative overflow-hidden px-5 py-12 md:px-10 md:py-20">
          <Image source={{ uri: reserveCtaImage }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-20" />
          <View className="absolute inset-0 bg-[#171514]/82" />
          <View className="relative mx-auto max-w-3xl text-center">
            <Text className="text-4xl text-brand-ivory md:text-6xl" style={{ fontFamily: 'serif' }}>Asegure su mesa</Text>
            <Text className="mt-5 text-[16px] leading-8 text-brand-ivory/70 md:text-lg">
              Le invitamos a formar parte de nuestra próxima experiencia gastronómica. Disponibilidad limitada.
            </Text>
            <View className="mx-auto mt-8 w-full max-w-sm">
              <Pressable onPress={onReservePress} className="bg-brand-copper px-8 py-4">
                <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Reservar ahora</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </DarkPanel>
    </>
  );
}

// Vista pública del menú agrupado por categoría y experiencias.
function MenuPage({ groupedItems, experiences }) {
  return (
    <DarkPanel className="mb-6 overflow-hidden">
      <View className="bg-[#f3ede2] px-5 py-8 md:px-8 md:py-10">
        <View className="mb-8 border-b border-[#2c251f]/18 pb-6 md:flex-row md:items-end md:justify-between">
          <View className="md:max-w-xl">
            <Text className="text-xs uppercase tracking-[4px] text-[#8a5a39]">Carta de temporada</Text>
            <Text className="mt-3 text-4xl text-[#221d19] md:text-5xl" style={{ fontFamily: 'serif' }}>Menú AFuegoLento</Text>
            <Text className="mt-3 text-[15px] leading-7 text-[#4e463f]">
              Una selección de platos y recorridos con una presencia más editorial, inspirada en una carta de restaurante de autor.
            </Text>
          </View>
          <Text className="mt-4 text-right text-xs uppercase tracking-[4px] text-[#7f766d] md:mt-0">Degustación · Principales · Especialidades</Text>
        </View>

        <View className="mb-6 gap-3">
          {experiences.map((experience) => (
            <View key={experience.id} className="rounded-[24px] border border-[#2c251f]/12 bg-[#fbf7f1] px-4 py-4">
              <View className="flex-row items-start justify-between gap-4">
                <View style={{ flex: 1 }}>
                  <Text className="text-2xl text-[#221d19]" style={{ fontFamily: 'serif' }}>{experience.name}</Text>
                  <Text className="mt-2 leading-7 text-[#4e463f]">{experience.description}</Text>
                </View>
                <Text className="text-base font-semibold text-[#8a5a39]">{formatCurrency(experience.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-5 md:grid md:grid-cols-2">
          {groupedItems.map((category, index) => (
            <View key={category.id} className={`rounded-[28px] border border-[#2c251f]/12 bg-[#fffdf8] px-4 py-5 ${index % 2 === 1 ? 'md:mt-14' : ''}`}>
              <Text className="text-[13px] font-semibold uppercase tracking-[4px] text-[#7f766d]">{index === 0 ? 'Aperitivos' : index === 1 ? 'Principales' : category.name}</Text>
              <Text className="mt-2 text-3xl text-[#221d19]" style={{ fontFamily: 'serif' }}>{category.name}</Text>
              {category.description ? <Text className="mt-2 leading-7 text-[#4e463f]">{category.description}</Text> : null}
              <View className="mt-4 gap-3">
                {category.items.map((item) => (
                  <View key={item.id} className="border-t border-[#2c251f]/10 pt-3">
                    <View className="flex-row items-start justify-between gap-4">
                      <View style={{ flex: 1 }}>
                        <Text className="text-lg font-semibold text-[#221d19]">{item.name}</Text>
                        <Text className="mt-1 leading-6 text-[#4e463f]">{item.description}</Text>
                      </View>
                      <Text className="font-semibold text-[#8a5a39]">{formatCurrency(item.price)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </DarkPanel>
  );
}

// Tarjeta seleccionable para escoger experiencia gastronómica.
function ExperienceChoice({ selected, onPress, title, body, subtitle }) {
  return (
    <Pressable onPress={onPress} className={`rounded-[20px] border px-4 py-4 ${selected ? 'border-brand-copper bg-brand-copper/10' : 'border-white/10 bg-[#1b1817]'}`}>
      <Text className="text-lg text-brand-ivory" style={{ fontFamily: 'serif', opacity: selected ? 1 : 0.92 }}>{title}</Text>
      {subtitle ? <Text className="mt-1 text-xs uppercase tracking-[3px] text-brand-copper">{subtitle}</Text> : null}
      {body ? <Text className="mt-2 leading-6 text-brand-ivory" style={{ opacity: 0.68 }}>{body}</Text> : null}
    </Pressable>
  );
}

// Usa inputs nativos en web para fecha/hora y mantiene fallback para otros entornos.
function DateTimeField({ label, value, onChangeText, type = 'date', min }) {
  if (Platform.OS === 'web') {
    return (
      <View className="mb-6">
        <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/55">{label}</Text>
        {createWebElement('input', {
          type,
          value,
          min,
          onChange: (event) => onChangeText(event.target.value),
          style: {
            width: '100%',
            height: 52,
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: '0 16px',
            color: '#F3EEE6',
            outline: 'none',
            fontSize: 17,
            boxSizing: 'border-box',
            fontFamily: 'system-ui, sans-serif',
          },
        })}
      </View>
    );
  }

  return (
    <View className="mb-6">
      <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/55">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="h-[52px] border-b border-white/15 text-[17px] text-brand-ivory"
        placeholderTextColor="#8f877d"
        autoCapitalize="none"
        style={{ paddingTop: 0, paddingBottom: 0, lineHeight: 22, textAlignVertical: 'center' }}
      />
    </View>
  );
}

// Formulario de creación/edición de reservas conectado a la API.
function ReservePage({ user, tableTypes, experiences, onRequireAuth, onCreate, onUpdate, confirmation, editingReservation, onCancelEdit }) {
  const [form, setForm] = useState(emptyReservation);

  useEffect(() => {
    setForm(editingReservation ? reservationToForm(editingReservation) : emptyReservation);
  }, [editingReservation]);

  const isEditing = !!editingReservation;
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      {!user ? <Notice tone="info">Debes iniciar sesión o registrarte para confirmar una reserva.</Notice> : null}

      <DarkPanel className="mb-6 overflow-hidden">
        <View className="relative overflow-hidden px-5 py-10 md:px-8 md:py-12">
          <Image source={{ uri: reserveBackground }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-18" />
          <View className="absolute inset-0 bg-[#171514]/90" />
          <View className="relative">
            <Text className="text-center text-xs uppercase tracking-[4px] text-brand-copper">Una experiencia singular</Text>
            <Text className="mt-4 text-center text-4xl text-brand-ivory md:text-5xl" style={{ fontFamily: 'serif' }}>{isEditing ? 'Editar Reserva' : 'Su Mesa'}</Text>
            <Text className="mt-3 text-center text-lg italic text-brand-ivory" style={{ fontFamily: 'serif', opacity: 0.7 }}>
              {isEditing ? 'Ajuste los detalles de su visita.' : 'Permítanos preparar su espacio.'}
            </Text>
            <Text className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-brand-ivory" style={{ opacity: 0.62 }}>
              Elija fecha, hora y el tipo de experiencia con un flujo más cómodo para que su reserva se sienta tan cuidada como la visita.
            </Text>
          </View>
        </View>
      </DarkPanel>

      <DarkPanel className="mb-6 px-5 py-6 md:px-8 md:py-8">
        <Text className="mb-6 text-xs uppercase tracking-[4px] text-brand-copper">Fecha y comensales</Text>
        <DateTimeField label="Fecha" value={form.reservationDate} onChangeText={(value) => setForm((prev) => ({ ...prev, reservationDate: value }))} min={today} />
        <DateTimeField label="Hora" value={form.reservationTime} onChangeText={(value) => setForm((prev) => ({ ...prev, reservationTime: value }))} type="time" />
        <LineField label="Comensales" value={form.guestCount} onChangeText={(value) => setForm((prev) => ({ ...prev, guestCount: value }))} placeholder="2" />
      </DarkPanel>

      <DarkPanel className="mb-6 px-5 py-6 md:px-8 md:py-8">
        <Text className="mb-6 text-xs uppercase tracking-[4px] text-brand-copper">Ubicación preferida</Text>
        <View className="gap-3">
          {tableTypes.map((type) => (
            <ExperienceChoice
              key={type.id}
              selected={form.tableTypeId === type.id}
              onPress={() => setForm((prev) => ({ ...prev, tableTypeId: prev.tableTypeId === type.id ? '' : type.id }))}
              title={type.name}
              subtitle={`Capacidad ${type.capacity_min}-${type.capacity_max}`}
              body={type.description}
            />
          ))}
        </View>
      </DarkPanel>

      <DarkPanel className="mb-6 px-5 py-6 md:px-8 md:py-8">
        <Text className="mb-6 text-xs uppercase tracking-[4px] text-brand-copper">La experiencia</Text>
        <View className="gap-3">
          <ExperienceChoice
            selected={form.diningExperienceId === ''}
            onPress={() => setForm((prev) => ({ ...prev, diningExperienceId: '' }))}
            title="A la carta"
            body="Selección libre de nuestra temporada."
          />
          {experiences.map((experience) => (
            <ExperienceChoice
              key={experience.id}
              selected={form.diningExperienceId === experience.id}
              onPress={() => setForm((prev) => ({ ...prev, diningExperienceId: experience.id }))}
              title={experience.name}
              subtitle={formatCurrency(experience.price)}
              body={experience.description}
            />
          ))}
        </View>
      </DarkPanel>

      <DarkPanel className="mb-6 px-5 py-6 md:px-8 md:py-8">
        <Text className="mb-6 text-xs uppercase tracking-[4px] text-brand-copper">Detalles finales</Text>
        <LineField label="Alergias o restricciones" value={form.allergies} onChangeText={(value) => setForm((prev) => ({ ...prev, allergies: value }))} placeholder="Sin gluten, alergia a mariscos..." />
        <LineField label="Motivo especial" value={form.specialOccasion} onChangeText={(value) => setForm((prev) => ({ ...prev, specialOccasion: value }))} placeholder="Aniversario, cumpleaños..." />
        <LineField label="Restricciones alimentarias" value={form.dietaryRestrictions} onChangeText={(value) => setForm((prev) => ({ ...prev, dietaryRestrictions: value }))} placeholder="Vegetariano, sin lactosa..." />
        <LineField label="Notas adicionales" value={form.guestNotes} onChangeText={(value) => setForm((prev) => ({ ...prev, guestNotes: value }))} placeholder="Algún detalle importante para su visita..." multiline />
      </DarkPanel>

      <DarkPanel className="mb-4 px-5 py-6 md:px-8 md:py-8">
        <View className="gap-3">
          <Button
            title={isEditing ? 'Guardar cambios' : 'Confirmar reserva'}
            onPress={() => (user ? (isEditing ? onUpdate(editingReservation.id, form) : onCreate(form)) : onRequireAuth())}
          />
          {isEditing ? <Button title="Cancelar edición" variant="secondary" onPress={onCancelEdit} /> : null}
          {!user ? <Button title="Iniciar sesión o registrarme" variant="secondary" onPress={onRequireAuth} /> : null}
          <Text className="mt-2 text-center text-xs uppercase tracking-[3px] text-brand-ivory/40">Al confirmar, acepta nuestras políticas de cancelación.</Text>
        </View>
      </DarkPanel>
    </>
  );
}

// Confirmación posterior a crear o editar una reserva.
function ReservationConfirmationPage({ reservation, onGoHome, onGoAccount }) {
  if (!reservation) return null;

  const status = normalizeStatus(reservation.status);

  return (
    <DarkPanel className="mx-auto mb-6 w-full max-w-2xl px-5 py-8 md:px-8 md:py-10">
      <View className="items-center text-center">
        <View className="mb-5 h-20 w-20 items-center justify-center rounded-full border border-brand-copper/20 bg-brand-copper/10">
          <Text className="text-4xl text-brand-copper">✓</Text>
        </View>
        <Text className="text-lg italic text-brand-ivory/70" style={{ fontFamily: 'serif' }}>Tu mesa te espera</Text>
        <Text className="mt-2 text-4xl text-brand-ivory md:text-5xl" style={{ fontFamily: 'serif' }}>Reserva Confirmada</Text>
        <View className="mt-6 h-px w-12 bg-brand-copper/30" />
      </View>

      <View className="mt-8 rounded-[24px] border border-white/10 bg-[#120f0f] px-5 py-5">
        <View className="mb-5 flex-row justify-end">
          <Pill tone={status.tone}>{status.label}</Pill>
        </View>
        <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/45">Fecha y hora</Text>
        <Text className="text-xl text-brand-ivory" style={{ fontFamily: 'serif' }}>{formatDate(reservation.reservation_date)}</Text>
        <Text className="mt-1 text-brand-ivory/65">{reservation.reservation_time.slice(0, 5)}</Text>

        <View className="my-5 h-px bg-white/10" />
        <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/45">Comensales</Text>
        <Text className="text-lg text-brand-ivory">{reservation.guest_count} personas</Text>

        <View className="my-5 h-px bg-white/10" />
        <Text className="mb-2 text-xs uppercase tracking-[3px] text-brand-ivory/45">Experiencia</Text>
        <Text className="text-lg text-brand-ivory">{reservation.experience_name || 'A la carta'}</Text>
        <Text className="mt-1 text-brand-ivory/65">{reservation.table_type_name || 'Sin preferencia'}</Text>
      </View>

      <View className="mt-6 gap-3">
        <Button title="Ver mis reservas" onPress={onGoAccount} />
        <Button title="Volver al inicio" variant="secondary" onPress={onGoHome} />
      </View>
    </DarkPanel>
  );
}

// Layout compartido para login, registro y recuperación.
function AuthShell({ image, children }) {
  return (
    <View className="relative min-h-screen overflow-hidden bg-[#141313]">
      <Image source={{ uri: image }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-38" />
      <View className="absolute inset-0 bg-[#0f0d0d]/40" />
      <View className="absolute inset-0 bg-gradient-to-b from-[#141313]/15 via-[#141313]/72 to-[#141313]" />
      <View className="absolute inset-0 bg-gradient-to-r from-[#141313]/88 via-[#141313]/45 to-transparent" />
      {children}
    </View>
  );
}

// Administra las pantallas de acceso sin salir del flujo principal.
function AuthPage({ onLogin, onRegister, onForgot, onReset, onOpenMenu }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [forgotForm, setForgotForm] = useState(emptyForgot);
  const [resetForm, setResetForm] = useState(emptyReset);

  if (mode === 'register') {
    return (
      <AuthShell image={registerBackground}>
        <View className="relative mx-auto w-full max-w-md px-6 py-10 md:px-10 md:py-12">
          <HamburgerButton onPress={onOpenMenu} className="mb-8" />
          <Pressable onPress={() => setMode('login')} className="mb-12 self-start">
            <Text className="text-2xl text-brand-ivory/80">←</Text>
          </Pressable>

          <View className="rounded-[30px] border border-white/10 bg-[#171514]/84 px-6 py-7">
            <Text className="text-[32px] italic leading-[40px] text-brand-ivory" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
            <Text className="mt-2 text-[16px] leading-7 text-brand-ivory/88">Regístrese para comenzar su experiencia.</Text>
            <Text className="mt-2 text-sm leading-6 text-brand-ivory/58">Una cuenta le permite reservar, editar visitas y seguir cada detalle de su mesa.</Text>

            <View className="mt-10">
              <LineField label="Nombre Completo" value={registerForm.name} onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, name: value }))} placeholder="Ej. María Valdés" />
              <LineField label="Correo Electrónico" value={registerForm.email} onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, email: value }))} placeholder="correo@ejemplo.com" />
              <LineField label="Teléfono" value={registerForm.phone} onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, phone: value }))} placeholder="+34 600 000 000" />
              <LineField label="Contraseña" value={registerForm.password} onChangeText={(value) => setRegisterForm((prev) => ({ ...prev, password: value }))} placeholder="••••••••" secureTextEntry />
            </View>

            <Pressable onPress={() => onRegister(registerForm, () => setRegisterForm(emptyRegister))} className="mt-8 rounded-full bg-brand-copper px-6 py-4">
              <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Crear Cuenta</Text>
            </Pressable>

            <View className="mt-10 items-center">
              <Text className="text-center text-[16px] leading-7 text-brand-ivory/65">
                ¿Ya tiene una reserva o cuenta?{' '}
                <Text onPress={() => setMode('login')} className="border-b border-brand-copper/30 text-brand-copper">Iniciar sesión</Text>
              </Text>
            </View>
          </View>
        </View>
      </AuthShell>
    );
  }

  if (mode === 'reset') {
    return (
      <AuthShell image={authBackground}>
        <View className="relative mx-auto w-full max-w-md px-6 py-10 md:px-10 md:py-12">
          <HamburgerButton onPress={onOpenMenu} className="mb-8" />
          <Pressable onPress={() => setMode('login')} className="mb-12 self-start">
            <Text className="text-2xl text-brand-ivory/80">←</Text>
          </Pressable>

          <View className="rounded-[30px] border border-white/10 bg-[#171514]/84 px-6 py-7">
            <Text className="text-[40px] italic leading-[48px] text-brand-ivory" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
            <Text className="mt-3 text-[22px] italic leading-8 text-brand-ivory/78" style={{ fontFamily: 'serif' }}>Restablezca su acceso.</Text>

            <View className="mt-12">
              <LineField label="Correo Electrónico" value={forgotForm.email} onChangeText={(value) => setForgotForm({ email: value })} placeholder="su@correo.com" />
              <Pressable onPress={() => onForgot(forgotForm)} className="mt-8 rounded-full bg-brand-copper px-6 py-4">
                <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Generar token</Text>
              </Pressable>

              <View className="mt-10">
                <LineField label="Token" value={resetForm.token} onChangeText={(value) => setResetForm((prev) => ({ ...prev, token: value }))} placeholder="Pega el token" />
                <LineField label="Nueva Contraseña" value={resetForm.newPassword} onChangeText={(value) => setResetForm((prev) => ({ ...prev, newPassword: value }))} placeholder="••••••••" secureTextEntry />
                <Pressable onPress={() => onReset(resetForm, () => setResetForm(emptyReset))} className="mt-6 rounded-full border border-white/15 bg-white/5 px-6 py-4">
                  <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Cambiar contraseña</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell image={authBackground}>
      <View className="relative mx-auto flex-1 w-full max-w-md justify-between px-6 py-10 md:px-10 md:py-12">
        <View className="pt-6">
          <HamburgerButton onPress={onOpenMenu} className="mb-10" />
        </View>

        <View className="rounded-[30px] border border-white/10 bg-[#171514]/84 px-6 py-7">
          <Text className="text-[40px] italic leading-[48px] text-brand-ivory" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
          <Text className="mt-3 text-[22px] italic leading-8 text-brand-ivory/88" style={{ fontFamily: 'serif' }}>Un santuario para los sentidos.</Text>
          <Text className="mt-2 text-sm leading-6 text-brand-ivory/58">Accede a tu cuenta para gestionar reservas, editar visitas y continuar tu experiencia gastronómica.</Text>

          <View className="mt-10">
            <LineField label="Correo Electrónico" value={loginForm.email} onChangeText={(value) => setLoginForm((prev) => ({ ...prev, email: value }))} placeholder="su@correo.com" />
            <LineField label="Contraseña" value={loginForm.password} onChangeText={(value) => setLoginForm((prev) => ({ ...prev, password: value }))} placeholder="••••••••" secureTextEntry />

            <View className="mb-10 mt-2 items-end">
              <Pressable onPress={() => setMode('reset')}>
                <Text className="text-xs uppercase tracking-[3px] text-brand-ivory/55">Olvidé mi contraseña</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => onLogin(loginForm, () => setLoginForm(emptyLogin))} className="rounded-full bg-brand-copper px-6 py-4">
              <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Iniciar Sesión</Text>
            </Pressable>

            <Pressable onPress={() => setMode('register')} className="mt-4 rounded-full border border-white/15 bg-white/5 px-6 py-4">
              <Text className="text-center text-sm uppercase tracking-[3px] text-brand-ivory">Registrarse</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AuthShell>
  );
}

// Tarjeta resumen de reserva con acciones del usuario.
function ReservationCard({ reservation, onCancel, onEdit }) {
  const status = normalizeStatus(reservation.status);
  const canEdit = reservation.status === 'confirmed';
  const canCancel = reservation.status === 'confirmed' || reservation.status === 'pending';

  return (
    <DarkPanel className="px-5 py-5">
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View style={{ flex: 1 }}>
          <Text className="text-2xl text-brand-ivory" style={{ fontFamily: 'serif' }}>{formatDate(reservation.reservation_date)}</Text>
          <Text className="mt-1 text-brand-ivory/60">{reservation.reservation_time.slice(0, 5)}</Text>
        </View>
        <Pill tone={status.tone}>{status.label}</Pill>
      </View>

      <Text className="text-brand-ivory/70">Comensales: {reservation.guest_count}</Text>
      <Text className="mt-1 text-brand-ivory/70">Mesa: {reservation.table_type_name || 'Sin preferencia'}</Text>
      <Text className="mt-1 text-brand-ivory/70">Experiencia: {reservation.experience_name || 'A la carta'}</Text>
      {reservation.special_occasion ? <Text className="mt-1 text-brand-ivory/70">Motivo: {reservation.special_occasion}</Text> : null}
      {reservation.guest_notes ? <Text className="mt-3 text-brand-ivory/55">Notas: {reservation.guest_notes}</Text> : null}

      {(canEdit || canCancel) ? (
        <View className="mt-5 gap-3 md:flex-row">
          {canEdit ? <Button title="Editar" variant="secondary" onPress={() => onEdit(reservation)} /> : null}
          {canCancel ? <Button title="Cancelar reserva" variant="danger" onPress={() => onCancel(reservation.id)} /> : null}
        </View>
      ) : null}
    </DarkPanel>
  );
}

// Cuenta del usuario: perfil, reservas y acceso a edición/cancelación.
function AccountPage({ auth, reservations, onLogin, onRegister, onForgot, onReset, onOpenMenu, onUpdateProfile, onCancelReservation, onEditReservation, onLogout, setPage }) {
  const [profileForm, setProfileForm] = useState({ name: auth?.user?.name || '', phone: auth?.user?.phone || '' });

  useEffect(() => {
    setProfileForm({ name: auth?.user?.name || '', phone: auth?.user?.phone || '' });
  }, [auth?.user?.name, auth?.user?.phone]);

  if (!auth) {
    return <AuthPage onLogin={onLogin} onRegister={onRegister} onForgot={onForgot} onReset={onReset} onOpenMenu={onOpenMenu} />;
  }

  return (
    <>
      <DarkPanel className="mb-6 overflow-hidden">
        <View className="relative overflow-hidden px-5 py-6 md:px-8 md:py-8">
          <Image source={{ uri: accountBackground }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-16" />
          <View className="absolute inset-0 bg-[#171514]/90" />
          <View className="relative mb-6 flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <View>
              <Text className="text-4xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Mi cuenta</Text>
              <Text className="mt-2 text-brand-ivory/60">Edita tus datos básicos y gestiona tus visitas.</Text>
            </View>
            <View className="w-full md:w-[220px]">
              <Button title="Cerrar sesión" variant="secondary" onPress={onLogout} />
            </View>
          </View>
          <View>
            <LineField label="Nombre" value={profileForm.name} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, name: value }))} placeholder="Tu nombre" />
            <LineField label="Teléfono" value={profileForm.phone} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))} placeholder="3001234567" />
            <View className="gap-3 md:flex-row">
              <Button title="Guardar perfil" onPress={() => onUpdateProfile(profileForm)} />
              <Button title="Nueva reserva" variant="secondary" onPress={() => setPage('reserve')} />
            </View>
          </View>
        </View>
      </DarkPanel>

      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-3xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Mis reservas</Text>
          <Text className="mt-2 text-brand-ivory/55">Puedes editar reservas confirmadas y cancelar las que siguen activas.</Text>
        </View>
      </View>

      <View className="gap-4">
        {reservations.length === 0 ? (
          <DarkPanel className="px-5 py-8">
            <Text className="text-center text-brand-ivory/60">Aún no tienes reservas registradas.</Text>
          </DarkPanel>
        ) : (
          reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} onCancel={onCancelReservation} onEdit={onEditReservation} />
          ))
        )}
      </View>
    </>
  );
}

// Información de contacto y mapa embebido del restaurante.
function ContactPage({ contact }) {
  return (
    <DarkPanel className="overflow-hidden">
      <View className="relative overflow-hidden px-5 py-6 md:px-8 md:py-8">
        <Image source={{ uri: contactBackground }} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-16" />
        <View className="absolute inset-0 bg-[#171514]/90" />
        <View className="relative">
          <Text className="text-4xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Contacto</Text>
          <Text className="mt-3 max-w-2xl text-sm leading-7 text-brand-ivory/58">Reserve una conversación, una visita o una próxima noche memorable. Estamos atentos a cada detalle.</Text>
          <Text className="mt-6 text-brand-ivory/70">Dirección: {contact?.address}</Text>
          <Text className="mt-2 text-brand-ivory/70">Horario: {contact?.hours}</Text>
          <Text className="mt-2 text-brand-ivory/70">Teléfono: {contact?.phone}</Text>
          <Text className="mt-2 text-brand-ivory/70">Email: {contact?.email}</Text>
          <View className="mt-6 max-w-xs">
            <Button title="Abrir Google Maps" onPress={() => Linking.openURL('https://maps.google.com/?q=4.7110,-74.0721')} />
          </View>
        </View>
      </View>
    </DarkPanel>
  );
}

// Panel administrativo básico para gestionar menú y estados de reservas.
function AdminPage({ token, menu, reservations, onRefresh, showNotice, onReservationStatusChange }) {
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [experienceForm, setExperienceForm] = useState(emptyExperience);
  const [itemForm, setItemForm] = useState(emptyItem);

  async function handle(action, successMessage, reset) {
    try {
      await action();
      showNotice('success', successMessage);
      await onRefresh();
      if (reset) reset();
    } catch (error) {
      showNotice('error', error.message);
    }
  }

  return (
    <>
      <Section title="Admin · Menú" subtitle="CRUD básico del menú y experiencias.">
        <Input label="Nueva categoría" value={categoryForm.name} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" />
        <Input label="Descripción" value={categoryForm.description} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, description: value }))} placeholder="Descripción" />
        <Input label="Orden" value={categoryForm.sortOrder} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, sortOrder: value }))} placeholder="0" />
        <Button title="Crear categoría" onPress={() => handle(() => api.createCategory(token, { ...categoryForm, sortOrder: Number(categoryForm.sortOrder || 0) }), 'Categoría creada', () => setCategoryForm(emptyCategory))} />

        <View className="mt-6 gap-3">
          {menu.categories.map((category) => (
            <View key={category.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-lg font-semibold text-brand-charcoal">{category.name}</Text>
              <Text className="text-brand-charcoal/75">{category.description}</Text>
              <View className="mt-3 max-w-xs">
                <Button title="Eliminar categoría" variant="danger" onPress={() => handle(() => api.deleteCategory(token, category.id), 'Categoría eliminada')} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Admin · Experiencias" subtitle="Gestiona recorridos y maridajes reservables.">
        <Input label="Nombre" value={experienceForm.name} onChangeText={(value) => setExperienceForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" />
        <Input label="Descripción" value={experienceForm.description} onChangeText={(value) => setExperienceForm((prev) => ({ ...prev, description: value }))} placeholder="Descripción" />
        <Input label="Precio" value={experienceForm.price} onChangeText={(value) => setExperienceForm((prev) => ({ ...prev, price: value }))} placeholder="120" />
        <Button title="Crear experiencia" onPress={() => handle(() => api.createExperience(token, { ...experienceForm, price: Number(experienceForm.price || 0), isActive: true }), 'Experiencia creada', () => setExperienceForm(emptyExperience))} />
      </Section>

      <Section title="Admin · Platos" subtitle="Crea platos usando el ID de categoría o experiencia.">
        <Input label="ID categoría" value={itemForm.categoryId} onChangeText={(value) => setItemForm((prev) => ({ ...prev, categoryId: value }))} placeholder="UUID categoría" />
        <Input label="ID experiencia" value={itemForm.experienceId} onChangeText={(value) => setItemForm((prev) => ({ ...prev, experienceId: value }))} placeholder="UUID experiencia (opcional)" />
        <Input label="Nombre" value={itemForm.name} onChangeText={(value) => setItemForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" />
        <Input label="Descripción" value={itemForm.description} onChangeText={(value) => setItemForm((prev) => ({ ...prev, description: value }))} placeholder="Descripción" />
        <Input label="Precio" value={itemForm.price} onChangeText={(value) => setItemForm((prev) => ({ ...prev, price: value }))} placeholder="18" />
        <Input label="Imagen URL" value={itemForm.imageUrl} onChangeText={(value) => setItemForm((prev) => ({ ...prev, imageUrl: value }))} placeholder="https://..." />
        <Button title="Crear plato" onPress={() => handle(() => api.createItem(token, { ...itemForm, price: Number(itemForm.price || 0), isAvailable: true }), 'Plato creado', () => setItemForm(emptyItem))} />
      </Section>

      <Section title="Admin · Reservas" subtitle="Desde aquí puedes confirmar, finalizar o cancelar reservas.">
        <View className="gap-3">
          {reservations.map((reservation) => (
            <View key={reservation.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{reservation.user_name} · {formatDate(reservation.reservation_date)} {reservation.reservation_time.slice(0, 5)}</Text>
              <Text className="text-brand-charcoal/80">{reservation.user_email}</Text>
              <Text className="text-brand-charcoal/80">Comensales: {reservation.guest_count} · {reservation.table_type_name || 'Sin preferencia'}</Text>
              <Text className="text-brand-charcoal/80">Estado: {normalizeStatus(reservation.status).label}</Text>
              <View className="mt-4 gap-2 md:flex-row">
                <Button title="Confirmar" variant="secondary" onPress={() => onReservationStatusChange(reservation.id, 'confirmed')} />
                <Button title="Finalizar" variant="secondary" onPress={() => onReservationStatusChange(reservation.id, 'finalized')} />
                <Button title="Cancelar" variant="danger" onPress={() => onReservationStatusChange(reservation.id, 'cancelled')} />
              </View>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

// Pie de página con accesos rápidos y refuerzo de marca.
function Footer({ setPage, onReservePress }) {
  return (
    <View className="border-t border-white/5 bg-[#171514] px-5 py-12 md:px-12 md:py-16">
      <View className="mx-auto w-full max-w-[1380px] gap-8 md:flex-row md:items-center md:justify-between">
        <View>
          <Text className="text-2xl italic text-brand-ivory" style={{ fontFamily: 'serif' }}>AFuegoLento</Text>
          <Text className="mt-2 text-sm text-brand-ivory/45">El arte de la paciencia en cada plato.</Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-5 md:mt-0">
          <Pressable onPress={() => setPage('menu')}><Text className="text-xs uppercase tracking-[3px] text-brand-ivory/45">Menú</Text></Pressable>
          <Pressable onPress={onReservePress}><Text className="text-xs uppercase tracking-[3px] text-brand-ivory/45">Reservas</Text></Pressable>
          <Pressable onPress={() => setPage('contact')}><Text className="text-xs uppercase tracking-[3px] text-brand-ivory/45">Contacto</Text></Pressable>
          <Text className="text-xs uppercase tracking-[3px] text-brand-ivory/45">Instagram</Text>
        </View>
      </View>

      <View className="mx-auto mt-8 w-full max-w-[1380px] border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between">
        <Text className="text-sm text-brand-ivory/35">© 2026 Nicolás Palacio · AFuegoLento.</Text>
        <View className="mt-4 flex-row gap-4 md:mt-0">
          <Text className="text-xs uppercase tracking-[3px] text-brand-ivory/30">Privacidad</Text>
          <Text className="text-xs uppercase tracking-[3px] text-brand-ivory/30">Términos</Text>
        </View>
      </View>
    </View>
  );
}

// Componente raíz: decide qué página mostrar y conecta eventos con useAppData.
export function AppShell() {
  const app = useAppData();
  const [lastConfirmation, setLastConfirmation] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reservePromptOpen, setReservePromptOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  useEffect(() => {
    if (!app.notice) return;

    const timeoutId = setTimeout(() => {
      app.clearNotice();
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [app.notice]);

  useEffect(() => {
    if (app.page !== 'confirmation') {
      return;
    }

    const timeoutId = setTimeout(() => {
      setLastConfirmation(null);
      app.setPage('account');
    }, 4200);

    return () => clearTimeout(timeoutId);
  }, [app.page, app.setPage]);

  useEffect(() => {
    if (app.page !== 'confirmation' && app.page !== 'reserve') {
      setLastConfirmation(null);
    }
  }, [app.page]);

  // Ejecuta acciones de API con manejo uniforme de avisos y errores.
  async function withAction(action, successMessage) {
    app.clearNotice();
    try {
      const result = await action();
      if (successMessage) app.showNotice('success', successMessage);
      return result;
    } catch (error) {
      app.showNotice('error', error.message + (error.details ? ` · ${error.details.map((detail) => detail.message).join(', ')}` : ''));
      throw error;
    }
  }

  // Si no hay sesión, muestra el modal; si la hay, abre reservas.
  function handleReserveIntent() {
    if (!app.user) {
      setReservePromptOpen(true);
      return;
    }
    setEditingReservation(null);
    app.setPage('reserve');
  }

  // Reutiliza el formulario de reserva para modificar una existente.
  function handleEditReservation(reservation) {
    setEditingReservation(reservation);
    app.setPage('reserve');
  }

  // Autenticación: guarda tokens y carga datos privados.
  async function onLogin(form, reset) {
    const response = await withAction(() => api.login(form), 'Sesión iniciada');
    app.setAuthAndPersist(response.data);
    await app.reloadPrivate(response.data);
    setReservePromptOpen(false);
    reset();
  }

  async function onRegister(form, reset) {
    const response = await withAction(() => api.register(form), 'Cuenta creada y sesión iniciada');
    app.setAuthAndPersist(response.data);
    await app.reloadPrivate(response.data);
    setReservePromptOpen(false);
    reset();
  }

  async function onForgot(form) {
    const response = await withAction(() => api.forgotPassword(form), 'Token de recuperación generado');
    if (response?.data?.resetToken) {
      app.showNotice('success', `Token temporal: ${response.data.resetToken}`);
    }
  }

  async function onReset(form, reset) {
    await withAction(() => api.resetPassword(form), 'Contraseña actualizada');
    reset();
  }

  async function onUpdateProfile(form) {
    const response = await withAction(() => api.updateMe(app.token, form), 'Perfil actualizado');
    app.setAuthAndPersist({ ...app.auth, user: response.data });
  }

  // Reserva: envía datos normalizados y actualiza la confirmación.
  async function onCreateReservation(form) {
    const response = await withAction(() => api.createReservation(app.token, { ...form, guestCount: Number(form.guestCount) }), 'Reserva confirmada');
    setLastConfirmation(response.data);
    setEditingReservation(null);
    await app.reloadPrivate();
    app.setPage('confirmation');
  }

  async function onUpdateReservation(id, form) {
    const response = await withAction(() => api.updateReservation(app.token, id, { ...form, guestCount: Number(form.guestCount) }), 'Reserva actualizada');
    setLastConfirmation(response.data);
    setEditingReservation(null);
    await app.reloadPrivate();
    app.setPage('account');
  }

  async function onCancelReservation(id) {
    await withAction(() => api.cancelReservation(app.token, id), 'Reserva cancelada');
    await app.reloadPrivate();
  }

  // Administración: cambia estados y refresca las listas.
  async function onAdminReservationStatusChange(id, status) {
    await withAction(() => api.updateReservationStatus(app.token, id, { status }), `Reserva ${normalizeStatus(status).label.toLowerCase()}`);
    await app.reloadPrivate();
  }

  if (app.loading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-charcoal px-6">
        <StatusBar style="light" />
        <Text className="text-3xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Cargando AFuegoLento…</Text>
      </View>
    );
  }

  const isAuthScreen = app.page === 'account' && !app.auth;

  return (
    <View className="flex-1 bg-[#141313]">
      <StatusBar style="light" />
      <ReservePromptModal
        visible={reservePromptOpen}
        onClose={() => setReservePromptOpen(false)}
        onLogin={() => {
          setReservePromptOpen(false);
          app.setPage('account');
        }}
        onRegister={() => {
          setReservePromptOpen(false);
          app.setPage('account');
        }}
      />

      <ScrollView className="flex-1 bg-[#141313]" contentContainerStyle={{ flexGrow: 1 }}>
        <View
          className={`w-full flex-1 ${isAuthScreen ? '' : 'px-3 py-4 md:px-8 md:py-8'}`}
          style={isAuthScreen ? undefined : { maxWidth: 1380, alignSelf: 'center' }}
        >
          <Navigation
            page={app.page}
            setPage={app.setPage}
            isAdmin={app.isAdmin}
            onReservePress={handleReserveIntent}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            hideBar={isAuthScreen}
          />

          {app.notice ? <Notice tone={app.notice.tone}>{app.notice.message}</Notice> : null}

          {app.page === 'home' ? <HomePage data={app.content} setPage={app.setPage} onReservePress={handleReserveIntent} /> : null}
          {app.page === 'menu' ? <MenuPage groupedItems={app.groupedItems} experiences={app.menu.experiences} /> : null}
          {app.page === 'reserve' ? (
            <ReservePage
              user={app.user}
              tableTypes={app.tableTypes}
              experiences={app.menu.experiences}
              onRequireAuth={handleReserveIntent}
              onCreate={onCreateReservation}
              onUpdate={onUpdateReservation}
              confirmation={lastConfirmation}
              editingReservation={editingReservation}
              onCancelEdit={() => {
                setEditingReservation(null);
                app.setPage('account');
              }}
            />
          ) : null}
          {app.page === 'confirmation' ? <ReservationConfirmationPage reservation={lastConfirmation} onGoHome={() => app.setPage('home')} onGoAccount={() => app.setPage('account')} /> : null}
          {app.page === 'account' ? <AccountPage auth={app.auth} reservations={app.reservations} onLogin={onLogin} onRegister={onRegister} onForgot={onForgot} onReset={onReset} onOpenMenu={() => setDrawerOpen(true)} onUpdateProfile={onUpdateProfile} onCancelReservation={onCancelReservation} onEditReservation={handleEditReservation} onLogout={app.logout} setPage={app.setPage} /> : null}
          {app.page === 'contact' ? <ContactPage contact={app.content?.contact} /> : null}
          {app.page === 'admin' && app.isAdmin ? <AdminPage token={app.token} menu={app.adminMenu} reservations={app.adminReservations} onRefresh={() => app.reloadPrivate()} showNotice={app.showNotice} onReservationStatusChange={onAdminReservationStatusChange} /> : null}
        </View>
        {!isAuthScreen ? <Footer setPage={app.setPage} onReservePress={handleReserveIntent} /> : null}
      </ScrollView>
    </View>
  );
}
