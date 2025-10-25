import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
export function CampaignPerformanceDashboard({ data, }) {
    const [viewMode, setViewMode] = useState("overview");
    const performanceData = [
        ...data.topPerformers.map((c) => ({ ...c, type: "Top Performer" })),
        ...data.bottomPerformers.map((c) => ({ ...c, type: "Bottom Performer" })),
    ];
    const roasData = performanceData.map((c) => ({
        name: c.campaignName,
        roas: c.roas,
        spend: c.spend,
        conversions: c.conversions,
    }));
    return (<div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Campaign Performance Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor campaign performance, alerts, and optimization opportunities
          </p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setViewMode("overview")} className={`px-4 py-2 rounded-lg ${viewMode === "overview"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"}`}>
            Overview
          </button>
          <button onClick={() => setViewMode("alerts")} className={`px-4 py-2 rounded-lg ${viewMode === "alerts"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"}`}>
            Alerts ({data.summary.activeAlerts})
          </button>
          <button onClick={() => setViewMode("opportunities")} className={`px-4 py-2 rounded-lg ${viewMode === "opportunities"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"}`}>
            Opportunities ({data.summary.opportunities})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
          <p className="text-3xl font-bold text-gray-900">
            {data.summary.totalCampaigns}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
          <p className="text-3xl font-bold text-red-600">
            {data.summary.activeAlerts}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Optimization Opportunities
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {data.summary.opportunities}
          </p>
        </div>
      </div>

      {viewMode === "overview" && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ROAS Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roasData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip formatter={(value) => [`${value}x`, "ROAS"]}/>
                <Legend />
                <Bar dataKey="roas" fill="#8884d8"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spend vs Conversions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roasData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="name"/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spend" fill="#8884d8" name="Spend ($)"/>
                <Bar dataKey="conversions" fill="#82ca9d" name="Conversions"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>)}

      {viewMode === "alerts" && (<div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Alerts
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.recentAlerts.map((alert, index) => (<div key={index} className="p-4 rounded-lg border-l-4 bg-red-50 border-red-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {alert.campaignName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {alert.severity}
                    </span>
                  </div>
                </div>))}
            </div>
          </div>
        </div>)}

      {viewMode === "opportunities" && (<div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Optimization Opportunities
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.opportunities.map((opportunity, index) => (<div key={index} className="p-4 rounded-lg border-l-4 bg-green-50 border-green-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {opportunity.campaignName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {opportunity.recommendation}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Potential Impact: {opportunity.potentialImpact}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {opportunity.type === "scale_up"
                    ? "Scale Up"
                    : "Optimize"}
                    </span>
                  </div>
                </div>))}
            </div>
          </div>
        </div>)}
    </div>);
}
//# sourceMappingURL=CampaignPerformanceDashboard.js.map