import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateKycRequest, useUpdateKycRequest, useKycRequests } from "@/hooks/use-kyc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Camera, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function KycFlow() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useLocation();
  const { data: requests } = useKycRequests();
  const { mutateAsync: createKyc } = useCreateKycRequest();
  const { mutateAsync: updateKyc } = useUpdateKycRequest();
  
  // State for form data
  const [docType, setDocType] = useState("passport");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeReqId, setActiveReqId] = useState<number | null>(null);

  // Check if user already has a pending request
  useEffect(() => {
    if (requests && user) {
      const existing = requests.find(r => r.userId === user.id && r.status !== "Completed");
      if (existing) {
        setActiveReqId(existing.id);
        setStep(existing.currentStep || 1);
      }
    }
  }, [requests, user]);

  const handleNext = async () => {
    if (step === 4) {
      // Final submit
      setIsSubmitting(true);
      try {
        if (activeReqId) {
          await updateKyc({
            id: activeReqId,
            status: "Pending Review",
            currentStep: 4,
            confidenceScore: 85, // Mock score
            riskLevel: "Low", // Mock risk
            aiExplanation: "Document matches profile. Liveness check passed with 98% confidence. No sanctions matches found."
          });
        }
        setLocation("/status");
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Creating request on first step completion if doesn't exist
    if (step === 1 && !activeReqId) {
      try {
        const newReq = await createKyc({
          userId: user!.id,
          kycId: `KYC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          status: "In Progress",
          currentStep: 2,
          data: {
            personalInfo: {
              name: user!.fullName,
              email: user!.email,
              phone: "+1234567890", // Mock
              dob: "1990-01-01", // Mock
              address: "123 Main St, City, Country" // Mock
            }
          }
        });
        setActiveReqId(newReq.id);
        setStep(2);
      } catch (e) {
        console.error(e);
      }
    } else if (activeReqId) {
       // Just update step
       await updateKyc({
         id: activeReqId,
         currentStep: step + 1,
         // In a real app, we'd upload files here and get URLs back
         // For mock, we'll update the data object with mock URLs
         data: {
            documents: step === 2 ? { type: docType, frontUrl: "mock_url.jpg", extractedData: { docNumber: "A1234567" } } : undefined,
            biometrics: step === 3 ? { faceScanUrl: "mock_face.jpg", livenessScore: 98 } : undefined,
         }
       });
       setStep(step + 1);
    }
  };

  const steps = [
    { num: 1, title: "Personal Info" },
    { num: 2, title: "Documents" },
    { num: 3, title: "Face Scan" },
    { num: 4, title: "Review" }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Progress Bar */}
      <div className="mb-10">
         <div className="flex justify-between mb-2">
            {steps.map((s) => (
              <div key={s.num} className={cn(
                "flex flex-col items-center gap-2",
                step >= s.num ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
                  step >= s.num ? "bg-primary text-white border-primary" : "bg-white border-slate-200"
                )}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.title}</span>
              </div>
            ))}
         </div>
         <Progress value={(step / 4) * 100} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-t-4 border-t-primary shadow-lg">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Verify Personal Information</CardTitle>
                  <CardDescription>Confirm your details before proceeding. These match your registration data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={user?.fullName} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={user?.email} disabled className="bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input defaultValue="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input type="date" defaultValue="1995-01-01" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Residential Address</Label>
                    <Input defaultValue="123 Tech Park, Innovation Street" />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Documents */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Upload Identity Document</CardTitle>
                  <CardDescription>We'll use AI to verify the authenticity of your ID.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Document Type</Label>
                    <Select value={docType} onValueChange={setDocType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="dl">Driver's License</SelectItem>
                        <SelectItem value="id_card">National ID Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                     <input 
                       type="file" 
                       className="absolute inset-0 opacity-0 cursor-pointer"
                       onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                     />
                     <div className="flex flex-col items-center gap-2">
                       <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                         <Upload className="w-8 h-8" />
                       </div>
                       <h3 className="font-medium">
                         {docFile ? docFile.name : "Upload Front of Document"}
                       </h3>
                       <p className="text-sm text-muted-foreground">JPG, PNG or PDF (Max 5MB)</p>
                     </div>
                  </div>

                  {docFile && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 text-sm">AI Analysis Complete</p>
                          <p className="text-green-700 text-xs mt-1">
                            Document detected: {docType.toUpperCase()}. Text is clear and legible.
                          </p>
                        </div>
                     </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 3: Biometrics */}
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Face Verification</CardTitle>
                  <CardDescription>Let's make sure it's really you. Position your face in the frame.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                  <div className="w-64 h-64 bg-slate-100 rounded-full overflow-hidden relative border-4 border-slate-200 flex items-center justify-center">
                    {selfieFile ? (
                      <img src={URL.createObjectURL(selfieFile)} className="w-full h-full object-cover" alt="Selfie" />
                    ) : (
                      <Camera className="w-16 h-16 text-slate-300" />
                    )}
                    
                    {/* Mock Scanner Overlay */}
                    {!selfieFile && (
                        <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <Button variant="outline" className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                      />
                      <Camera className="w-4 h-4 mr-2" />
                      Take Photo / Upload
                    </Button>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Ensure good lighting and no accessories (glasses, masks).
                    </p>
                  </div>

                  {selfieFile && (
                     <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800 text-sm">Liveness Confirmed</p>
                          <p className="text-green-700 text-xs mt-1">
                            Face matches document photo with 98% confidence.
                          </p>
                        </div>
                     </div>
                  )}
                </CardContent>
              </>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Final Review</CardTitle>
                  <CardDescription>Review your signals before submitting for final verification.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3 text-sm">
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Full Name</span>
                        <span className="font-medium">{user?.fullName}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Document Type</span>
                        <span className="font-medium uppercase">{docType}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Verification Status</span>
                        <span className="text-green-600 font-medium">Pre-Check Passed</span>
                     </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <p>
                      By submitting, you consent to the processing of your biometric data for identity verification purposes. 
                      Your data is encrypted and secure.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between bg-slate-50/50 p-6">
              <Button 
                variant="ghost" 
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {step === 4 ? "Submit Application" : "Continue"}
                {!isSubmitting && step !== 4 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
