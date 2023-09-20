import Dexie, {Table} from 'dexie';
import {FieldProps} from '../pages/Events/fields';

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
  deleted: false;
}

interface RegistrationData {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

export interface Participant {
  id: number;
  indicoId: number;
  regformId: number;
  fullName: string;
  registrationDate: string;
  registrationData: RegistrationData[];
  state: 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';
  checkinSecret: string;
  checkedIn: boolean;
  checkedInDt: string;
  occupiedSlots: number;
  deleted: false;
  notes: string;
}

class IndicoCheckin extends Dexie {
  // Declare implicit table properties.
  // (just to inform Typescript. Instanciated by Dexie in stores() method)
  servers!: Table<Server>;
  events!: Table<Event>;
  regforms!: Table<Regform>;
  participants!: Table<Participant>;

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
