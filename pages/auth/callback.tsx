import type { GetServerSidePropsContext } from "next";
import { supabaseServerClient } from "@/lib/supabase/server";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabase = supabaseServerClient(ctx);

  const next = (() => {
    const n = ctx.query.next;
    return typeof n === "string" && n.startsWith("/") ? n : "/";
  })();

  // Supabase will return `code` for PKCE/OAuth/magic-link flows.
  const code = ctx.query.code;
  if (typeof code === "string") {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return {
        redirect: {
          destination: `/login?next=${encodeURIComponent(
            next
          )}&error=callback_failed`,
          permanent: false,
        },
      };
    }
  }

  return {
    redirect: {
      destination: next,
      permanent: false,
    },
  };
}

export default function AuthCallbackPage() {
  return null;
}
