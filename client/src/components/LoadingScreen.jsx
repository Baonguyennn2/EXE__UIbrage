import { RiLayoutMasonryFill } from 'react-icons/ri'

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="modern-loading-screen">
      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <div className="loading-logo-glow" />
          <div className="loading-logo">
            <RiLayoutMasonryFill size={32} color="#fff" />
          </div>
          <div className="loading-spinner" />
        </div>
        
        <div className="loading-brand">
          <h2 className="loading-title">UIbrage</h2>
          <div className="loading-status">
            <span className="status-dot" />
            <p className="status-text">{message}</p>
          </div>
        </div>
      </div>

      <style>{`
        .modern-loading-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          background: radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%);
          font-family: 'Inter', sans-serif;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          animation: loadingFloat 3s ease-in-out infinite;
        }

        .loading-logo-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-logo {
          position: relative;
          z-index: 2;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
          animation: logoPulse 2s ease-in-out infinite;
        }

        .loading-logo-glow {
          position: absolute;
          inset: -10px;
          background: rgba(99, 102, 241, 0.15);
          filter: blur(20px);
          border-radius: 50%;
          animation: glowPulse 2s ease-in-out infinite;
        }

        .loading-spinner {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-brand {
          text-align: center;
        }

        .loading-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .loading-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: #6366f1;
          border-radius: 50%;
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        .status-text {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        @keyframes loadingFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
