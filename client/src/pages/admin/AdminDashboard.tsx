import { useAdminStats } from "@/hooks/use-admin";
import { useKycRequests } from "@/hooks/use-kyc";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Users, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: requests } = useKycRequests();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Compliance Overview</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Requests" value={stats?.total || 0} icon={<Users className="w-5 h-5 text-blue-600" />} />
        <StatCard title="Approved" value={stats?.approved || 0} icon={<CheckCircle className="w-5 h-5 text-green-600" />} />
        <StatCard title="Pending Review" value={stats?.reviewRequired || 0} icon={<AlertCircle className="w-5 h-5 text-amber-600" />} />
        <StatCard title="Auto-Processed" value={stats?.pending || 0} icon={<Clock className="w-5 h-5 text-purple-600" />} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={stats?.riskDistribution}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {stats?.riskDistribution.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.requestsOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent KYC Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Risk Level</th>
                  <th className="px-6 py-3">Confidence</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests?.slice(0, 5).map((req) => (
                  <tr key={req.id} className="border-b hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{req.kycId}</td>
                    <td className="px-6 py-4">User #{req.userId}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.riskLevel || "Low"} className="bg-transparent border-0 px-0" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${req.confidenceScore}%` }} 
                          />
                        </div>
                        <span className="text-xs">{req.confidenceScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/kyc/${req.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-slate-50 rounded-full">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
