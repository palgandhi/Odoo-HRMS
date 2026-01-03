import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/ui/Toast';

// Define the User Session type
export interface UserSession {
  uid: number;
  username: string;
  password: string; // Storing password/key in memory for API calls
  db: string;
  isAdmin: boolean;
}

function App() {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLogin = (sessionData: UserSession) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <>
      <ToastProvider>
        {session ? (
          <Dashboard
            session={session}
            onLogout={handleLogout}
          />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </ToastProvider>
    </>
  );
}

export default App;
