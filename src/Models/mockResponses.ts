export const mockEventDetailsResponse: {
  description: string;
  end_dt: string;
  event_id: number;
  start_dt: string;
  title: string;
} = {
  description: '',
  end_dt: '2023-07-06T15:00:00+00:00',
  event_id: 83,
  start_dt: '2023-07-06T13:00:00+00:00',
  title: 'Check-in app testing',
};

export const mockRegFormDetailsResponse: {
  end_dt: string | null;
  introduction: string;
  regform_id: number;
  start_dt: string | null;
  title: string;
} = {
  end_dt: null,
  introduction: '',
  regform_id: 85,
  start_dt: null,
  title: 'Participants',
};

export const mockParticipantsResponse: Array<{
  checked_in: boolean;
  checkin_secret: string;
  full_name: string;
  registration_id: number;
  state: string;
  tags: Array<string>;
}> = [
  {
    checked_in: false,
    checkin_secret: '4135c6a6-abac-424c-8175-8959a4608a42',
    full_name: 'Joao Mesquita',
    registration_id: 307,
    state: 'complete',
    tags: [],
  },
  {
    checked_in: false,
    checkin_secret: '60b68ef6-0e38-4388-8d8d-b2ed3adc73ab',
    full_name: 'Renuka Rajput-Ghoshal',
    registration_id: 308,
    state: 'complete',
    tags: [],
  },
];
