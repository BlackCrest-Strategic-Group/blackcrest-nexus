export default function ResultCard({ data }) {
  return <div className="card"><pre>{JSON.stringify(data, null, 2)}</pre></div>;
}
