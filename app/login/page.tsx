"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (!isMounted) return null;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
          Välkommen till Filmtorget!
        </h1>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#2563eb",
                  brandAccent: "#1d4ed8",
                },
              },
            },
            className: {
              button: "rounded-full px-4 py-2",
              input: "rounded-lg border-slate-300",
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "E-postadress",
                password_label: "Lösenord",
                button_label: "Logga in",
              },
              sign_up: {
                email_label: "E-postadress",
                password_label: "Välj ett lösenord",
                button_label: "Skapa konto",
                link_text: "Har du inget konto? Registrera dig! :)",
              },
            },
          }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
}
