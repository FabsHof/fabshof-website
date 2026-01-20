import { Scene } from './components/Scene';
import { UIOverlay } from './components/UIOverlay';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import './App.css';

function App() {
  return (
    <>
      <Scene />
      <UIOverlay />
      <LanguageSwitcher />
    </>
  );
}

export default App;
