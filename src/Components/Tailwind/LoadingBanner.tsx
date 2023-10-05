import {LoadingIndicator} from './LoadingIndicator';
import Typography from './Typography';

export default function LoadingBanner({text}: {text: string}) {
  return (
    <div className="mx-4 rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl px-6 pb-36 pt-10">
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
