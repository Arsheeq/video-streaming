import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMovies } from "@/lib/store";
import { Film, HardDrive, Activity, Users } from "lucide-react";

export default function AdminDashboard() {
  const { movies, awsConfig } = useMovies();

  const stats = [
    { title: "Total Videos", value: movies.length, icon: Film, color: "text-blue-500" },
    { title: "Storage Used", value: "45.2 GB", icon: HardDrive, color: "text-purple-500" },
    { title: "Active Streams", value: "128", icon: Activity, color: "text-green-500" },
    { title: "Total Users", value: "1,204", icon: Users, color: "text-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of your streaming platform.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-200">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">New video uploaded</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Success</span>
                   </div>
                 ))}
               </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-300">S3 Bucket Connection</span>
                 <span className="flex items-center gap-2 text-xs text-green-400">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   Connected: {awsConfig.bucketName}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-300">MediaConvert Job Queue</span>
                 <span className="flex items-center gap-2 text-xs text-green-400">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   Idle
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-300">CloudFront Distribution</span>
                 <span className="flex items-center gap-2 text-xs text-green-400">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   Active
                 </span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
