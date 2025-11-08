-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_delete_post_attachment_storage ON post_attachments;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS delete_post_attachment_storage();

-- Create the updated function
CREATE OR REPLACE FUNCTION delete_post_attachment_storage()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    path_parts text[];
    storage_path text;
BEGIN
    -- Get the path after 'post-attachments/' in the URL
    path_parts := string_to_array(OLD.file_url, '/');
    
    -- Find the position of 'post-attachments' in the array
    FOR i IN 1..array_length(path_parts, 1) LOOP
        IF path_parts[i] = 'post-attachments' AND i < array_length(path_parts, 1) THEN
            -- Join all parts after 'post-attachments' to form the storage path
            storage_path := array_to_string(path_parts[i+1:array_length(path_parts, 1)], '/');
            EXIT;
        END IF;
    END LOOP;

    -- Only attempt to delete if we found a valid storage path
    IF storage_path IS NOT NULL THEN
        BEGIN
            DELETE FROM storage.objects
            WHERE bucket_id = 'post-attachments'
            AND name = storage_path;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Failed to delete file from storage: %', SQLERRM;
        END;
    END IF;

    RETURN OLD;
END;
$$;

-- Create the trigger
CREATE TRIGGER trigger_delete_post_attachment_storage
    AFTER DELETE ON post_attachments
    FOR EACH ROW
    EXECUTE FUNCTION delete_post_attachment_storage();