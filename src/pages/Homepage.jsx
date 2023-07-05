import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import EventItem from '../Components/Events/EventItem.tsx';
import {Button, Typography} from '../Components/Tailwind/index.jsx';
import useLongPress from '../hooks/useLongPress.tsx';
import useSettings from '../hooks/useSettings.jsx';
import {formatDateObj} from '../utils/date.ts';

class MockEvent {
  /**
   *
   * @param {number} id
   * @param {string} title
   * @param {Date} date
   * @param {List<string>} attendees
   */
  constructor(id, title, date = new Date(), attendees = []) {
    this.id = id;
    this.title = title;
    this.date = formatDateObj(date);
    this.attendees = attendees;
  }
}

const Homepage = () => {
  const {setDarkMode} = useSettings();

  useEffect(() => {
    // On render, check if the user has a theme preference. If not, check if their system is set to dark mode. If so, set the theme to dark.
    // If neither, set the theme to light.
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, [setDarkMode]);

  const [list, setList] = useState([
    new MockEvent(1, 'MockEvent 1'),
    new MockEvent(2, 'MockEvent 2'),
    new MockEvent(3, 'MockEvent 3'),
  ]);

  const navigate = useNavigate();

  const navigateToEvent = item => {
    navigate(`/event/${item.id}`, {state: item});
  };

  const onAddEvent = () => {
    navigate('/event/new');
  };

  const {handlers} = useLongPress({
    onLongPress: () => console.log('long press'),
    onPress: () => console.log('press'),
  });

  return (
    <div className="w-full h-full">
      <div className="px-6 pt-1">
        <div className="flex flex-row justify-between items-center mb-6">
          <Typography variant="h2">Events</Typography>

          <Button onClick={onAddEvent}>Add event</Button>

          <button {...handlers}>Long press</button>
        </div>

        <div className="flex flex-1">
          <div className="grid grid-cols-1 w-full" spacing={2}>
            {list.map((item, idx) => {
              return <EventItem key={idx} item={item} onClick={() => navigateToEvent(item)} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
