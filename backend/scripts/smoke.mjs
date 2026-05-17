const API_URL = process.env.API_URL || 'http://localhost:4000/api';

// Helper mínimo para pruebas smoke contra la API ya levantada.
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${body.message || 'Request failed'}`);
  }

  return body;
}

function futureReservationDate(daysAhead = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
}

function pickReservationSlot() {
  const dayOffset = 7 + Math.floor(Math.random() * 20);
  const hourOptions = ['19:00', '20:00', '21:00', '22:00'];
  return {
    reservationDate: futureReservationDate(dayOffset),
    reservationTime: hourOptions[Math.floor(Math.random() * hourOptions.length)],
  };
}

async function main() {
  const uniqueEmail = `smoke.${Date.now()}@afuegolento.local`;
  const password = 'SmokePass123!';

  console.log(`Running smoke test against ${API_URL}`);

  const health = await request('/health');
  console.log('Health OK:', health.message);

  const content = await request('/content');
  console.log('Content OK:', content.data.brand.name);

  const menu = await request('/menu');
  console.log('Menu OK:', menu.data.categories.length, 'categories');

  const register = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke User',
      email: uniqueEmail,
      password,
      phone: '3000000000',
    }),
  });
  console.log('Register OK:', register.data.user.email);

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: uniqueEmail, password }),
  });
  console.log('Login OK:', login.data.user.email);

  const token = login.data.accessToken;
  const tableTypes = await request('/reservations/table-types');
  const preferredType = tableTypes.data[0] || null;

  const slot = pickReservationSlot();

  const reservation = await request('/reservations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reservationDate: slot.reservationDate,
      reservationTime: slot.reservationTime,
      guestCount: 2,
      tableTypeId: preferredType?.id || '',
      diningExperienceId: menu.data.experiences[0]?.id || '',
      allergies: '',
      dietaryRestrictions: '',
      specialOccasion: 'Smoke test',
      guestNotes: 'Reserva de prueba automática',
    }),
  });
  console.log('Reservation OK:', reservation.data.id);

  const mine = await request('/reservations/mine', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('My reservations OK:', mine.data.length);

  console.log('Smoke test completed successfully');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
