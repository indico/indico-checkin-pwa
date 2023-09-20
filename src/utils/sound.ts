import beep1 from '../assets/beep1.mp3';
import beep2 from '../assets/beep2.mp3';
import blip from '../assets/blip.mp3';
import levelUp from '../assets/level-up.mp3';

export const sounds = {
  'None': null,
  'Beep 1': beep1,
  'Beep 2': beep2,
  'Blip': blip,
  'Level up': levelUp,
};

export function playSound(name: string) {
  const sound = sounds[name as keyof typeof sounds];
  if (sound) {
    new Audio(sound).play();
  }
}
