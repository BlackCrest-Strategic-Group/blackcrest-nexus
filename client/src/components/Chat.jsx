import { useState } from 'react';
import { chat } from '../lib/api';
import ResultCard from './ResultCard';

export default function Chat({ mode, token }) {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState(null);
  const submit = async () => setReply(await chat(token, { message, mode, history: [] }));

  return <div><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Ask TJ (${mode})`} /><button onClick={submit}>Send</button>{reply && <><p>{reply.text}</p>{reply.cards?.map((c, i) => <ResultCard key={i} data={c} />)}</>}</div>;
}
