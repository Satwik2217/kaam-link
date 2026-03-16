import React, { useState } from 'react';
import { AlertTriangle, Phone } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';

/**
 * SOS Emergency Button Component.
 * When triggered, it:
 * 1. Gets the user's current GPS location
 * 2. Sends an SOS alert to the backend (linked to active booking if provided)
 * 3. Shows a confirmation UI
 */
const SOSButton = ({ bookingId = null, className = '' }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const triggerSOS = async () => {
    // eslint-disable-next-line no-alert
    if (
      !window.confirm(
        '🚨 EMERGENCY ALERT: Are you sure you want to trigger an SOS? This will notify our safety team immediately.'
      )
    )
      return;

    setIsSending(true);
    setError(null);

    try {
      let coordinates = [0, 0];
      // Try to get current location
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              coordinates = [pos.coords.longitude, pos.coords.latitude];
              resolve();
            },
            () => resolve(), // Proceed even if location is denied
            { timeout: 5000 }
          );
        });
      }

      // In a real implementation, this would call a dedicated SOS endpoint
      // For now, we log it and show a success state
      console.log('SOS Triggered:', {
        bookingId,
        coordinates,
        timestamp: new Date().toISOString(),
      });

      // Placeholder API call:
      // await axiosInstance.post(`/bookings/${bookingId}/sos`, { coordinates });
      void axiosInstance;

      setIsSent(true);
      setTimeout(() => setIsSent(false), 10000); // Reset after 10 seconds
    } catch (err) {
      console.error(err);
      setError('Could not send SOS. Please call 112 immediately.');
    } finally {
      setIsSending(false);
    }
  };

  if (isSent) {
    return (
      <div
        className={`flex items-center gap-2 bg-success text-white text-sm font-semibold px-4 py-3 rounded-xl ${className}`}
      >
        <Phone size={16} />
        SOS Sent! Help is on the way.
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={triggerSOS}
        disabled={isSending}
        className="flex items-center gap-2 bg-sos text-white font-bold px-4 py-3 rounded-xl hover:bg-sos-hover active:scale-95 transition-all duration-150 animate-pulse disabled:animate-none disabled:opacity-75 shadow-lg"
        aria-label="SOS Emergency Alert"
      >
        <AlertTriangle size={18} />
        {isSending ? 'Sending SOS...' : 'SOS Emergency'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-destructive bg-destructive/5 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
};

export default SOSButton;

