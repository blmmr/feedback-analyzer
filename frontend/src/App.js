import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/analyze', { text });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Feedback Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Enter your feedback..."
        />
        <button type="submit">Analyze</button>
      </form>
      {result && (
        <div>
          <h2>Results:</h2>
          <p>Sentiment: {result.sentiment.label} (Score: {result.sentiment.score})</p>
          <p>Keywords: {result.keywords.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default App;