export default class EventData {
  public title: string;
  public date: string | null;
  public registrationForms: Object[];

  constructor(title = '', date = null, registrationForms = []) {
    this.title = title;
    this.date = date;
    this.registrationForms = registrationForms;
  }
}
