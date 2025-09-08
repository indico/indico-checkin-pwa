import {Typography} from '../../Components/Tailwind';
import {formatDatetime} from '../../utils/date';

export interface FieldProps {
  id: number;
  title: string;
  description: string;
  inputType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: any;
  price?: number;
}

export interface Section {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

interface Choice {
  id: string; // uuid
  caption: string;
}

interface ChoiceFieldProps extends FieldProps {
  choices: Choice[];
}

interface Country {
  countryKey: string; // uuid
  caption: string;
}

interface CountryFieldProps extends FieldProps {
  choices: Country[];
}

export function Field(field: FieldProps) {
  switch (field.inputType) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
      return <TextField {...field} />;
    case 'bool':
      return <BooleanField {...field} />;
    case 'textarea':
      return <TextAreaField {...field} />;
    case 'date':
      return <DateField {...field} />;
    case 'checkbox':
      return <CheckboxField {...field} />;
    case 'file':
      return <FileField {...field} />;
    case 'country':
      return <CountryField {...(field as CountryFieldProps)} />;
    case 'single_choice':
      return <SingleChoiceField {...(field as ChoiceFieldProps)} />;
    case 'multi_choice':
      return <MultiChoiceField {...(field as ChoiceFieldProps)} />;
    case 'accommodation':
      return <AccommodationField {...(field as ChoiceFieldProps)} />;
    case 'accompanying_persons':
      return <AccompanyingPersonsField {...field} />;
    case 'picture':
      return <PictureField {...field} />;
    default:
      console.warn('Unhandled field', field);
      return null;
  }
}

function FieldHeader({title, description}: {title: string; description: string}) {
  return (
    <>
      <Typography variant="body2" className="font-bold">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" className="mb-1 italic text-gray-600 dark:text-gray-400">
          {description}
        </Typography>
      )}
    </>
  );
}

function TextField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{data}</Typography>
    </div>
  );
}

function BooleanField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{data ? 'yes' : 'no'}</Typography>
    </div>
  );
}

function TextAreaField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1" className="whitespace-pre-line">
        {data}
      </Typography>
    </div>
  );
}

function DateField({title, description, data}: FieldProps) {
  const date = data ? formatDatetime(data) : '';
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{date}</Typography>
    </div>
  );
}

function CheckboxField({title, description, data}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{data ? 'yes' : 'no'}</Typography>
    </div>
  );
}

function FileField({title, description, data: filename}: FieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{filename}</Typography>
    </div>
  );
}

function SingleChoiceField({title, description, choices, data}: ChoiceFieldProps) {
  // data: {[uuid]: [number_of_choices]}
  const selected = Object.keys(data)[0];

  // nothing selected
  if (selected === undefined) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
      </div>
    );
  }

  const amount = data[selected];
  const caption = choices.find(choice => choice.id === selected)?.caption;

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">
        {caption}: {amount}
      </Typography>
    </div>
  );
}

function CountryField({title, description, choices, data}: CountryFieldProps) {
  // nothing selected
  if (!data) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
      </div>
    );
  }

  const country = choices.find(choice => choice.countryKey === data)?.caption;
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography variant="body1">{country}</Typography>
    </div>
  );
}

function MultiChoiceField({title, description, choices, data}: ChoiceFieldProps) {
  // data: {[uuid]: [number_of_choices]}
  const selected = Object.entries(data).map(([id, amount]) => ({
    id,
    caption: choices.find(choice => choice.id === id)?.caption,
    amount,
  }));

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul className="list-inside list-disc">
          {selected.map(({id, caption, amount}) => (
            <li key={id}>
              <>
                {caption}: {amount}
              </>
            </li>
          ))}
        </ul>
      </Typography>
    </div>
  );
}

function AccommodationField({title, description, choices, data}: ChoiceFieldProps) {
  // nothing selected
  if (data.isNoAccommodation || !data.choice) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
        <Typography variant="body1">No accommodation</Typography>
      </div>
    );
  }

  const caption = choices.find(choice => choice.id === data.choice)?.caption;
  const {arrivalDate, departureDate} = data;

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul>
          <li>Arrival: {formatDatetime(arrivalDate)}</li>
          <li>Departure: {formatDatetime(departureDate)}</li>
          <li>Accommodation: {caption}</li>
        </ul>
      </Typography>
    </div>
  );
}

export interface AccompanyingPersonsFieldData {
  id: string;
  firstName: string;
  lastName: string;
}

interface AccompanyingPersonsFieldProps extends FieldProps {
  data: AccompanyingPersonsFieldData[];
}

function AccompanyingPersonsField({title, description, data}: AccompanyingPersonsFieldProps) {
  return (
    <div>
      <FieldHeader title={title} description={description} />
      <Typography as="div" variant="body1">
        <ul className="list-inside list-disc">
          {data.map(({id, firstName, lastName}) => (
            <li key={id}>
              {firstName} {lastName}
            </li>
          ))}
        </ul>
      </Typography>
    </div>
  );
}

export function getAccompanyingPersons(sections: Section[]) {
  const persons = [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.inputType === 'accompanying_persons') {
        persons.push(...field.data);
      }
    }
  }
  return persons;
}

function PictureField({title, description, data}: FieldProps) {
  if (!data) {
    return null;
  }

  // fallback to showing the filename only if it's not a valid URL
  const isValidUrl = data.startsWith('http://') || data.startsWith('https://');
  if (!isValidUrl) {
    return (
      <div>
        <FieldHeader title={title} description={description} />
        <Typography variant="body1">{data}</Typography>
      </div>
    );
  }

  return (
    <div>
      <FieldHeader title={title} description={description} />
      <img src={data} alt={title} />
    </div>
  );
}
