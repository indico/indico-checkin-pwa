import Dexie, {type EntityTable} from 'dexie';
import {FieldProps} from '../pages/participant/fields';
import {IndicoParticipant} from '../utils/client';

export interface Server {
  id: number;
  baseUrl: string;
  clientId: string;
  scope: string;
  authToken: string;
}

export interface Event {
  id: number;
  indicoId: number;
  serverId: number;
  baseUrl: string;
  title: string;
  date: string;
  deleted: boolean;
}
export interface Regform {
  id: number;
  indicoId: number;
  eventId: number;
  title: string;
  isOpen: boolean;
  registrationCount: number;
  checkedInCount: number;
  deleted: boolean;
}

export interface RegistrationData {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

export type RegistrationState = 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';

export interface Participant {
  id: number;
  indicoId: number;
  regformId: number;
  fullName: string;
  registrationDate: string;
  registrationData: RegistrationData[];
  state: RegistrationState;
  checkinSecret: string;
  checkedIn: boolean;
  checkedInDt?: string;
  occupiedSlots: number;
  price: number;
  currency: string;
  formattedPrice: string;
  isPaid: boolean;
  deleted: boolean;
  notes: string;
}

class IndicoCheckin extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  servers!: EntityTable<Server, 'id'>;
  events!: EntityTable<Event, 'id'>;
  regforms!: EntityTable<Regform, 'id'>;
  participants!: EntityTable<Participant, 'id'>;

  constructor() {
    super('CheckinDatabase');
    this.version(1).stores({
      servers: 'id++, baseUrl, clientId',
      events: 'id++, indicoId, serverId, baseUrl, title',
      regforms: 'id++, indicoId, eventId, title',
      participants: 'id++, indicoId, regformId, fullName, state, checkedIn',
    });
  }
}

const db = new IndicoCheckin();

export default db;

export async function deleteEvent(id: number) {
  const regforms = await db.regforms.where({eventId: id}).toArray();
  for (const regform of regforms) {
    await deleteRegform(regform.id);
  }
  await db.events.delete(id);
}

export async function deleteRegform(id: number) {
  await db.participants.where({regformId: id}).delete();
  await db.regforms.delete(id);
}

export async function updateParticipant(id: number, data: IndicoParticipant) {
  const {
    id: indicoId,
    fullName,
    registrationDate,
    registrationData,
    state,
    checkedIn,
    checkedInDt,
    occupiedSlots,
    price,
    currency,
    formattedPrice,
    isPaid,
  } = data;
  await db.participants.update(id, {
    indicoId,
    fullName,
    registrationDate,
    registrationData,
    state,
    occupiedSlots,
    checkedIn,
    checkedInDt,
    price,
    currency,
    formattedPrice,
    isPaid,
  });
}
