import { Component } from 'react'

/**
 * Without this, any uncaught render error anywhere in the tree unmounts the
 * whole app to a blank white screen — no sidebar, no nav, nothing to click.
 * This catches it and shows the actual error instead, with a way back.
 */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Render error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--color-bg)' }}>
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, margin: 0 }}>Something broke</h1>
            <pre style={{ fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-accent-700)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', padding: 12, borderRadius: 4 }}>
              {this.state.error.message || String(this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { this.setState({ error: null }); window.location.href = '/' }} className="btn btn-primary-solid" style={{ padding: '9px 15px' }}>
                Back to Discover
              </button>
              <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ padding: '9px 15px' }}>
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
