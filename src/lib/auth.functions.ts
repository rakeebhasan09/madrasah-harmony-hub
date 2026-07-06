import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function serverPublicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

// Public: returns whether any admin account already exists.
export const getAdminExists = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = serverPublicClient();
    const { data, error } = await supabase.rpc("admin_exists");
    if (error) throw new Error(error.message);
    return { exists: Boolean(data) };
  },
);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Public but self-locking: only succeeds while NO admin account exists.
// Creates the admin auth user (password hashed by Supabase Auth) and grants
// the admin role. Once an admin exists this always refuses.
export const registerAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: exists, error: existsError } =
      await supabaseAdmin.rpc("admin_exists");
    if (existsError) throw new Error(existsError.message);
    if (exists) {
      throw new Error("An admin account already exists.");
    }

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Could not create admin account.");
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) {
      // Roll back the orphaned auth user so registration can be retried.
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(roleError.message);
    }

    return { success: true };
  });
