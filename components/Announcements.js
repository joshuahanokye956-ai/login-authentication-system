import { Megaphone } from 'lucide-react';

export default function Announcements({ items }) {
  return (
    <section className="card">
      <h3 className="card-title"><Megaphone size={17} /> Announcements</h3>
      {items.length === 0 ? <p className="muted">Nothing new right now. Updates from your admins will appear here.</p> : (
        <ul className="feed">{items.map((a) => (
          <li key={a.id} className="feed-row"><div><p>{a.message}</p><span className="muted">{a.author_name} · {a.when}</span></div></li>
        ))}</ul>
      )}
    </section>
  );
}
