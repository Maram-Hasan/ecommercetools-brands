import { useEffect } from 'react';
import LegacyApp from './App';
import styles from './styles.css?url';
export default function LegacyEntry() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styles;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
  return <LegacyApp />;
}
