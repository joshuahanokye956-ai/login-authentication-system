'use client';
import { useEffect, useState } from 'react';
import Avatar from './Avatar';
import Greeting from './Greeting';

const LINES = ['Good to see you again.', 'Your account is protected and ready.', 'Here is what’s new today.', 'Small habits keep accounts safe.'];

export default function UserBanner({ name, role, days }) {
  const [line, setLine] = useState(LINES[0]);
  useEffect(() => { setLine(LINES[Math.floor(Math.random() * LINES.length)]); }, []);
  return (
    <div className="banner fade">
      <Avatar name={name} size={72} />
      <div>
        <Greeting name={name} />
        <p>{line}</p>
        <div className="banner-chips"><span>{role}</span><span>{days === 0 ? 'Joined today' : `Member for ${days} day${days === 1 ? '' : 's'}`}</span></div>
      </div>
    </div>
  );
}
