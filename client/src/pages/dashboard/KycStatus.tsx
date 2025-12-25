import { useAuth } from "@/hooks/use-auth";
import { useKycRequests } from "@/hooks/use-kyc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Clock, Circle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KycStatus() {
  const { user } = useAuth();
  const { data: requests } = useKycRequests();
  const request = requests?.find(r => r.userId === user?.id);

  if (!request) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-xl font-bold">No Application Found</h2>
        <p className="text-muted-foreground">Please start a new verification.</p>
      </div>
    );
  }

  const timeline = [
    { title: "Application Submitted", status: "completed", date: request.createdAt },
    { title: "Document Analysis", status: "completed", desc: "ID Verified successfully" },
    { title: "Biometric Check", status: "completed", desc: "Liveness confirmed" },
    { title: "Risk Assessment", status: "completed", desc: "Low risk profile detected" },
    { title: "Final Compliance Review", status: request.status === "Pending Review" ? "current" : "pending", desc: "Compliance officer reviewing" }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 border-l-4 border-l-blue-500 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">Application ID: {request.kycId}</p>
               <CardTitle className="text-2xl">Verification Status</CardTitle>
             </div>
             <StatusBadge status={request.status} className="text-base px-4 py-1.5" />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 relative pl-6 border-l-2 border-slate-100 ml-4">
            {timeline.map((item, i) => (
              <div key={i} className="relative">
                <div className={cn(
                  "absolute -left-[31px] bg-white p-1 rounded-full border-2",
                  item.status === "completed" ? "border-green-500 text-green-500" :
                  item.status === "current" ? "border-blue-500 text-blue-500" : "border-slate-200 text-slate-300"
                )}>
                  {item.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : 
                   item.status === "current" ? <Clock className="w-5 h-5 animate-pulse" /> :
                   <Circle className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-4 rounded-lg border transition-colors",
                  item.status === "current" ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100"
                )}>
                  <h3 className={cn("font-semibold", item.status === "current" && "text-blue-800")}>{item.title}</h3>
                  {item.desc && <p className="text-sm text-slate-500 mt-1">{item.desc}</p>}
                  {item.date && (
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* AI Explanation Box */}
      {request.aiExplanation && (
        <Card className="mt-8 bg-slate-900 text-slate-50 border-none shadow-xl">
           <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">AI Analysis Summary</CardTitle>
              </div>
           </CardHeader>
           <CardContent>
             <p className="leading-relaxed text-slate-300">
               {request.aiExplanation}
             </p>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
