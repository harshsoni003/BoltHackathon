import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentStats, LanguageStats } from '@/services/analyticsService';
import { motion } from 'framer-motion';
import { User, Activity, Globe, ArrowRight } from 'lucide-react';

interface AgentStatsTableProps {
  agentStats: AgentStats[];
  languageStats: LanguageStats[];
  isLoading?: boolean;
}

const AgentStatsTable = ({ agentStats, languageStats, isLoading }: AgentStatsTableProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-40 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-40 w-full bg-gray-50 rounded-xl animate-pulse"></div>
        </div>
        <div className="h-60 w-full bg-gray-50 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Agent Performance Table */}
      <Card className="lg:col-span-2 border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              <CardTitle className="text-lg font-bold text-gray-900">Agent Performance</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {agentStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent Portfolio</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Calls</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Minutes</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {agentStats.map((agent, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {agent.agentName.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{agent.agentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{agent.numberOfCalls}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{agent.callMinutes}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 italic">
                          {agent.creditsSpent} cr
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-gray-400 text-sm italic">
              No active agent distribution detected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Distribution */}
      <Card className="border-gray-200 shadow-sm bg-white rounded-xl">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-blue-600" />
            <CardTitle className="text-lg font-bold text-gray-900">Linguistic Hub</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-6">
            {languageStats.map((lang, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900">{lang.language}</span>
                  <span className="text-xs font-bold text-blue-600">{lang.percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lang.percentage}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
            {languageStats.length === 0 && (
              <div className="py-10 text-center opacity-20">
                <Globe size={32} className="mx-auto" />
              </div>
            )}
            <p className="text-[10px] text-gray-400 leading-tight">
              Linguistic data is synced from regional processing centers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatsTable;