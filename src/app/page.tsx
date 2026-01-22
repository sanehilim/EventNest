'use client';

import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, Shield, Zap, Globe, ArrowRight, Sparkles, Users, Lock } from "lucide-react";

export default function Home() {
  const { isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isConnected) {
      router.push('/dashboard');
    } else {
      open();
    }
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "NFT Tickets",
      description: "Fraud-proof tickets minted on Polygon. No duplicates, no fakes."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Pay With Any Crypto",
      description: "Use Bitcoin, Ethereum, Solana, or any crypto via SideShift."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Low Fees",
      description: "Powered by Polygon for fast, cheap transactions."
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Private Events",
      description: "Create invite-only events with PIN protection."
    }
  ];

  const steps = [
    { num: "01", title: "Connect Wallet", desc: "Link your Web3 wallet securely" },
    { num: "02", title: "Discover or Create", desc: "Find events or host your own" },
    { num: "03", title: "Buy with Any Crypto", desc: "Pay using your preferred token" },
    { num: "04", title: "Own Your Ticket", desc: "NFT ticket in your wallet" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] via-white to-[#FFF7ED]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/30 to-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-orange-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Powered by Polygon & Web3
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-gray-900">Events That</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent animate-gradient">
                Live On Chain
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Create, discover, and attend events with blockchain-verified NFT tickets. 
              Pay with any cryptocurrency. Zero fraud. Zero middlemen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-orange-300/50 transition-all group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => router.push('/explore')}
                className="border-orange-300 text-orange-700 hover:bg-orange-50 text-lg px-8 py-6 rounded-full"
              >
                Explore Events
              </Button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span>Blockchain-Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-orange-500" />
                <span>NFT Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <span>100% Fraud-Proof</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-20 transform rotate-1" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 overflow-hidden border border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-4"
                    >
                      <div className="aspect-video rounded-xl bg-gradient-to-br from-orange-200 to-orange-100 mb-3 flex items-center justify-center">
                        <Ticket className="w-12 h-12 text-orange-400" />
                      </div>
                      <div className="h-4 bg-orange-100 rounded-full w-3/4 mb-2" />
                      <div className="h-3 bg-orange-50 rounded-full w-1/2" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why EventNest?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The future of event ticketing is decentralized, transparent, and secure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative p-6 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 hover:border-orange-300 transition-colors">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:shadow-orange-300/50 transition-shadow">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Four simple steps to event ownership</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-orange-300 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="text-6xl font-bold text-orange-200 mb-4">{step.num}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Host Your First Event?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Join thousands of creators who are already using EventNest to revolutionize their events.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-10 py-6 rounded-full shadow-xl"
            >
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EventNest</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              Decentralized event ticketing on Polygon.
              <br />
              Built with Web3, powered by community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}