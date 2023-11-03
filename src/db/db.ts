import Dexie, {type EntityTable} from 'dexie';
import {FieldProps} from '../pages/participant/fields';
import {IndicoParticipant} from '../utils/client';

export type IDBBoolean = 1 | 0; // IndexedDB doesn support indexing boolean, so we use 1/0 instead

interface _Server {
  baseUrl: string;
  clientId: string;
  scope: string;
  authToken: string;
}
export interface Server extends _Server {
  id: number;
}

type AddServer = _Server;

export interface _Event {
  indicoId: number;
  serverId: number;
  baseUrl: string;
  title: string;
  date: string;
}

export interface Event extends _Event {
  id: number;
  deleted: IDBBoolean;
}

interface AddEvent extends _Event {
  deleted?: boolean;
}

export interface _Regform {
  indicoId: number;
  eventId: number;
  title: string;
}

export interface Regform extends _Regform {
  id: number;
  isOpen: boolean;
  registrationCount: number;
  checkedInCount: number;
  deleted: IDBBoolean;
}

interface AddRegform extends _Regform {
  isOpen?: boolean;
  registrationCount?: number;
  checkedInCount?: number;
  deleted?: boolean;
}

export interface RegistrationData {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

export type RegistrationState = 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';

interface _Participant {
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
}

export interface Participant extends _Participant {
  id: number;
  deleted: IDBBoolean;
  notes: string;
}

interface AddParticipant extends _Participant {
  deleted?: IDBBoolean;
  notes?: string;
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
      events: 'id++, indicoId, serverId, deleted',
      regforms: 'id++, indicoId, eventId, deleted',
      participants: 'id++, indicoId, regformId, deleted',
    });
  }
}

const db = new IndicoCheckin();

export default db;

export async function addServer(data: AddServer) {
  return await db.servers.add(data);
}

export async function addEvent(data: AddEvent) {
  const deleted = data.deleted ? 1 : 0;
  return await db.events.add({...data, deleted});
}

export async function addRegform(data: AddRegform) {
  const isOpen = !!data.isOpen;
  const registrationCount = data.registrationCount || 0;
  const checkedInCount = data.checkedInCount || 0;
  const deleted = data.deleted ? 1 : 0;
  return await db.regforms.add({...data, isOpen, registrationCount, checkedInCount, deleted});
}

export async function addParticipant(data: AddParticipant) {
  const deleted = data.deleted ? 1 : 0;
  const notes = data.notes || '';
  return await db.participants.add({...data, deleted, notes});
}

export async function deleteEvent(id: number) {
  return db.transaction('readwrite', [db.events, db.regforms, db.participants], async () => {
    const regforms = await db.regforms.where({eventId: id}).toArray();
    for (const regform of regforms) {
      await db.participants.where({regformId: regform.id}).delete();
      await db.regforms.delete(regform.id);
    }
    await db.events.delete(id);
  });
}

export async function deleteRegform(id: number) {
  return db.transaction('readwrite', [db.regforms, db.participants], async () => {
    await db.participants.where({regformId: id}).delete();
    await db.regforms.delete(id);
  });
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
