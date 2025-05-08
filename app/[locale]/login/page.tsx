"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAIL_LOCALES, AvailableLocales } from "@/lib/constants";
import { signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

const LoginPage: FC = () => {
  const pathname = usePathname(); // e.g. "/cz" or "/en"
  const locale = pathname.split("/")[1];
  const lang = (AVAIL_LOCALES.find((x) => x.startsWith(locale ?? "")) ??
    "cz-CZ") as AvailableLocales;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await signIn("credentials", {
      username: values.username,
      password: values.password,
      callbackUrl: `/${locale}/admin`,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" m-auto max-w-xl flex flex-col gap-5 h-screen justify-center p-4 space-y-8"
      >
        <p className="text-5xl font-bold">
          {lang == "en-US" ? "Login" : "Přihlášení"}
        </p>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang == "en-US" ? "Username" : "Jmeno"}</FormLabel>
              <FormControl>
                <Input
                  placeholder={lang == "en-US" ? "JohnDoe" : "JanNovak"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {lang == "en-US"
                  ? "This name to identify yourself with."
                  : "Tot je tvoje jmeno pro přihlášení."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang == "en-US" ? "Password" : "Heslo"}</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                {lang == "en-US"
                  ? "This is your password to login with."
                  : "Tot je tvoje heslo pro přihlášení."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {lang == "en-US" ? "Login" : "Přihlásit se"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginPage;
