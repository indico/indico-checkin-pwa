import {Typography} from '../Components/Tailwind';
import {Toggle} from '../Components/Tailwind/Toggle';

interface SettingToggleProps {
  title: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}

export function SettingToggle({title, description, checked, onToggle}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4" onClick={onToggle}>
      <div>
        <Typography variant="h4">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
      </div>
      <div>
        <Toggle size="md" checked={checked} />
      </div>
    </div>
  );
}
