import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React from "react";
import useAuth from "../../hooks/useAuth";

import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import { login, register } from "../../services/public";
import { createUserAdapter } from "../../adapters/user";
import { useState } from "react";

const LoginFormulario = () => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [newUser, setNewUser] = useState(false);
  const { setUserData } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const result = await callEndpoint(
      login(data.get("email"), data.get("password"))
    );

    console.log(result);
    if (!result || Object.keys(result)?.length === 0) {
      return;
    } else {
      setUserData(createUserAdapter(result));
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline">
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginFormulario;
