'use client';

export default function MetricCard({ title, value, icon: Icon, color, bg, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="bg-gray-100 p-3 rounded-xl h-12 w-12"></div>
          <div className="bg-gray-50 h-5 w-12 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="bg-gray-100 h-4 w-24 rounded"></div>
          <div className="bg-gray-200 h-8 w-16 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`${bg} p-3 rounded-xl`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

