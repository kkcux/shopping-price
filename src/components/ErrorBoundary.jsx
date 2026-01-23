import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ef4444' }}>เกิดข้อผิดพลาดบางอย่าง (Something went wrong)</h1>
          <p>กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง (Please refresh the page)</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', color: '#666', textAlign: 'left', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            รีเฟรชหน้าเว็บ
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
