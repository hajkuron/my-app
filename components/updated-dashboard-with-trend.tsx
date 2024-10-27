'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Clock, Calendar, Timer, Star, ArrowUpRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function UpdatedDashboardWithTrend() {
  // Mock data for consistency chart
  const consistencyData = Array(30).fill(0).map((_, i) => ({
    day: i + 1,
    completion: 65 + Math.random() * 25,
    sevenDayAvg: 75 + Math.random() * 10,
    thirtyDayAvg: 80 + Math.random() * 5
  }));

  // Missed commitments data
  const missedCommitments = [
    {
      id: 1,
      activity: "Deep Work Session",
      time: "09:00 - 11:00",
      day: "Monday",
      pattern: "3rd time this month",
      reflection: "Planned too early, consistently struggling with morning focus",
      impact: "high"
    },
    {
      id: 2,
      activity: "Evening Workout",
      time: "18:00 - 19:00",
      day: "Wednesday",
      pattern: "Often skipped when work runs late",
      reflection: "Need buffer between work and workout",
      impact: "medium"
    },
    {
      id: 3,
      activity: "Learning React",
      time: "20:00 - 21:30",
      day: "Tuesday",
      pattern: "2nd time this week",
      reflection: "Too tired for focused learning this late",
      impact: "high"
    }
  ];

  // Action items data
  const actionItems = [
    {
      title: "Morning Deep Work (High Priority)",
      description: "Consider moving to late morning when energy is higher",
      priority: "high",
      category: "work"
    },
    {
      title: "Evening Workouts",
      description: "Add 30min buffer after work ends",
      priority: "medium",
      category: "fitness"
    },
    {
      title: "Late Night Learning",
      description: "Try switching with evening workout slot",
      priority: "medium",
      category: "learning"
    }
  ];

  // Wake up time data
  const wakeUpData = Array(7).fill(0).map((_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    time: 6 + Math.random(),
    target: 6.5
  }));

  // Task distribution data
  const taskDistributionData = [
    { name: 'Work', planned: 8, actual: 7.5 },
    { name: 'Exercise', planned: 2, actual: 1.5 },
    { name: 'Learning', planned: 3, actual: 2 },
    { name: 'Social', planned: 2, actual: 2.5 },
    { name: 'Other', planned: 1, actual: 1.5 },
  ];

  // New trend data
  const trendData = {
    percentage: 12,
    label: "30-Day Trend",
    comparison: "vs. previous 30 days"
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50">
      {/* Top Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="col-span-2 md:col-span-1 lg:col-span-1">
          <CardContent className="flex flex-col justify-center h-full p-6">
            <CardTitle className="text-sm font-medium text-muted-foreground mb-2">{trendData.label}</CardTitle>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-green-600">+{trendData.percentage}%</span>
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{trendData.comparison}</p>
          </CardContent>
        </Card>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">85%</div>
          <div className="text-sm text-gray-600">Weekly Completion</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">6:30</div>
          <div className="text-sm text-gray-600">Avg Wake Time</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-sm text-gray-600">Perfect Days</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-red-600">15%</div>
          <div className="text-sm text-gray-600">Tasks Canceled</div>
        </div>
      </div>

      {/* Main Consistency Chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <CardTitle>Consistency Trends</CardTitle>
            </div>
            <div className="text-sm text-gray-600">Last 30 Days</div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consistencyData}>
              <XAxis dataKey="day" />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completion" stroke="#4f46e5" name="Daily" dot={false} />
              <Line type="monotone" dataKey="sevenDayAvg" stroke="#94a3b8" name="7-Day Avg" dot={false} />
              <Line type="monotone" dataKey="thirtyDayAvg" stroke="#cbd5e1" name="30-Day Avg" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Middle Section - Missed Commitments and Action Items side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <CardTitle>Recent Missed Commitments</CardTitle>
              </div>
              <div className="text-sm text-red-500 font-medium">
                Requires Attention
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {missedCommitments.map((commitment) => (
                <div key={commitment.id} className="p-4 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">{commitment.activity}</h3>
                      <p className="text-gray-600 text-sm">{commitment.day} • {commitment.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      commitment.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {commitment.impact} impact
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Pattern:</span> {commitment.pattern}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reflection:</span> {commitment.reflection}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <CardTitle>Action Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium text-lg mb-4">Common Patterns to Address</h3>
            <div className="space-y-3">
              {actionItems.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  item.priority === 'high' ? 'bg-red-50' : 
                  item.category === 'fitness' ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Three cards in a row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wake-up Pattern */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5" />
              <CardTitle>Wake-up Pattern</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={wakeUpData}>
                <XAxis dataKey="day" />
                <YAxis 
                  domain={[5, 8]} 
                  ticks={[5, 5.5, 6, 6.5, 7, 7.5, 8]}
                  tickFormatter={(value) => `${Math.floor(value)}:${Math.round((value % 1) * 60).toString().padStart(2, '0')}`}
                />
                <Tooltip />
                <Line type="monotone" dataKey="time" stroke="#4f46e5" name="Wake Time" />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Updated Task Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <CardTitle>Task Distribution (Hours)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                planned: {
                  label: "Planned",
                  color: "hsl(var(--chart-1))",
                },
                actual: {
                  label: "Actual",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskDistributionData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="planned" fill="var(--color-planned)" />
                  <Bar dataKey="actual" fill="var(--color-actual)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Perfect Days Mini Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <CardTitle>Perfect Days</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {Array(28).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md flex items-center justify-center text-sm
                    ${Math.random() > 0.8 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}