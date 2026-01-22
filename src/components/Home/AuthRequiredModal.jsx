import React, { useEffect } from 'react';
import { LogIn, Lock } from 'lucide-react';
import './AuthRequiredModal.css';

const AuthRequiredModal = ({ isOpen, onClose, onLogin }) => {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="auth-icon-wrapper">
          <Lock size={36} color="#10b981" strokeWidth={2.5} />
        </div>

        <h3 className="auth-modal-title">เข้าสู่ระบบเพื่อดำเนินการต่อ</h3>
        
        <p className="auth-modal-desc">
          กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด<br />
          และใช้งานฟีเจอร์อื่นๆ ได้อย่างเต็มที่
        </p>

        <div className="auth-modal-actions">
           <button className="btn-auth-cancel" onClick={onClose}>
             ยกเลิก
           </button>
           <button className="btn-auth-login" onClick={onLogin}>
             <LogIn size={18} style={{ marginRight: '8px' }} />
             เข้าสู่ระบบ
           </button>
        </div>

      </div>
    </div>
  );
};

export default AuthRequiredModal;
