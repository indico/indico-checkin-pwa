import {useEffect, useState} from 'react';

interface ProgressBarProps {
  duration: number;
  position?: string;
}

export default function ProgressBar({duration, position = 'top'}: ProgressBarProps) {
  const [value, setValue] = useState(100);

  useEffect(() => {
    const timer = setTimeout(() => setValue(0), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed left-0 ${position}-0 z-50 h-[60px] w-full bg-transparent`}>
      <div
        className="h-full bg-blue-500/50 transition-all ease-linear dark:bg-blue-500/50"
        style={{width: `${value}%`, transitionDuration: `${duration}ms`}}
      />
    </div>
  );
}
