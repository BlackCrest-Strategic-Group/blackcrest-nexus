import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  useEffect(() => { api.get('/profile').then((res) => setProfile(res.data)); }, []);
  if (!profile) return <p>Loading profile...</p>;
  const user = profile && typeof profile.user === 'object' && profile.user !== null ? profile.user : {};
  const categoriesOfInterest = Array.isArray(user.categoriesOfInterest) ? user.categoriesOfInterest : [];
  return <div className="card"><h1>Profile</h1><p><b>Name:</b> {user.name || 'N/A'}</p><p><b>Company:</b> {user.company || 'N/A'}</p><p><b>Role:</b> {user.role || 'N/A'}</p><p><b>Procurement Focus:</b> {user.procurementFocus || 'N/A'}</p><p><b>Categories of Interest:</b> {categoriesOfInterest.join(', ')}</p><p><b>Market Type:</b> {user.marketType || 'N/A'}</p></div>;
}
