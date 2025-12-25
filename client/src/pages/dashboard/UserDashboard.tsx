import { useAuth } from "@/hooks/use-auth";
import { useKycRequests } from "@/hooks/use-kyc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Shield, FileCheck, Lock, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useKycRequests();

  // Find the latest active request for this user
  const latestRequest = requests?.find(r => r.userId === user?.id);
  const status = latestRequest?.status || "Not Started";
  const hasActiveRequest = !!latestRequest;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.fullName}</h1>
        <p className="text-slate-500">Manage your identity verification and security settings.</p>
      </div>

      {/* Main Status Card */}
      <div className="mb-8">
        <Card className="border-l-4 border-l-primary shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Shield className="w-32 h-32" />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-500 mb-1 uppercase tracking-wider">KYC Status</h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900">{status}</span>
                  <StatusBadge status={status} className="text-sm px-3 py-1" />
                </div>
                <p className="text-slate-500 mt-2 max-w-lg">
                  {status === "Not Started" && "Complete your identity verification to unlock full platform access."}
                  {status === "In Progress" && "Your verification is currently being processed. Please complete any remaining steps."}
                  {status === "Verified" && "Your identity has been successfully verified. You have full access."}
                  {status === "Needs Review" && "We need some additional information to complete your verification."}
                </p>
              </div>
              
              {!hasActiveRequest || status === "In Progress" ? (
                <Link href={hasActiveRequest ? `/kyc?id=${latestRequest.id}` : "/kyc"}>
                  <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-lg shadow-primary/20">
                    {hasActiveRequest ? "Continue Application" : "Start Verification"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/status">
                   <Button variant="outline" size="lg">View Details</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestRequest?.data?.documents ? "1 Uploaded" : "0 Uploaded"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Passport / National ID
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {latestRequest?.confidenceScore ? `${latestRequest.confidenceScore}/100` : "--"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI-Calculated Confidence
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AES-256</div>
            <p className="text-xs text-muted-foreground mt-1">
              End-to-end Encryption Active
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Feed placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {hasActiveRequest ? (
               <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg">
                 <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1">
                   <Clock className="w-4 h-4" />
                 </div>
                 <div>
                   <p className="font-medium text-sm">KYC Application Updated</p>
                   <p className="text-xs text-muted-foreground">Request ID: {latestRequest.kycId}</p>
                   <p className="text-xs text-slate-500 mt-1">Status changed to {latestRequest.status}</p>
                 </div>
                 <div className="ml-auto text-xs text-muted-foreground">
                   {new Date(latestRequest.updatedAt!).toLocaleDateString()}
                 </div>
               </div>
             ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500 italic">
                  <AlertCircle className="w-4 h-4" /> No recent activity found.
                </div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
