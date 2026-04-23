import { Router } from 'express';
import { getAuditLogs, getGovernanceDashboard, submitWorkflowAction } from '../controllers/governanceController.js';
import { authRequired, permissionRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);
router.get('/dashboard', permissionRequired('governance:dashboard:view'), getGovernanceDashboard);
router.get('/audit-logs', permissionRequired('audit_logs:view'), getAuditLogs);
router.post('/workflow/action', permissionRequired('recommendations:approve'), submitWorkflowAction);

export default router;
