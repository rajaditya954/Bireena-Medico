import supabase from "../config/supabase.js";
import { config } from "../config/env.js";

const BUCKET = config.supabaseBucket || "lab-reports";

export const uploadToLocal = async (file, folder = "misc") => {
  if (!supabase) throw new Error("Supabase not configured");

  const ext = file.originalname.slice(file.originalname.lastIndexOf("."));
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return { path: filePath, url: urlData.publicUrl };
};

export const deleteFromLocal = async (filePath) => {
  if (!supabase) return;

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) console.error("[deleteFromLocal] Supabase delete error:", error.message);
};
