'use client';
import { useEffect, useState } from 'react';

export default function Greeting({ name }) {
  const [g, setG] = useState('Welcome');
  useEffect(() => {
    const h = new Date().getHours();
    setG(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);
  return <h1>{g}, {name.split(' ')[0]}</h1>;
}
