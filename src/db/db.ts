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
  eventId: number;
  fullName: string;
  registrationDate: string;
  registrationData: RegistrationData[];
  state: 'complete' | 'pending' | 'rejected' | 'withdrawn' | 'unpaid';
  checkedIn: boolean;
  checkedInDt: string;
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
    super('myDatabase');
    this.version(2).stores({
      servers: 'id++, baseUrl, clientId',
      events: 'id++, indicoId, serverId, baseUrl, title',
      regforms: 'id++, indicoId, eventId, title',
      participants: 'id++, indicoId, regformId, eventId, name, state, checkedIn',
    });
  }
}

const db = new IndicoCheckin();

export default db;
