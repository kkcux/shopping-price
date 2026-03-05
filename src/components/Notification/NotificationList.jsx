import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './NotificationList.css';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setNotifications(data);
    if (error) console.error('Error fetching data:', error);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // ฟังการเปลี่ยนแปลงข้อมูลแบบ Real-time (ต้องเปิด Replication ใน Supabase ก่อน)
    const channel = supabase
      .channel('public:product_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'product_updates' },
        (payload) => {
          // เพิ่มข้อมูลใหม่เข้าไปในสถานะปัจจุบันทันทีโดยไม่ต้อง Refresh
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="notification-card fade-in-down">
      <div className="notification-header">
        <Bell size={20} className="header-icon" />
        <h3>ข้อมูลการอัปเดตสินค้า</h3>
      </div>

      <div className="notification-body">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item.id} className="notification-item">
              <div className="notif-text">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <span className="update-date">
                  {new Date(item.created_at).toLocaleString('th-TH', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="notif-badge">
                <div className="update-circle">
                  <RefreshCw size={14} strokeWidth={2.5} color="#10b77e" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>ไม่มีข้อมูลการอัปเดต</div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;