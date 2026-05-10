import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DiscoverPage } from './pages/DiscoverPage';
import { LocalModelsPage } from './pages/LocalModelsPage';
import { ServerPage } from './pages/ServerPage';
import { DownloadsPage } from './pages/DownloadsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from './components/ui/toaster';
import { ToastProvider } from './components/ui/toast';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/models" element={<LocalModelsPage />} />
          <Route path="/server" element={<ServerPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </ToastProvider>
  );
}
