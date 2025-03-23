import { useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Extend the user schema for registration with additional fields
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters",
  }),
  phoneNumber: z.string().min(10, {
    message: "Valid phone number is required",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
    },
  });

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onRegisterSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 bg-primary p-6 flex flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Ease Up</h1>
            <p className="text-xl opacity-90">Connecting you to reliable help for your everyday needs</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-4">
                <span className="material-icons">cleaning_services</span>
              </div>
              <div>
                <h3 className="text-xl font-medium">Household Tasks</h3>
                <p>Get help with cleaning, cooking, and everyday chores</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-4">
                <span className="material-icons">yard</span>
              </div>
              <div>
                <h3 className="text-xl font-medium">Yard & Home Maintenance</h3>
                <p>Lawn care, gardening, and home upkeep assistance</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-4">
                <span className="material-icons">shopping_basket</span>
              </div>
              <div>
                <h3 className="text-xl font-medium">Grocery Shopping</h3>
                <p>Shopping and delivery services for food and essentials</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/20 rounded-full p-2 mr-4">
                <span className="material-icons">health_and_safety</span>
              </div>
              <div>
                <h3 className="text-xl font-medium">Caregiver Support</h3>
                <p>Professional caregivers for personal care and companionship</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-lg">
              Sign in or create an account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="text-lg py-3">Login</TabsTrigger>
                <TabsTrigger value="register" className="text-lg py-3">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full text-lg py-6" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Create a username" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormDescription className="text-base">
                            Must be at least 6 characters
                          </FormDescription>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Enter your phone number" className="text-lg py-6" {...field} />
                          </FormControl>
                          <FormMessage className="text-base" />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full text-lg py-6" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-muted-foreground mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
