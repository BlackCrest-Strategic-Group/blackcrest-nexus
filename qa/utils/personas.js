import fs from 'node:fs';
import path from 'node:path';

const PERSONA_NAMES = ['Demo Dan', 'Buyer Becky', 'Admin Allen', 'Chaos Carl', 'Mobile Mike'];

export function loadPersonas() {
  const fixturePath = path.resolve('qa/fixtures/personas.json');
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  return PERSONA_NAMES.reduce((acc, name) => {
    const key = name.toUpperCase().replace(/\s+/g, '_');
    const defaultPersona = fixture[name] || {};
    acc[name] = {
      name,
      email: process.env[`SENTINEL_${key}_EMAIL`] || defaultPersona.email,
      password: process.env[`SENTINEL_${key}_PASSWORD`] || defaultPersona.password
    };
    return acc;
  }, {});
}

export async function ensurePersonaAccount(request, baseURL, persona) {
  const payload = {
    name: persona.name,
    email: persona.email,
    password: persona.password,
    company: 'BlackCrest Demo',
    role: 'demo-user',
    procurementFocus: 'general',
    marketType: 'mixed',
    categoriesOfInterest: []
  };

  const response = await request.post(`${baseURL}/api/auth/register`, { data: payload });
  if (response.status() === 201 || response.status() === 409) {
    return;
  }

  const body = await response.text();
  throw new Error(`Failed to provision persona ${persona.name}: ${response.status()} ${body}`);
}
