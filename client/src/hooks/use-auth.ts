import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

// Types
type LoginInput = z.infer<typeof api.auth.login.input>;
type SignupInput = z.infer<typeof api.auth.signup.input>;
type User = z.infer<typeof api.auth.login.responses[200]>;

// Mock storage for auth persistence in this demo
const AUTH_KEY = "aegis_auth_user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Load user from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setUser(data);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      toast({
        title: "Welcome back",
        description: `Logged in as ${data.fullName}`,
      });
      if (data.role === 'admin') {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupInput) => {
      const res = await fetch(api.auth.signup.path, {
        method: api.auth.signup.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }

      return api.auth.signup.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      setUser(data);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      toast({
        title: "Account Created",
        description: "Welcome to AegisKYC",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setLocation("/login");
    toast({
      title: "Logged out",
      description: "See you next time",
    });
  };

  return {
    user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    logout,
  };
}
