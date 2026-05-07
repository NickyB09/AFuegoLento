import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button, Input, Notice, Pill, Section } from '../../components/UI';
import { api } from '../../services/api';
import { storage } from '../../services/storage';
import { formatCurrency, formatDate } from '../../utils/format';

const pages = [
  { key: 'home', label: 'Inicio' },
  { key: 'menu', label: 'Menú' },
  { key: 'reserve', label: 'Reservas' },
  { key: 'account', label: 'Mi cuenta' },
  { key: 'contact', label: 'Contacto' },
];

const emptyRegister = { name: '', email: '', password: '', phone: '' };
const emptyLogin = { email: '', password: '' };
const emptyForgot = { email: '' };
const emptyReset = { token: '', newPassword: '' };
const emptyProfile = { name: '', phone: '' };
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

  const value = {
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

  return value;
}

function Navigation({ page, setPage, isAdmin }) {
  const navItems = isAdmin ? [...pages, { key: 'admin', label: 'Admin' }] : pages;
  return (
    <View className="mb-8 flex-col gap-3 rounded-[26px] border border-brand-olive/20 bg-brand-charcoal/90 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <View>
        <Text className="text-xs uppercase text-brand-copper" style={{ letterSpacing: 4 }}>AFuegoLento</Text>
        <Text className="mt-2 text-2xl text-brand-ivory" style={{ fontFamily: 'serif' }}>Restaurante gourmet · MVP operativo</Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {navItems.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setPage(item.key)}
            className={`rounded-full px-4 py-2 ${page === item.key ? 'bg-brand-copper' : 'border border-brand-ivory/20'}`}
          >
            <Text className={`${page === item.key ? 'text-brand-ivory' : 'text-brand-ivory/80'} font-semibold`}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function HomePage({ data, setPage }) {
  return (
    <>
      <View className="mb-8 rounded-[32px] border border-brand-olive/30 bg-brand-charcoal px-6 py-10 md:px-10 md:py-14">
        <Text className="mb-3 text-xs uppercase text-brand-copper" style={{ letterSpacing: 4 }}>Experiencia Michelin contemporánea</Text>
        <Text className="mb-5 text-5xl leading-[56px] text-brand-ivory" style={{ fontFamily: 'serif', maxWidth: 820 }}>
          {data?.brand?.claim || 'Una experiencia editorial para reservas gastronómicas memorables.'}
        </Text>
        <Text className="mb-8 max-w-2xl text-base leading-7 text-brand-ivory/80">
          {data?.brand?.description}
        </Text>
        <View className="flex-col gap-4 md:flex-row md:max-w-xl">
          <Button title="Reservar ahora" onPress={() => setPage('reserve')} />
          <Button title="Explorar menú" variant="secondary" onPress={() => setPage('menu')} />
        </View>
      </View>

      <Section title="La experiencia" subtitle="Cocción lenta, narrativa estacional y una interfaz pensada para convertir visitas en reservas.">
        <View className="grid gap-4 md:grid-cols-3">
          {[
            ['Reservas fluidas', 'Fecha, hora, tipo de mesa, restricciones y confirmación inmediata.'],
            ['Menú editable', 'Categorías, platos y experiencias gastronómicas gestionables desde la base de datos.'],
            ['Cuenta personal', 'Login, registro, recuperación de contraseña y gestión de reservas.'],
          ].map(([title, body]) => (
            <View key={title} className="rounded-2xl border border-brand-olive/20 bg-white px-4 py-5">
              <Text className="mb-2 text-2xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{title}</Text>
              <Text className="leading-7 text-brand-charcoal/80">{body}</Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function MenuPage({ groupedItems, experiences }) {
  return (
    <>
      <Section title="Menú" subtitle="El menú está servido desde base de datos y listo para edición futura desde panel admin.">
        <View className="mb-6 gap-3">
          {experiences.map((experience) => (
            <View key={experience.id} className="rounded-2xl border border-brand-wine/15 bg-brand-wine/5 px-4 py-4">
              <Text className="text-2xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{experience.name}</Text>
              <Text className="mt-2 leading-7 text-brand-charcoal/80">{experience.description}</Text>
              <Text className="mt-3 font-semibold text-brand-wine">{formatCurrency(experience.price)}</Text>
            </View>
          ))}
        </View>

        <View className="gap-5">
          {groupedItems.map((category) => (
            <View key={category.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-5">
              <Text className="text-3xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{category.name}</Text>
              {category.description ? <Text className="mt-2 leading-7 text-brand-charcoal/70">{category.description}</Text> : null}
              <View className="mt-4 gap-3">
                {category.items.map((item) => (
                  <View key={item.id} className="border-t border-brand-olive/10 pt-3">
                    <View className="flex-row items-start justify-between gap-4">
                      <View style={{ flex: 1 }}>
                        <Text className="text-lg font-semibold text-brand-charcoal">{item.name}</Text>
                        <Text className="mt-1 leading-6 text-brand-charcoal/75">{item.description}</Text>
                      </View>
                      <Text className="font-semibold text-brand-wine">{formatCurrency(item.price)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function AuthSection({ state, setState, onSubmit, title, buttonLabel, secondary }) {
  return (
    <Section title={title} subtitle={secondary}>
      <Input label="Email" value={state.email} onChangeText={(value) => setState((prev) => ({ ...prev, email: value }))} placeholder="correo@ejemplo.com" />
      {'name' in state ? <Input label="Nombre" value={state.name} onChangeText={(value) => setState((prev) => ({ ...prev, name: value }))} placeholder="Tu nombre" /> : null}
      {'phone' in state ? <Input label="Teléfono" value={state.phone} onChangeText={(value) => setState((prev) => ({ ...prev, phone: value }))} placeholder="3001234567" /> : null}
      {'password' in state ? <Input label="Contraseña" value={state.password} onChangeText={(value) => setState((prev) => ({ ...prev, password: value }))} placeholder="Mínimo 8 caracteres" secureTextEntry /> : null}
      {'newPassword' in state ? <Input label="Nueva contraseña" value={state.newPassword} onChangeText={(value) => setState((prev) => ({ ...prev, newPassword: value }))} placeholder="Mínimo 8 caracteres" secureTextEntry /> : null}
      {'token' in state ? <Input label="Token de recuperación" value={state.token} onChangeText={(value) => setState((prev) => ({ ...prev, token: value }))} placeholder="Pega el token recibido" /> : null}
      <Button title={buttonLabel} onPress={onSubmit} />
    </Section>
  );
}

function ReservePage({ user, tableTypes, experiences, onRequireAuth, onCreate, confirmation }) {
  const [form, setForm] = useState(emptyReservation);

  return (
    <>
      {!user ? (
        <Notice tone="info">Debes iniciar sesión o registrarte para confirmar una reserva.</Notice>
      ) : null}
      {confirmation ? (
        <Notice tone="success">
          Reserva confirmada para {formatDate(confirmation.reservation_date)} a las {confirmation.reservation_time.slice(0, 5)}.
        </Notice>
      ) : null}
      <Section title="Reservar" subtitle="Elige fecha, mesa compatible, experiencia y detalles del comensal.">
        <Input label="Fecha" value={form.reservationDate} onChangeText={(value) => setForm((prev) => ({ ...prev, reservationDate: value }))} placeholder="2026-05-20" />
        <Input label="Hora" value={form.reservationTime} onChangeText={(value) => setForm((prev) => ({ ...prev, reservationTime: value }))} placeholder="19:30" />
        <Input label="Número de comensales" value={form.guestCount} onChangeText={(value) => setForm((prev) => ({ ...prev, guestCount: value }))} placeholder="2" />
        <Input label="ID de tipo de mesa" value={form.tableTypeId} onChangeText={(value) => setForm((prev) => ({ ...prev, tableTypeId: value }))} placeholder="Selecciona uno de los IDs listados abajo" />
        <Input label="ID de experiencia" value={form.diningExperienceId} onChangeText={(value) => setForm((prev) => ({ ...prev, diningExperienceId: value }))} placeholder="Opcional" />
        <Input label="Alergias" value={form.allergies} onChangeText={(value) => setForm((prev) => ({ ...prev, allergies: value }))} placeholder="Ej. mariscos" />
        <Input label="Restricciones alimentarias" value={form.dietaryRestrictions} onChangeText={(value) => setForm((prev) => ({ ...prev, dietaryRestrictions: value }))} placeholder="Ej. vegetariano" />
        <Input label="Ocasión especial" value={form.specialOccasion} onChangeText={(value) => setForm((prev) => ({ ...prev, specialOccasion: value }))} placeholder="Cumpleaños, aniversario..." />
        <Input label="Notas del comensal" value={form.guestNotes} onChangeText={(value) => setForm((prev) => ({ ...prev, guestNotes: value }))} placeholder="Detalles extra" multiline />
        <View className="mt-2 flex-col gap-3 md:flex-row">
          <Button title="Confirmar reserva" onPress={() => (user ? onCreate(form, () => setForm(emptyReservation)) : onRequireAuth())} />
          {!user ? <Button title="Ir a iniciar sesión" variant="secondary" onPress={onRequireAuth} /> : null}
        </View>
      </Section>

      <Section title="Tipos de mesa disponibles" subtitle="Para esta versión inicial usaremos tipo de mesa en vez de selección visual exacta.">
        <View className="gap-3">
          {tableTypes.map((type) => (
            <View key={type.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{type.name}</Text>
              <Text className="mt-2 text-brand-charcoal/80">{type.description}</Text>
              <Text className="mt-2 font-semibold text-brand-olive">Capacidad: {type.capacity_min}–{type.capacity_max} · ID: {type.id}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Experiencias" subtitle="Usa el ID si quieres asociar la reserva a una experiencia puntual.">
        <View className="gap-3">
          {experiences.map((experience) => (
            <View key={experience.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{experience.name}</Text>
              <Text className="mt-2 text-brand-charcoal/80">{experience.description}</Text>
              <Text className="mt-2 font-semibold text-brand-wine">{formatCurrency(experience.price)} · ID: {experience.id}</Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function AccountPage({ auth, reservations, onLogin, onRegister, onForgot, onReset, onUpdateProfile, onCancelReservation, onLogout, setPage, showNotice }) {
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [forgotForm, setForgotForm] = useState(emptyForgot);
  const [resetForm, setResetForm] = useState(emptyReset);
  const [profileForm, setProfileForm] = useState({ name: auth?.user?.name || '', phone: auth?.user?.phone || '' });

  useEffect(() => {
    setProfileForm({ name: auth?.user?.name || '', phone: auth?.user?.phone || '' });
  }, [auth?.user?.name, auth?.user?.phone]);

  if (!auth) {
    return (
      <>
        <AuthSection state={loginForm} setState={setLoginForm} onSubmit={() => onLogin(loginForm, () => setLoginForm(emptyLogin))} title="Iniciar sesión" buttonLabel="Entrar" secondary="Accede para reservar y gestionar tus visitas." />
        <AuthSection state={registerForm} setState={setRegisterForm} onSubmit={() => onRegister(registerForm, () => setRegisterForm(emptyRegister))} title="Crear cuenta" buttonLabel="Registrarme" secondary="Tu cuenta guarda reservas, preferencias y datos de contacto." />
        <AuthSection state={forgotForm} setState={setForgotForm} onSubmit={() => onForgot(forgotForm)} title="Olvidé mi contraseña" buttonLabel="Generar token" secondary="En esta versión, el backend devuelve un token temporal para desarrollo." />
        <AuthSection state={resetForm} setState={setResetForm} onSubmit={() => onReset(resetForm, () => setResetForm(emptyReset))} title="Restablecer contraseña" buttonLabel="Cambiar contraseña" secondary="Pega el token generado y define tu nueva contraseña." />
      </>
    );
  }

  return (
    <>
      <Section title="Mi cuenta" subtitle="Edita tus datos básicos y cierra sesión cuando lo necesites." right={<Button title="Cerrar sesión" variant="secondary" onPress={onLogout} />}>
        <Input label="Nombre" value={profileForm.name} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, name: value }))} placeholder="Tu nombre" />
        <Input label="Teléfono" value={profileForm.phone} onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))} placeholder="3001234567" />
        <View className="flex-col gap-3 md:flex-row">
          <Button title="Guardar perfil" onPress={() => onUpdateProfile(profileForm)} />
          <Button title="Nueva reserva" variant="secondary" onPress={() => setPage('reserve')} />
        </View>
      </Section>

      <Section title="Mis reservas" subtitle="Consulta el estado, los detalles y cancela si es necesario.">
        <View className="gap-4">
          {reservations.length === 0 ? (
            <Text className="text-brand-charcoal/75">Aún no tienes reservas.</Text>
          ) : (
            reservations.map((reservation) => (
              <View key={reservation.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
                <View className="mb-3 flex-row items-center justify-between gap-3">
                  <Text className="text-xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{formatDate(reservation.reservation_date)} · {reservation.reservation_time.slice(0, 5)}</Text>
                  <Pill tone={reservation.status === 'confirmed' ? 'success' : 'danger'}>{reservation.status}</Pill>
                </View>
                <Text className="text-brand-charcoal/80">Comensales: {reservation.guest_count}</Text>
                <Text className="text-brand-charcoal/80">Mesa: {reservation.table_type_name || 'Sin preferencia'}</Text>
                <Text className="text-brand-charcoal/80">Experiencia: {reservation.experience_name || 'A la carta'}</Text>
                {reservation.special_occasion ? <Text className="text-brand-charcoal/80">Ocasión: {reservation.special_occasion}</Text> : null}
                {reservation.guest_notes ? <Text className="mt-2 text-brand-charcoal/75">Notas: {reservation.guest_notes}</Text> : null}
                {reservation.status !== 'cancelled' ? (
                  <View className="mt-4 max-w-xs">
                    <Button title="Cancelar reserva" variant="danger" onPress={() => onCancelReservation(reservation.id)} />
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </Section>
    </>
  );
}

function ContactPage({ contact }) {
  return (
    <Section title="Contacto y ubicación" subtitle="Información ficticia para la primera versión del sitio.">
      <Text className="mb-2 text-brand-charcoal"><Text className="font-semibold">Dirección:</Text> {contact?.address}</Text>
      <Text className="mb-2 text-brand-charcoal"><Text className="font-semibold">Horario:</Text> {contact?.hours}</Text>
      <Text className="mb-2 text-brand-charcoal"><Text className="font-semibold">Teléfono:</Text> {contact?.phone}</Text>
      <Text className="mb-6 text-brand-charcoal"><Text className="font-semibold">Email:</Text> {contact?.email}</Text>
      <View className="max-w-xs">
        <Button title="Abrir ubicación en Google Maps" onPress={() => Linking.openURL('https://maps.google.com/?q=4.7110,-74.0721')} />
      </View>
    </Section>
  );
}

function AdminPage({ token, menu, reservations, onRefresh, showNotice }) {
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
      <Section title="Admin · Menú" subtitle="CRUD básico del menú y experiencias para dejar el MVP operativo.">
        <Input label="Nueva categoría" value={categoryForm.name} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" />
        <Input label="Descripción" value={categoryForm.description} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, description: value }))} placeholder="Descripción" />
        <Input label="Orden" value={categoryForm.sortOrder} onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, sortOrder: value }))} placeholder="0" />
        <Button title="Crear categoría" onPress={() => handle(() => api.createCategory(token, { ...categoryForm, sortOrder: Number(categoryForm.sortOrder || 0) }), 'Categoría creada', () => setCategoryForm(emptyCategory))} />

        <View className="mt-6 gap-3">
          {menu.categories.map((category) => (
            <View key={category.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-lg font-semibold text-brand-charcoal">{category.name}</Text>
              <Text className="text-brand-charcoal/75">{category.description}</Text>
              <Text className="mt-2 text-xs text-brand-olive">ID: {category.id}</Text>
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

        <View className="mt-6 gap-3">
          {menu.experiences.map((experience) => (
            <View key={experience.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-lg font-semibold text-brand-charcoal">{experience.name}</Text>
              <Text className="text-brand-charcoal/75">{experience.description}</Text>
              <Text className="mt-2 font-semibold text-brand-wine">{formatCurrency(experience.price)}</Text>
              <Text className="mt-2 text-xs text-brand-olive">ID: {experience.id}</Text>
              <View className="mt-3 max-w-xs">
                <Button title="Eliminar experiencia" variant="danger" onPress={() => handle(() => api.deleteExperience(token, experience.id), 'Experiencia eliminada')} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Admin · Platos" subtitle="Crea platos usando el ID de categoría o experiencia.">
        <Input label="ID categoría" value={itemForm.categoryId} onChangeText={(value) => setItemForm((prev) => ({ ...prev, categoryId: value }))} placeholder="UUID categoría" />
        <Input label="ID experiencia" value={itemForm.experienceId} onChangeText={(value) => setItemForm((prev) => ({ ...prev, experienceId: value }))} placeholder="UUID experiencia (opcional)" />
        <Input label="Nombre" value={itemForm.name} onChangeText={(value) => setItemForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" />
        <Input label="Descripción" value={itemForm.description} onChangeText={(value) => setItemForm((prev) => ({ ...prev, description: value }))} placeholder="Descripción" />
        <Input label="Precio" value={itemForm.price} onChangeText={(value) => setItemForm((prev) => ({ ...prev, price: value }))} placeholder="18" />
        <Input label="Imagen URL" value={itemForm.imageUrl} onChangeText={(value) => setItemForm((prev) => ({ ...prev, imageUrl: value }))} placeholder="https://..." />
        <Button title="Crear plato" onPress={() => handle(() => api.createItem(token, { ...itemForm, price: Number(itemForm.price || 0), isAvailable: true }), 'Plato creado', () => setItemForm(emptyItem))} />

        <View className="mt-6 gap-3">
          {menu.items.map((item) => (
            <View key={item.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-lg font-semibold text-brand-charcoal">{item.name}</Text>
              <Text className="text-brand-charcoal/75">{item.description}</Text>
              <Text className="mt-2 font-semibold text-brand-wine">{formatCurrency(item.price)}</Text>
              <Text className="mt-1 text-xs text-brand-olive">Categoría: {item.category_name || 'N/A'} · ID: {item.id}</Text>
              <View className="mt-3 max-w-xs">
                <Button title="Eliminar plato" variant="danger" onPress={() => handle(() => api.deleteItem(token, item.id), 'Plato eliminado')} />
              </View>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Admin · Reservas" subtitle="Vista simple de todas las reservas registradas.">
        <View className="gap-3">
          {reservations.map((reservation) => (
            <View key={reservation.id} className="rounded-2xl border border-brand-olive/15 bg-white px-4 py-4">
              <Text className="text-xl text-brand-charcoal" style={{ fontFamily: 'serif' }}>{reservation.user_name} · {formatDate(reservation.reservation_date)} {reservation.reservation_time.slice(0,5)}</Text>
              <Text className="text-brand-charcoal/80">{reservation.user_email}</Text>
              <Text className="text-brand-charcoal/80">Comensales: {reservation.guest_count} · {reservation.table_type_name || 'Sin preferencia'}</Text>
              <Text className="text-brand-charcoal/80">Estado: {reservation.status}</Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

export function AppShell() {
  const app = useAppData();
  const [lastConfirmation, setLastConfirmation] = useState(null);

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

  async function onLogin(form, reset) {
    const response = await withAction(() => api.login(form), 'Sesión iniciada');
    app.setAuthAndPersist(response.data);
    await app.reloadPrivate(response.data);
    reset();
  }

  async function onRegister(form, reset) {
    const response = await withAction(() => api.register(form), 'Cuenta creada y sesión iniciada');
    app.setAuthAndPersist(response.data);
    await app.reloadPrivate(response.data);
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

  async function onCreateReservation(form, reset) {
    const response = await withAction(() => api.createReservation(app.token, { ...form, guestCount: Number(form.guestCount) }), 'Reserva confirmada');
    setLastConfirmation(response.data);
    await app.reloadPrivate();
    reset();
    app.setPage('account');
  }

  async function onCancelReservation(id) {
    await withAction(() => api.cancelReservation(app.token, id), 'Reserva cancelada');
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

  return (
    <ScrollView className="flex-1 bg-brand-charcoal" contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar style="light" />
      <View className="w-full flex-1 px-4 py-6 md:px-8 md:py-8" style={{ maxWidth: 1220, alignSelf: 'center' }}>
        <Navigation page={app.page} setPage={app.setPage} isAdmin={app.isAdmin} />

        {app.notice ? <Notice tone={app.notice.tone}>{app.notice.message}</Notice> : null}

        {app.page === 'home' ? <HomePage data={app.content} setPage={app.setPage} /> : null}
        {app.page === 'menu' ? <MenuPage groupedItems={app.groupedItems} experiences={app.menu.experiences} /> : null}
        {app.page === 'reserve' ? <ReservePage user={app.user} tableTypes={app.tableTypes} experiences={app.menu.experiences} onRequireAuth={() => app.setPage('account')} onCreate={onCreateReservation} confirmation={lastConfirmation} /> : null}
        {app.page === 'account' ? <AccountPage auth={app.auth} reservations={app.reservations} onLogin={onLogin} onRegister={onRegister} onForgot={onForgot} onReset={onReset} onUpdateProfile={onUpdateProfile} onCancelReservation={onCancelReservation} onLogout={app.logout} setPage={app.setPage} showNotice={app.showNotice} /> : null}
        {app.page === 'contact' ? <ContactPage contact={app.content?.contact} /> : null}
        {app.page === 'admin' && app.isAdmin ? <AdminPage token={app.token} menu={app.adminMenu} reservations={app.adminReservations} onRefresh={() => app.reloadPrivate()} showNotice={app.showNotice} /> : null}
      </View>
    </ScrollView>
  );
}
