import React, { useEffect, useState } from 'react';
import api from '../services/api';

const FALLBACK_PROFILE = {
  user: {
    name: 'Demo Executive',
    company: 'BlackCrest Demo Org',
    role: 'VP Growth',
    procurementFocus: 'Federal Digital Services',
    categoriesOfInterest: ['Cloud', 'Cybersecurity', 'Data Analytics'],
    marketType: 'Prime + Sub'
  }
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/profile');
        setProfile(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Profile service unavailable. Showing fallback profile.');
        setProfile(FALLBACK_PROFILE);
      }
    };

    load();
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  const user = profile && typeof profile.user === 'object' && profile.user !== null ? profile.user : {};
  const categoriesOfInterest = Array.isArray(user.categoriesOfInterest) ? user.categoriesOfInterest : [];

  return (
    <div className="card">
      <h1>Profile</h1>
      {error ? <p className="muted">{error}</p> : null}
      <p><b>Name:</b> {user.name || 'N/A'}</p>
      <p><b>Company:</b> {user.company || 'N/A'}</p>
      <p><b>Role:</b> {user.role || 'N/A'}</p>
      <p><b>Procurement Focus:</b> {user.procurementFocus || 'N/A'}</p>
      <p><b>Categories of Interest:</b> {categoriesOfInterest.join(', ')}</p>
      <p><b>Market Type:</b> {user.marketType || 'N/A'}</p>
    </div>
  );
}
