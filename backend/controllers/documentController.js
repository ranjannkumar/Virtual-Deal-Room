const Document = require('../models/Document');

// Upload Document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { dealId, allowedUsers } = req.body;

    const document = await Document.create({
      dealId,
      uploadedBy: req.user.id,
      fileUrl: req.file.location,
      allowedUsers: allowedUsers ? JSON.parse(allowedUsers) : [],
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Document upload failed', error });
  }
};

// Get Documents for a Deal
exports.getDocuments = async (req, res) => {
  try {
    const { dealId } = req.params;
    const documents = await Document.find({ dealId });

    const filteredDocuments = documents.filter(doc =>
      doc.uploadedBy.toString() === req.user.id || doc.allowedUsers.includes(req.user.id)
    );

    res.json(filteredDocuments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error });
  }
};

// Grant Access to a User
exports.grantAccess = async (req, res) => {
  try {
    const { documentId, userId } = req.body;
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can grant access' });
    }

    if (!document.allowedUsers.includes(userId)) {
      document.allowedUsers.push(userId);
      await document.save();
    }

    res.json({ message: 'Access granted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to grant access', error });
  }
};
