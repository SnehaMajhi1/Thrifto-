const express = require('express');
const { createReport, getReports, resolveReport } = require('../controllers/reportController');
const { auth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');

const router = express.Router();

router.use(auth);

router.post('/', createReport);
router.get('/', requireRole('admin'), getReports);
router.patch('/:id/resolve', requireRole('admin'), resolveReport);

module.exports = router;
