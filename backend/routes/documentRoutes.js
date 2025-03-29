const express = require('express');
const upload = require('../config/s3');
const { uploadDocument, getDocuments, grantAccess } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadDocument);
router.get('/:dealId', authMiddleware, getDocuments);
router.put('/grant-access', authMiddleware, grantAccess);

module.exports = router;
