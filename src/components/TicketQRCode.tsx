'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TicketQRCodeProps {
  tokenId: string;
  eventId: string;
}

export function TicketQRCode({ tokenId, eventId }: TicketQRCodeProps) {
  const [qrData, setQrData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [tokenId, eventId]);

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`/api/tickets/${tokenId}/qr`);
      if (response.ok) {
        const data = await response.json();
        setQrData(JSON.stringify({
          tokenId: data.ticket.tokenId,
          eventId: data.ticket.eventId,
          walletAddress: data.ticket.walletAddress,
          timestamp: Date.now(),
        }));
      } else {
        toast.error('Failed to load QR code');
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ticket-${tokenId}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyQRData = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    toast.success('QR code data copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border-2 border-orange-200 p-8 shadow-xl"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4">
          <Ticket className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Ticket QR Code</h3>
        <p className="text-gray-600">Show this at the event entrance</p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-xl border-2 border-orange-300 shadow-lg">
          <QRCodeSVG
            id="qr-code-svg"
            value={qrData}
            size={256}
            level="M"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={downloadQRCode}
          variant="outline"
          className="flex-1 border-2 border-orange-300 hover:bg-orange-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button
          onClick={copyQRData}
          variant="outline"
          className="flex-1 border-2 border-orange-300 hover:bg-orange-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Data
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Token ID: <span className="font-mono font-semibold">{tokenId}</span>
        </p>
      </div>
    </motion.div>
  );
}
