import supabase from "../config/supabase.js";
import { config } from "../config/env.js";

export const uploadToSupabase = async (file) => {
  if (!supabase) throw new Error("Supabase not configured");

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${file.originalname.slice(file.originalname.lastIndexOf("."))}`;

  const { data, error } = await supabase.storage
    .from(config.supabaseBucket)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(config.supabaseBucket)
    .getPublicUrl(data.path);

  return { path: data.path, url: urlData.publicUrl };
};

export const deleteFromSupabase = async (path) => {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.storage
    .from(config.supabaseBucket)
    .remove([path]);

  if (error) throw error;
};
