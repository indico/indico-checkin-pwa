import {useEffect, useState} from 'react';
import {UserIcon} from '@heroicons/react/20/solid';
import {getParticipantPicture} from '../utils/client';

interface ParticipantPictureProps {
  pictureUrl: string;
  serverId: number;
  className?: string;
  alt: string;
  useFallback?: boolean;
}

export default function ParticipantPicture({
  pictureUrl,
  serverId,
  className,
  alt,
  useFallback = false,
}: ParticipantPictureProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let url: string | null = null;

    (async () => {
      const response = await getParticipantPicture(serverId, pictureUrl, {
        signal: controller.signal,
      });
      if (response.ok) {
        url = URL.createObjectURL(response.data);
        setObjectUrl(url);
      }
    })();

    return () => {
      controller.abort();
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [pictureUrl, serverId]);

  if (!objectUrl) {
    return useFallback ? <UserIcon className="w-16 text-blue-600 dark:text-blue-700" /> : null;
  } else {
    return <img src={objectUrl} className={className} alt={alt} />;
  }
}
