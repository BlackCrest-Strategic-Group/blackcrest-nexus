import React, {createContext,useContext,useState} from 'react';
const AuthContext=createContext();
export const useAuth=()=>useContext(AuthContext);
export default function AuthProvider({children}){
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user')||'null'));
  const login=(payload)=>{setUser(payload);localStorage.setItem('user',JSON.stringify(payload));};
  const logout=()=>{setUser(null);localStorage.removeItem('user');};
  return <AuthContext.Provider value={{user,login,logout,isAuthed:!!user}}>{children}</AuthContext.Provider>;
}
