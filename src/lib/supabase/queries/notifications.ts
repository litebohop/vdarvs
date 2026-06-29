import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/entities.types";
import { mapNotification, type DbNotification } from "@/lib/supabase/mappers";

export async function insertNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: Notification["type"];
  href?: string;
}): Promise<Notification> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "info",
      href: input.href ?? null,
      read: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapNotification(data as DbNotification);
}
