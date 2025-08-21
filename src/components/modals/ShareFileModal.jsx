router.delete('/files/:fileId/share-link/:token', authMiddleware, async (req, res) => {
  try {
    const { fileId, token } = req.params;
    const user = req.user;

    console.log("Remove share request - fileId:", fileId, "token:", token, "Timestamp:", new Date().toISOString());

    // Validate fileId
    if (!fileId || fileId === "undefined") {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    // Check if the file exists and belongs to the user
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .eq('is_deleted', false)
      .single();
    if (fileError || !file) {
      return res.status(404).json({ error: 'File not found or inaccessible' });
    }

    // Delete the share link
    const { data, error } = await supabase
      .from('shared_urls')
      .delete()
      .eq('token', token)
      .eq('file_id', fileId)
      .eq('owner_id', user.id)
      .single();
    if (error) {
      console.error("Remove share error:", error.message);
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: 'Share link not found or not authorized' });
    }

    res.json({ success: true, message: 'Share link revoked' });
  } catch (err) {
    console.error('Remove share error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});