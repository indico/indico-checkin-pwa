import {useEffect, useState} from 'react';
import {UserIcon} from '@heroicons/react/20/solid';
import db from '../db/db';
import {useLogError} from '../hooks/useError';

interface ParticipantPictureProps {
  pictureUrl: string;
  serverId: number;
  className?: string;
  alt?: string;
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
  const logError = useLogError();

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    const fetchPicture = async () => {
      const server = await db.servers.get(serverId);
      if (!server) {
        logError(`Server (id <${serverId}>) not found in IndexedDB`);
        return null;
      }
      try {
        const resp = await fetch(pictureUrl, {
          headers: {Authorization: `Bearer ${server.authToken}`},
        });
        if (!resp.ok) {
          throw new Error(`${resp.status} ${resp.statusText}`);
        }
        const blob = await resp.blob();
        url = URL.createObjectURL(blob);
        if (!cancelled) {
          setObjectUrl(url);
        }
      } catch (e) {
        logError(`Error fetching participant picture: ${e}`);
        return null;
      }
    };

    fetchPicture();
    return () => {
      cancelled = true;
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
