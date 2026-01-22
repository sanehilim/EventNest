'use client';

import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { Button } from '@/components/ui/button';
import { Ticket, Plus, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-300 transition-shadow">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              EventNest
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/explore" 
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  <Search className="w-4 h-4" />
                  Explore
                </Link>
                <Link 
                  href="/create-event" 
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="px-4 py-2 bg-orange-100 rounded-full">
                  <span className="text-sm font-medium text-orange-700">{shortAddress}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => disconnect()}
                  className="text-gray-500 hover:text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link 
                  href="/explore" 
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  <Search className="w-4 h-4" />
                  Explore
                </Link>
                <Button 
                  onClick={() => open()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-6 shadow-lg hover:shadow-orange-300/50 transition-all"
                >
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-orange-100"
          >
            <div className="px-4 py-4 space-y-3">
              <Link 
                href="/explore" 
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5 text-orange-600" />
                Explore Events
              </Link>
              
              {isConnected && (
                <>
                  <Link 
                    href="/create-event" 
                    className="flex items-center gap-2 p-3 rounded-lg bg-orange-100 text-orange-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    Create Event
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-orange-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-orange-600" />
                    Dashboard
                  </Link>
                </>
              )}

              <div className="pt-3 border-t border-orange-100">
                {isConnected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{shortAddress}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        disconnect();
                        setMobileMenuOpen(false);
                      }}
                      className="text-red-500"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => {
                      open();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full"
                  >
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}