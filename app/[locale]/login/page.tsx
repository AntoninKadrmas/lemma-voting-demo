"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
const LoginPage: FC = () => {
  const pathname = usePathname(); // e.g. "/cz" or "/en"
  const locale = pathname.split("/")[1];
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("credentials", {
      username,
      password,
      callbackUrl: `/${locale}/admin`,
    });
  };

  return (
    <div className=" m-auto max-w-xl flex flex-col gap-5 h-screen justify-center p-4">
      <h1>{lang == "en-US" ? "Login" : "Přihlášení"}</h1>
      <Input
        placeholder={lang == "en-US" ? "username" : "jmeno"}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder={lang == "en-US" ? "password" : "heslo"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin}>
        {lang == "en-US" ? "Login" : "Přihlásit se"}
      </Button>
    </div>
  );
};

export default LoginPage;
