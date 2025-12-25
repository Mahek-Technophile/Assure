import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, ScanFace, FileText, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl text-primary">
            <ShieldCheck className="w-8 h-8" />
            <span>Assure - Your Compliance Assistant
</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white"></div>
        <div className="container mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
              Smarter, Safer <br/>
              <span className="text-primary">Digital Identity Verification</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              An AI-assisted, explainable KYC platform built for modern compliance teams. 
              Verify users faster with bank-grade security and transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Start Verification
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-2">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              title="Document Intelligence"
              description="Automated extraction and validation of government IDs with high accuracy OCR."
            />
            <FeatureCard 
              icon={<ScanFace className="w-6 h-6 text-purple-600" />}
              title="Biometric Consistency"
              description="Advanced liveness detection and face matching to prevent identity fraud."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-green-600" />}
              title="Risk-Based Verification"
              description="Dynamic risk scoring engine that adapts to user signals and behavior."
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6 text-orange-600" />}
              title="Explainable AI"
              description="Transparent decision making with human-readable explanations for every verdict."
            />
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-12 bg-slate-50 border-t mt-auto">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p>© 2025 AegisKYC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 border">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}
