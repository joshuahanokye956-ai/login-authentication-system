'use client';
import { useEffect, useState } from 'react';
export const api = async (url, method = 'GET', body) => { const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) }); return r.json(); };
export function useUsers() { const [u, setU] = useState([]); const load = async () => { const d = await api('/api/users'); setU(Array.isArray(d) ? d : []); }; useEffect(() => { load(); }, []); return [u, load]; }
export function Shell({ title, children }) {
  return (<main><div className="bar"><h1>{title}</h1><button className="grey" onClick={async () => { await api('/api/auth/logout', 'POST'); location.href = '/login'; }}>Log out</button></div>{children}</main>);
}
