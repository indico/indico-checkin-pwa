import {Typography} from '../Components/Tailwind';
import {LoadingIndicator} from '../Components/Tailwind/LoadingIndicator';

export default function LoadingBanner({text}: {text: string}) {
  return (
    <div className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <div className="relative flex flex-col items-center justify-center gap-4 px-6 pt-10 pb-36 rounded-xl">
        <Typography variant="h3">{text}</Typography>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 transition ease-linear">
            <LoadingIndicator size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
