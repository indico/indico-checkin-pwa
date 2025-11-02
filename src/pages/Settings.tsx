import {useNavigate} from 'react-router-dom';
import {
  CheckCircleIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  QrCodeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {Typography} from '../Components/Tailwind';
import TopNav from '../Components/TopNav';

export default function SettingsPage() {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: 'Check-in',
      description: 'Configure check-in behavior and scanning options',
      icon: CheckCircleIcon,
      path: '/settings/checkin',
    },
    {
      title: 'Preferences',
      description: 'Customise the look and feel of the app',
      icon: PaintBrushIcon,
      path: '/settings/preferences',
    },
    {
      title: 'Debugging',
      description: 'Reset options and app logs',
      icon: WrenchScrewdriverIcon,
      path: '/settings/debug',
    },
    {
      title: 'About',
      description: 'App version information',
      icon: QrCodeIcon,
      path: '/settings/about',
    },
  ];

  return (
    <>
      <TopNav backBtnText="Settings" backNavigateTo="/" />
      <div className="flex flex-col gap-3 p-4">
        {settingsGroups.map(group => (
          <SettingsGroupButton
            key={group.path}
            title={group.title}
            description={group.description}
            icon={group.icon}
            onClick={() => navigate(group.path)}
          />
        ))}
      </div>
    </>
  );
}

interface SettingsGroupButtonProps {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  onClick: () => void;
}

function SettingsGroupButton({title, description, icon: Icon, onClick}: SettingsGroupButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <Typography variant="h4" className="font-semibold">
          {title}
        </Typography>
        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
          {description}
        </Typography>
      </div>
      <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
    </button>
  );
}
