import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  useEffect(() => { api.get('/profile').then((res) => setProfile(res.data)); }, []);
  if (!profile) return <p>Loading profile...</p>;
  return <div className="card"><h1>Profile</h1><p><b>Name:</b> {profile.user.name}</p><p><b>Company:</b> {profile.user.company}</p><p><b>Role:</b> {profile.user.role}</p><p><b>Procurement Focus:</b> {profile.user.procurementFocus}</p><p><b>Categories of Interest:</b> {profile.user.categoriesOfInterest?.join(', ')}</p><p><b>Market Type:</b> {profile.user.marketType}</p></div>;
}
