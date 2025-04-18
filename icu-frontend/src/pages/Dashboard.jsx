import React from 'react';
import PatientGrid from '../components/dashboard/PatientGrid';
import AlertsFeed from '../components/dashboard/AlertsFeed';
import AnalyticsSummary from '../components/dashboard/AnalyticsSummary';
import PriorityList from '../components/dashboard/PriorityList';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Overview Grid */}
          <PatientGrid />
          
          {/* Analytics Summary */}
          <AnalyticsSummary />
        </div>
        
        {/* Right column - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Priority Patient List */}
          <PriorityList />
          
          {/* Alerts Feed */}
          <AlertsFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;