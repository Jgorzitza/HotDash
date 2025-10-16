/**
 * Conversion Funnels Dashboard
 * 
 * Visualize conversion funnels and identify drop-off points.
 */


import { useLoaderData } from 'react-router';
import { getEcommerceFunnel, identifyDropOffPoints, calculateOptimizationOpportunities } from '../lib/analytics/funnels';

export async function loader({ request }: any) {
  try {
    const funnelData = await getEcommerceFunnel();
    const dropOffs = identifyDropOffPoints(funnelData);
    const opportunities = calculateOptimizationOpportunities(funnelData);

    return Response.json({
      success: true, 
      data: { funnel: funnelData, dropOffs, opportunities } 
    });
  } catch (error: any) {
    console.error('[Funnels Dashboard] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export default function FunnelsDashboard() {
  const { success, data, error } = useLoaderData<typeof loader>();

  if (!success || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Conversion Funnels</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error loading funnel data: {error}</p>
        </div>
      </div>
    );
  }

  const { funnel, dropOffs, opportunities } = data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Conversion Funnels</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{funnel.totalUsers.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold">{funnel.completionRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completed</h3>
          <p className="text-3xl font-bold">
            {funnel.steps[funnel.steps.length - 1]?.users.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-6">{funnel.name}</h2>
        
        <div className="space-y-4">
          {funnel.steps.map((step, index) => {
            const width = funnel.totalUsers > 0 
              ? (step.users / funnel.totalUsers) * 100 
              : 0;
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      {index + 1}. {step.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {step.users.toLocaleString()} users
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {step.conversionRate.toFixed(1)}%
                  </span>
                </div>
                
                <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {step.users.toLocaleString()} users ({step.conversionRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                
                {index < funnel.steps.length - 1 && step.dropOffRate > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    ↓ {step.dropOffRate.toFixed(1)}% drop-off to next step
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Biggest Drop-off Points</h2>
        
        <div className="space-y-3">
          {dropOffs.slice(0, 3).map((dropOff, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded">
              <div>
                <p className="font-medium text-gray-900">{dropOff.step}</p>
                <p className="text-sm text-gray-600">
                  {dropOff.usersLost.toLocaleString()} users lost
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">
                  {dropOff.dropOffRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">drop-off rate</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Optimization Opportunities</h2>
        
        <div className="space-y-4">
          {opportunities.map((opp, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  opp.priority === 'high' ? 'bg-red-100 text-red-800' :
                  opp.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {opp.priority.toUpperCase()}
                </span>
                <span className="font-medium text-gray-900">{opp.step}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Potential gain: {opp.potentialGain.toLocaleString()} users
              </p>
              <p className="text-sm text-gray-700">
                💡 {opp.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

