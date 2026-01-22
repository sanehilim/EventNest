'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRCodeScannerProps {
  eventId: string;
  organizerAddress: string;
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

export function QRCodeScanner({
  eventId,
  organizerAddress,
  onScanSuccess,
  onClose,
}: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode('qr-scanner');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );

      setScanning(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Failed to start camera. Please check permissions.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleQRCodeScanned = async (qrData: string) => {
    await stopScanning();
    setVerifying(true);

    try {
      const response = await fetch('/api/tickets/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrData,
          eventId,
          organizerAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setResult({
          success: true,
          ticket: data.ticket,
        });
        toast.success('Ticket verified successfully!');
        onScanSuccess(data.ticket);
      } else {
        setResult({
          success: false,
          error: data.error || 'Invalid ticket',
        });
        toast.error(data.error || 'Invalid ticket');
      }
    } catch (error) {
      console.error('Error verifying QR code:', error);
      setResult({
        success: false,
        error: 'Failed to verify ticket',
      });
      toast.error('Failed to verify ticket');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!result?.success || !result.ticket) return;

    try {
      const response = await fetch('/api/tickets/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: result.ticket.tokenId,
          eventId,
          organizerAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Ticket checked in successfully!');
        setResult(null);
        onScanSuccess(result.ticket);
      } else {
        toast.error(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in ticket');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Scan Ticket QR Code</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {!scanning && !result && (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Click start to begin scanning</p>
              <Button
                onClick={startScanning}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Start Scanner
              </Button>
            </div>
          )}

          {scanning && (
            <div className="relative">
              <div id="qr-scanner" className="w-full rounded-xl overflow-hidden" />
              <div className="mt-4 text-center">
                <Button
                  onClick={stopScanning}
                  variant="outline"
                  className="border-2 border-orange-300"
                >
                  Stop Scanning
                </Button>
              </div>
            </div>
          )}

          {verifying && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Verifying ticket...</p>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-4 p-4 rounded-xl border-2 ${
                  result.success
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                {result.success ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-900">Ticket Verified</h3>
                        <p className="text-sm text-green-700">
                          Token ID: {result.ticket.tokenId}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckIn}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      Check In Ticket
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-bold text-red-900">Verification Failed</h3>
                      <p className="text-sm text-red-700">{result.error}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
