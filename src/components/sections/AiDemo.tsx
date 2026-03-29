import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { requestIdeaBrief } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';

export function AiDemo() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      trackEvent('ai_demo_requested');
      const response = await requestIdeaBrief(prompt.trim());
      setResult(response.text);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'AI demo is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.section
      className="content-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="flex items-center gap-3">
        <div className="icon-badge">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="eyebrow-small">Optional AI demo</p>
          <h3 className="card-title">Idea Spark</h3>
        </div>
      </div>

      <p className="card-description mt-4">
        Share a one-line brief and get a fast concept direction for your next campaign, website, or brand move.
        This demo is rate-limited and intentionally lightweight.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <label className="form-field">
          <span className="form-label">Project prompt</span>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="form-input min-h-28"
            placeholder="Example: We need a clean website and ad campaign for a premium local business in Jounieh."
            maxLength={400}
          />
        </label>

        <button className="button-secondary" type="submit" disabled={isLoading}>
          {isLoading ? 'Generating direction...' : 'Generate concept direction'}
        </button>
      </form>

      {error ? <p className="form-error mt-4">{error}</p> : null}

      {result ? (
        <div className="result-panel mt-5 whitespace-pre-line text-sm leading-7 text-slate-100">{result}</div>
      ) : null}
    </motion.section>
  );
}
