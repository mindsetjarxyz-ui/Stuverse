import { supabase } from '../supabaseClient';

export interface SavedItem {
  id: string;
  user_id: string;
  type: 'summary' | 'voice_note' | 'study_plan';
  title: string;
  content: string;
  file_path?: string;
  created_at: string;
}

export const getSavedItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('saved_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SavedItem[];
};

export const createSavedItem = async (
  userId: string,
  type: 'summary' | 'voice_note' | 'study_plan',
  title: string,
  content: string,
  file_path?: string
) => {
  const { data, error } = await supabase
    .from('saved_items')
    .insert([
      {
        user_id: userId,
        type,
        title,
        content,
        file_path,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as SavedItem;
};

export const updateSavedItem = async (id: string, title: string, content: string) => {
  const { data, error } = await supabase
    .from('saved_items')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedItem;
};

export const deleteSavedItem = async (id: string) => {
  // Fetch the item to get the file_path
  const { data: item, error: fetchError } = await supabase
    .from('saved_items')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the file from Storage if it exists
  if (item?.file_path) {
    const { error: storageError } = await supabase.storage
      .from('app-files')
      .remove([item.file_path]);
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }
  }

  // Delete the item from the database
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
