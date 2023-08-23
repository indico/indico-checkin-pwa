import {ParticipantTable, RegFormTable} from '../db/db';

// Interface for the data sent to the Registration Form Details Page
export interface RegFormData {
  event: {
    id: number;
    title: string;
    date: string | null;
    serverBaseUrl: string;
  };
  id: number;
  title: string;
  checkedInCount: number;
  registrationCount: number;
}

// Interface for the data retrieved from the IndexedDB for the Participant Page
export interface ParticipantPageData {
  event: {
    id: number;
    title: string;
    date: string | null;
    serverBaseUrl: string;
  };
  regForm: {
    label: string;
    id: number;
  };
  attendee: ParticipantTable;
}

export default class EventData {
  public title: string;
  public date: string | null;
  public serverBaseUrl: string;
  public registrationForms: RegFormTable[];

  constructor(title = '', date = null, serverBaseUrl = '', registrationForms = []) {
    this.title = title;
    this.date = date;
    this.serverBaseUrl = serverBaseUrl;
    this.registrationForms = registrationForms;
  }

  /**
   * Builds an object with the necessary data for an Event Registration Form
   * @param idx
   * @returns
   */
  getRegFormData = (idx: number): RegFormData | null => {
    if (idx < 0 || idx >= this.registrationForms.length) {
      return null;
    }

    const currRegForm = this.registrationForms[idx];

    return {
      event: {
        title: this.title,
        date: this.date,
        id: currRegForm.eventId,
        serverBaseUrl: this.serverBaseUrl,
      },
      id: currRegForm.id,
      title: currRegForm.title,
      checkedInCount: currRegForm.checkedInCount,
      registrationCount: currRegForm.registrationCount,
    };
  };

  /**
   * Indicates whether the EventData object is empty (Not valid)
   * @returns true if the EventData object is empty
   */
  isEmpty = (): boolean => this.title === '' || this.date === null || this.serverBaseUrl === '';
}
