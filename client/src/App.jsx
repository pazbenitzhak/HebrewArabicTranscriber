import { useState } from 'react';
import 'flag-icons/css/flag-icons.min.css';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function handleTranscribe() {
    setResult('');
    setError('');

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });

    const data = await response.json();

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data.result);
    }
  }

  return (
    <div className="container">
      <div className="flags-row">
        <span className="fi fi-il flag"></span>
        <span className="fi fi-sa flag"></span>
      </div>
      <h1>Hebrew &amp; Arabic Transcriber</h1>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleTranscribe()}
        placeholder="Enter Hebrew or Arabic text..."
      />

      <button onClick={handleTranscribe}>Transcribe</button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <span className="result-label">Result:</span>
          <span className="result-text">{result}</span>
        </div>
      )}
    </div>
  );
}

export default App;
