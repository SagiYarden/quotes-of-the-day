import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
const apiUrl = import.meta.env.VITE_QUOTE_APP_BACKEND_URL;

type EnvContextType = {
  backendUrl: string;
};
const EnvContext = createContext<EnvContextType | undefined>(undefined);

export const EnvProvider = ({ children }: PropsWithChildren) => {
  const [backendUrl, setBackendUrl] = useState<string>('');

  useEffect(() => {
    const loadEnv = async () => {
      try {
        setBackendUrl(apiUrl || '');
      } catch (error) {
        console.error('Error loading env.json:', error);
      }
    };
    loadEnv();
  }, []);

  if (!backendUrl) {
    return <div>Loading...</div>;
  }

  return (
    <EnvContext.Provider value={{ backendUrl }}>{children}</EnvContext.Provider>
  );
};

export const useEnv = () => {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error('useEnv must be used within an EnvProvider');
  }
  return context;
};
