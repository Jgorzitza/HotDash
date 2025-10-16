# Approvals UI Rollback Plan

## Rollback Triggers
- UI crashes or becomes unresponsive
- Approval actions fail consistently
- Data integrity issues detected

## Rollback Steps
1. Revert to previous deployment via git revert
2. Clear browser cache and localStorage
3. Verify fixtures load correctly
4. Test approve/reject actions in dev mode
5. Monitor error logs for 24 hours

## Recovery Time
- Estimated: 15 minutes
- Maximum: 1 hour

## Validation
- All tiles load within 3s
- Drawer opens/closes smoothly
- Approve/reject actions complete successfully
