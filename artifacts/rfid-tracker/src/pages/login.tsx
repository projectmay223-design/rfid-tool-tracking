import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanLine, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err?.data?.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    });
  };

  const onRegister = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => {
        setAuth(res.token, res.user);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          title: "Registration failed",
          description: err?.data?.error || "Could not register",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4 shadow-lg">
          <ScanLine className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">RFID SYS-TRACK</h1>
        <p className="text-muted-foreground mt-2">Operational Asset Management</p>
      </div>

      <div className="w-full max-w-md bg-card border-t-4 border-t-secondary border-x border-b shadow-xl rounded-sm p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">AUTHENTICATE</TabsTrigger>
            <TabsTrigger value="register">REGISTER</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Operator Email</Label>
                <Input id="email" type="email" placeholder="ops@warehouse.com" {...loginForm.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passcode</Label>
                <Input id="password" type="password" {...loginForm.register("password")} />
              </div>
              <Button type="submit" className="w-full font-bold tracking-wide" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                ENGAGE
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Operator Name</Label>
                <Input id="reg-name" placeholder="John Doe" {...registerForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Operator Email</Label>
                <Input id="reg-email" type="email" placeholder="ops@warehouse.com" {...registerForm.register("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Passcode</Label>
                <Input id="reg-password" type="password" {...registerForm.register("password")} />
              </div>
              <Button type="submit" className="w-full font-bold tracking-wide" disabled={registerMutation.isPending}>
                {registerMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                INITIALIZE
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
