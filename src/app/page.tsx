'use client';

import { useState } from 'react';

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Redirect to the new business page
      window.location.href = `/b/${data.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '10px' }}>Business Microsite Generator</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>
        Create a public, crawlable microsite for your business. Upload your
        business information and get a shareable page instantly.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="name"
            style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}
          >
            Business Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Acme Repairs"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="description"
            style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}
          >
            Short Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Phone & laptop repair center"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="website"
            style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="phone"
            style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="+1-555-123-4567"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label
            htmlFor="file"
            style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}
          >
            Business Document <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="file"
            id="file"
            name="file"
            required
            accept=".pdf,.txt"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            Supported formats: PDF, TXT (max 10MB)
          </small>
        </div>

        {error && (
          <div
            style={{
              padding: '15px',
              marginBottom: '20px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c00',
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: '600',
            backgroundColor: uploading ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Creating Microsite...' : 'Create Microsite'}
        </button>
      </form>

      <footer style={{ marginTop: '60px', color: '#666', fontSize: '14px' }}>
        <p>
          <strong>How it works:</strong>
        </p>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Upload your business information and document</li>
          <li>We generate a public microsite with clean HTML and schema.org markup</li>
          <li>Your page becomes crawlable by search engines and ChatGPT</li>
          <li>Share your unique URL with customers and AI assistants</li>
        </ol>
      </footer>
    </main>
  );
}

