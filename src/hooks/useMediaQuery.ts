import {useState, useEffect} from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    function onChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    window.matchMedia(query).addEventListener('change', onChange);
    return () => window.matchMedia(query).removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
