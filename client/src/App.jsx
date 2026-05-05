import { useState } from 'react';
import './styles.css';
import Procurement from './components/modules/Procurement';
import Sourcing from './components/modules/Sourcing';
import Marketplace from './components/modules/Marketplace';
import Proposal from './components/modules/Proposal';
import Purchasing from './components/modules/Purchasing';
import Category from './components/modules/Category';
import Funding from './components/modules/Funding';

const modules = {
  'Procurement Intelligence': Procurement,
  Sourcing,
  Marketplace,
  'Proposal Generator': Proposal,
  Purchasing,
  'Category Management': Category,
  'Funding Bridge': Funding
};

export default function App() {
  const [currentModule, setCurrentModule] = useState('Procurement Intelligence');
  const CurrentModule = modules[currentModule];

  return (
    <div className="layout">
      <header className="top-nav">
        <h1>BlackCrest Nexus</h1>
        <select value={currentModule} onChange={(e) => setCurrentModule(e.target.value)}>
          {Object.keys(modules).map((module) => <option key={module} value={module}>{module}</option>)}
        </select>
      </header>

      <aside className="sidebar">
        <button>Dashboard</button>
        <button>Alerts</button>
        <button>Settings</button>
      </aside>

      <main className="content">
        <CurrentModule />
      </main>
    </div>
  );
}
