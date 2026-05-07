import React from 'react'; import {Link} from 'react-router-dom'; import {useAuth} from '../context/AuthContext';
const mods=['intelligence','marketplace','capital','analytics','sentinel','settings'];
export default function Layout({children}){const {user,logout}=useAuth();return <div style={{display:'grid',gridTemplateColumns:'240px 1fr',minHeight:'100vh'}}>
<aside className='panel' style={{margin:12,padding:12}}><h3 style={{color:'var(--bc-gold)'}}>BlackCrest Nexus</h3>{mods.map(m=><div key={m}><Link to={`/${m}`} style={{color:'#fff'}}>{m}</Link></div>)}</aside>
<main><header className='panel' style={{margin:12,padding:10,display:'flex',justifyContent:'space-between'}}><span>Notifications: 3</span><span>{user?.email} <button className='btn' onClick={logout}>Logout</button></span></header><div style={{padding:12}}>{children}</div></main>
</div>}
