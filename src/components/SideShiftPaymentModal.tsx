'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, CheckCircle2, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SUPPORTED_DEPOSIT_COINS } from '@/lib/sideshift';

interface SideShiftPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketPrice: number;
  settleAddress: string;
  onPaymentComplete: (shiftId: string) => void;
}

export function SideShiftPaymentModal({
  isOpen,
  onClose,
  ticketPrice,
  settleAddress,
  onPaymentComplete,
}: SideShiftPaymentModalProps) {
  const [selectedCoin, setSelectedCoin] = useState(SUPPORTED_DEPOSIT_COINS[0]);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'quote' | 'payment' | 'complete'>('select');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('select');
      setQuote(null);
      setShift(null);
      setSelectedCoin(SUPPORTED_DEPOSIT_COINS[0]);
    }
  }, [isOpen]);

  const getQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sideshift/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositCoin: selectedCoin.coin,
          depositNetwork: selectedCoin.network,
          settleCoin: 'MATIC',
          settleNetwork: 'polygon',
          settleAmount: ticketPrice.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get quote');
      }

      const data = await response.json();
      setQuote(data);
      setStep('quote');
    } catch (error) {
      console.error('Error getting quote:', error);
      toast.error('Failed to get price quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createShift = async () => {
    if (!quote) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sideshift/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          settleAddress: settleAddress,
          fixed: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shift');
      }

      const data = await response.json();
      setShift(data);
      setStep('payment');
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmPayment = () => {
    if (shift) {
      onPaymentComplete(shift.id);
      setStep('complete');
      setTimeout(() => onClose(), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-gradient-to-b from-white to-orange-50/30 rounded-3xl shadow-2xl border-2 border-orange-200 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            {step === 'select' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Crypto</h2>
                  <p className="text-lg text-gray-600">
                    Select which cryptocurrency you want to use for payment
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                  {SUPPORTED_DEPOSIT_COINS.map((coin) => (
                    <motion.button
                      key={`${coin.coin}-${coin.network}`}
                      onClick={() => setSelectedCoin(coin)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative p-5 rounded-2xl border-2 transition-all text-center ${
                        selectedCoin.coin === coin.coin && selectedCoin.network === coin.network
                          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 bg-white hover:shadow-md'
                      }`}
                    >
                      {selectedCoin.coin === coin.coin && selectedCoin.network === coin.network && (
                        <motion.div
                          layoutId="selectedCoin"
                          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-2xl"
                        />
                      )}
                      <div className="relative">
                        <div className="text-4xl mb-2">{coin.icon}</div>
                        <div className="font-bold text-gray-900 text-sm">{coin.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{coin.coin}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-300 mb-6 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700 font-medium">You're buying</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      {ticketPrice} MATIC
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Worth of ticket for this event
                  </div>
                </div>

                <Button
                  onClick={getQuote}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Getting Quote...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Continue
                      <ArrowRight className="w-6 h-6" />
                    </span>
                  )}
                </Button>

                <div className="mt-6 pt-6 border-t border-orange-200 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Powered by</span>
                  <a 
                    href="https://sideshift.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    SideShift.ai
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}

            {step === 'quote' && quote && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">Confirm Payment</h2>
                  <p className="text-lg text-gray-600">
                    Review the exchange rate and proceed with payment
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 rounded-3xl p-8 border-2 border-orange-300 mb-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-2 font-medium">You Pay</div>
                      <div className="text-4xl font-bold text-gray-900">
                        {parseFloat(quote.depositAmount).toFixed(8)}
                      </div>
                      <div className="text-xl text-orange-600 font-semibold mt-1">{selectedCoin.coin}</div>
                    </div>
                    <div className="flex-shrink-0 mx-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-2 font-medium">You Receive</div>
                      <div className="text-4xl font-bold text-gray-900">
                        {parseFloat(quote.settleAmount).toFixed(4)}
                      </div>
                      <div className="text-xl text-orange-600 font-semibold mt-1">MATIC</div>
                    </div>
                  </div>
                  
                  <div className="border-t-2 border-orange-200 pt-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Exchange Rate</span>
                      <span className="font-bold text-gray-900">
                        1 {selectedCoin.coin} = {parseFloat(quote.rate).toFixed(4)} MATIC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Quote Expires</span>
                      <span className="font-bold text-orange-600">
                        {new Date(quote.expiresAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1 py-7 text-lg rounded-2xl border-2 border-orange-300 hover:bg-orange-50 font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={createShift}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-2xl shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm & Continue'
                    )}
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-orange-200 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Powered by</span>
                  <a 
                    href="https://sideshift.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    SideShift.ai
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}

            {step === 'payment' && shift && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">Send Payment</h2>
                  <p className="text-lg text-gray-600">
                    Send {selectedCoin.coin} to the address below to complete your purchase
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 rounded-3xl p-8 border-2 border-orange-300 mb-6 shadow-xl">
                  <div className="mb-6 text-center">
                    <div className="text-sm text-gray-600 mb-3 font-medium">Send Exactly</div>
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {parseFloat(shift.depositAmount).toFixed(8)}
                    </div>
                    <div className="text-2xl text-orange-600 font-bold">{selectedCoin.coin}</div>
                  </div>

                  <div className="border-t-2 border-orange-200 pt-6">
                    <div className="text-sm text-gray-600 mb-3 font-medium text-center">To Address</div>
                    <div className="bg-white rounded-2xl p-5 border-2 border-orange-200 mb-4 shadow-inner">
                      <code className="text-sm font-mono break-all text-gray-900 block text-center">
                        {shift.depositAddress}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => copyToClipboard(shift.depositAddress)}
                      className="w-full border-2 border-orange-300 hover:bg-orange-50 py-6 font-semibold rounded-xl"
                    >
                      {copied ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <Check className="w-5 h-5" />
                          Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Copy className="w-5 h-5" />
                          Copy Address
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-5 border-2 border-yellow-300 mb-6">
                  <p className="text-sm text-yellow-900 font-medium">
                    ⚠️ <strong>Important:</strong> Send only {selectedCoin.coin} on {selectedCoin.network} network to this address. 
                    Sending other tokens or using wrong network may result in loss of funds.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={confirmPayment}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-7 text-lg font-bold rounded-2xl shadow-xl"
                  >
                    I've Sent the Payment
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => window.open(`https://sideshift.ai/orders/${shift.id}`, '_blank')}
                    className="w-full py-6 text-gray-600 hover:bg-orange-50 font-semibold rounded-xl"
                  >
                    <span className="flex items-center gap-2">
                      Track on SideShift.ai
                      <ExternalLink className="w-5 h-5" />
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
                  className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                >
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Payment Initiated!</h2>
                <p className="text-lg text-gray-600 mb-3">
                  Your payment is being processed. The ticket will be minted once the transaction is confirmed.
                </p>
                <p className="text-sm text-gray-500">
                  This may take a few minutes depending on network conditions.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
