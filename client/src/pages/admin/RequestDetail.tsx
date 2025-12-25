import { useRoute } from "wouter";
import { useKycRequest, useUpdateKycRequest } from "@/hooks/use-kyc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Fingerprint, Globe, Smartphone } from "lucide-react";
import { Link } from "wouter";

export default function RequestDetail() {
  const [, params] = useRoute("/admin/kyc/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: request } = useKycRequest(id);
  const { mutateAsync: updateStatus } = useUpdateKycRequest();

  if (!request) return <div>Loading...</div>;

  const handleAction = async (status: string) => {
    await updateStatus({ 
      id: request.id, 
      status,
      // For approval, assume risk is low
      riskLevel: status === 'Verified' ? 'Low' : request.riskLevel
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/admin">
        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{request.kycId}</h1>
          <div className="flex items-center gap-3 text-slate-500">
             <span>Submitted on {new Date(request.createdAt!).toLocaleDateString()}</span>
             <span>•</span>
             <span>Confidence Score: <span className="font-bold text-slate-900">{request.confidenceScore}%</span></span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="destructive" onClick={() => handleAction("Rejected")}>
            <XCircle className="w-4 h-4 mr-2" /> Reject
          </Button>
          <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={() => handleAction("Needs Review")}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Flag for Review
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction("Verified")}>
            <CheckCircle className="w-4 h-4 mr-2" /> Approve
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-t-4 border-t-primary">
             <CardHeader>
               <CardTitle>AI Risk Analysis</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                 <p className="leading-relaxed text-slate-700">
                   {request.aiExplanation || "AI analysis pending..."}
                 </p>
               </div>
               <div className="grid grid-cols-3 gap-4 text-center">
                 <div className="p-4 rounded-lg border bg-white">
                   <div className="text-sm text-slate-500 mb-1">Face Match</div>
                   <div className="text-lg font-bold text-green-600">98%</div>
                 </div>
                 <div className="p-4 rounded-lg border bg-white">
                   <div className="text-sm text-slate-500 mb-1">Doc Authenticity</div>
                   <div className="text-lg font-bold text-green-600">High</div>
                 </div>
                 <div className="p-4 rounded-lg border bg-white">
                   <div className="text-sm text-slate-500 mb-1">Watchlist Hit</div>
                   <div className="text-lg font-bold text-slate-900">None</div>
                 </div>
               </div>
             </CardContent>
           </Card>

           <Tabs defaultValue="doc" className="w-full">
             <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="doc">Document Data</TabsTrigger>
               <TabsTrigger value="signals">Digital Signals</TabsTrigger>
               <TabsTrigger value="raw">Raw JSON</TabsTrigger>
             </TabsList>
             <TabsContent value="doc">
               <Card>
                 <CardContent className="pt-6">
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                         <dt className="text-slate-500">Document Type</dt>
                         <dd className="font-medium uppercase">{request.data?.documents?.type || "N/A"}</dd>
                       </div>
                       <div>
                         <dt className="text-slate-500">Document Number</dt>
                         <dd className="font-medium">{request.data?.documents?.extractedData?.docNumber || "********"}</dd>
                       </div>
                       <div className="col-span-2">
                         <dt className="text-slate-500 mb-2">Images</dt>
                         <dd className="grid grid-cols-2 gap-4">
                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border text-slate-400">
                               Front Image
                            </div>
                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border text-slate-400">
                               Back Image
                            </div>
                         </dd>
                       </div>
                    </dl>
                 </CardContent>
               </Card>
             </TabsContent>
             <TabsContent value="signals">
               <Card>
                 <CardContent className="pt-6 space-y-4">
                   <div className="flex items-center gap-3">
                     <Smartphone className="w-5 h-5 text-slate-400" />
                     <div>
                       <p className="font-medium">Device Fingerprint</p>
                       <p className="text-sm text-slate-500">iPhone 13 Pro, iOS 16.4</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Globe className="w-5 h-5 text-slate-400" />
                     <div>
                       <p className="font-medium">IP Reputation</p>
                       <p className="text-sm text-slate-500">Residential ISP (Clean)</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Fingerprint className="w-5 h-5 text-slate-400" />
                     <div>
                       <p className="font-medium">Behavioral Biometrics</p>
                       <p className="text-sm text-slate-500">Consistent typing cadence detected</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
             <TabsContent value="raw">
               <Card>
                 <CardContent className="pt-6">
                   <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                     {JSON.stringify(request.data, null, 2)}
                   </pre>
                 </CardContent>
               </Card>
             </TabsContent>
           </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applicant Details</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4 text-sm">
                 <div>
                   <label className="text-slate-500 block mb-1">Full Name</label>
                   <div className="font-medium">{request.data?.personalInfo?.name || "Unknown"}</div>
                 </div>
                 <div>
                   <label className="text-slate-500 block mb-1">Email</label>
                   <div className="font-medium">{request.data?.personalInfo?.email || "Unknown"}</div>
                 </div>
                 <div>
                   <label className="text-slate-500 block mb-1">Phone</label>
                   <div className="font-medium">{request.data?.personalInfo?.phone || "Unknown"}</div>
                 </div>
                 <div>
                   <label className="text-slate-500 block mb-1">Address</label>
                   <div className="font-medium">{request.data?.personalInfo?.address || "Unknown"}</div>
                 </div>
               </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
             <CardContent className="p-4">
               <p className="text-xs text-slate-500 text-center">
                 This decision is supported by AI but requires human oversight. Ensure all compliance protocols are followed.
               </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
