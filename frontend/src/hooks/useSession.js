// src/hooks/useSession.js
import { useEffect, useState } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('hotel_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('hotel_session_id', id);
    }
    setSessionId(id);
  }, []);

  const logClick = async (hotelId) => {
    if (!sessionId || !hotelId) return;
    try {
      await fetch('http://localhost:8000/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, hotel_id: hotelId })
      });
    } catch (err) {
      console.error('Click log failed:', err);
    }
  };

  return { sessionId, logClick };
}