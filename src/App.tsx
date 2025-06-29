import React from 'react';
import { ArrowRight, Star, Users, Zap } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center">
          <Zap className="h-8 w-8 text-purple-400" />
          <span className="ml-2 text-xl font-bold text-white">Nexus</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl pt-20 pb-32 sm:pt-32 sm:pb-40">
          {/* Trust indicators */}
          <div className="mb-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-purple-400 mr-1" />
              <span>50,000+ users</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build the future
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                faster than ever
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
              Transform your ideas into reality with our cutting-edge platform. 
              Join thousands of creators who are already building the next generation of digital experiences.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button className="group bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                Start building free
                <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-white px-8 py-4 rounded-lg text-lg font-semibold border border-gray-600 hover:border-gray-400 transition-colors">
                Watch demo
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-gray-400 mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10M+</div>
                <div className="text-sm text-gray-400 mt-1">API Calls</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">150+</div>
                <div className="text-sm text-gray-400 mt-1">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-400 mt-1">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
        <div className="absolute left-[calc(50%+3rem)] top-[calc(50%-13rem)] -z-10 transform-gpu blur-3xl xl:left-[calc(50%+9rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;