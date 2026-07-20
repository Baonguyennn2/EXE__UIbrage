import { RiLayoutMasonryFill } from 'react-icons/ri'

export default function LoadingScreen({ message = 'SYSTEM_BOOTING...' }) {
  return (
    <div className="cyber-loading-screen">
      <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
      
      <div className="loading-content">
        <div className="loading-logo-wrapper">
          <div className="loading-logo-glow" />
          <div className="loading-logo">
            <RiLayoutMasonryFill size={36} color="var(--cyber-accent)" />
          </div>
          <div className="loading-spinner" />
          <div className="loading-spinner-inner" />
        </div>
        
        <div className="loading-brand">
          <h2 className="loading-title cyber-glitch-text" data-text="UIBRAGE_SYS">UIBRAGE_SYS</h2>
          <div className="loading-status">
            <span className="status-dot flicker" />
            <p className="status-text">{message}</p>
          </div>
          <div className="loading-bar-wrapper">
            <div className="loading-bar"></div>
          </div>
        </div>
      </div>

      <style>{`
        .cyber-loading-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #05050a; /* var(--cyber-bg) */
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          z-index: 10;
        }

        .loading-logo-wrapper {
          position: relative;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-logo {
          position: relative;
          z-index: 2;
          width: 64px;
          height: 64px;
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid var(--cyber-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.2);
          transform: rotate(45deg);
        }
        
        .loading-logo > * {
          transform: rotate(-45deg);
        }

        .loading-logo-glow {
          position: absolute;
          inset: -15px;
          background: rgba(0, 212, 255, 0.15);
          filter: blur(20px);
          animation: glowPulse 2s ease-in-out infinite;
        }

        .loading-spinner {
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          border-top-color: var(--cyber-accent-tertiary);
          border-right-color: var(--cyber-accent-secondary);
          border-radius: 50%;
          animation: spin 1.5s linear infinite;
        }
        
        .loading-spinner-inner {
          position: absolute;
          inset: 10px;
          border: 1px solid transparent;
          border-bottom-color: var(--cyber-accent);
          border-left-color: var(--cyber-accent);
          border-radius: 50%;
          animation: spinReverse 2s linear infinite;
        }

        .loading-brand {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .loading-title {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #fff;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .loading-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--cyber-accent);
          box-shadow: 0 0 8px var(--cyber-accent);
        }

        .status-text {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--cyber-accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .loading-bar-wrapper {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
          position: relative;
        }
        
        .loading-bar {
          position: absolute;
          top: 0; left: 0; height: 100%;
          width: 30%;
          background: var(--cyber-accent);
          box-shadow: 0 0 10px var(--cyber-accent);
          animation: loadScan 2s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes spinReverse {
          to { transform: rotate(-360deg); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes loadScan {
          0% { left: -30%; width: 30%; }
          50% { left: 40%; width: 20%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  )
}
