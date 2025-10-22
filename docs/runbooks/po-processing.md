# Purchase Order (PO) Processing Runbook

## Overview
This runbook covers the complete purchase order lifecycle from creation through reconciliation, ensuring proper documentation, approval, and tracking of all procurement activities.

## Prerequisites
- Approved vendor in system
- Valid purchase requisition
- Budget approval (if required)
- Manager authorization (if above threshold)

## PO Processing Workflow

### Phase 1: PO Creation

#### Step 1: Requisition Review
- [ ] **Verify purchase requisition**:
  - Item descriptions and quantities
  - Vendor selection and pricing
  - Delivery requirements and dates
  - Budget allocation and approval
- [ ] **Check vendor status** (active, payment terms, credit limit)
- [ ] **Validate pricing** against contracts or market rates

#### Step 2: PO Generation
- [ ] **Create PO in system**:
  - Generate unique PO number
  - Enter vendor information
  - Add line items with descriptions
  - Set delivery dates and terms
- [ ] **Apply appropriate terms**:
  - Payment terms (Net 30, Net 15, etc.)
  - Shipping terms (FOB, CIF, etc.)
  - Quality requirements
- [ ] **Add special instructions** or requirements

#### Step 3: Approval Process
- [ ] **Route for approval** based on amount:
  - Under $1,000: Manager approval
  - $1,000-$10,000: Director approval
  - Over $10,000: Executive approval
- [ ] **Document approval** with signatures and dates
- [ ] **Verify budget availability** before final approval

### Phase 2: PO Transmission

#### Step 4: Send to Vendor
- [ ] **Transmit PO to vendor** via approved method:
  - Email with PDF attachment
  - Vendor portal upload
  - EDI transmission (if configured)
- [ ] **Confirm receipt** with vendor
- [ ] **Set up tracking** for delivery confirmation

#### Step 5: Vendor Acknowledgment
- [ ] **Receive vendor acknowledgment**:
  - Confirmation of order acceptance
  - Delivery date confirmation
  - Any changes or exceptions noted
- [ ] **Update PO status** to "Acknowledged"
- [ ] **Notify requesting department** of confirmed delivery date

### Phase 3: Receiving Process

#### Step 6: Delivery Monitoring
- [ ] **Track shipment status**:
  - Monitor delivery progress
  - Receive shipping notifications
  - Update stakeholders on status
- [ ] **Prepare receiving area** for expected delivery
- [ ] **Schedule receiving personnel** if needed

#### Step 7: Goods Receipt
- [ ] **Inspect delivered items**:
  - Verify quantities against PO
  - Check item descriptions and specifications
  - Inspect for damage or defects
- [ ] **Document receiving**:
  - Complete receiving report
  - Note any discrepancies
  - Take photos of damaged items (if any)
- [ ] **Update inventory system** with received quantities

### Phase 4: Reconciliation

#### Step 8: Invoice Processing
- [ ] **Receive vendor invoice**:
  - Match invoice to PO number
  - Verify pricing and quantities
  - Check for additional charges
- [ ] **Three-way matching**:
  - PO vs. Invoice vs. Receiving Report
  - Identify and resolve discrepancies
- [ ] **Approve for payment** if all items match

#### Step 9: Payment Processing
- [ ] **Process payment** according to terms:
  - Schedule payment date
  - Prepare payment documentation
  - Execute payment via approved method
- [ ] **Update PO status** to "Closed"
- [ ] **File all documentation** in vendor file

#### Step 10: Final Reconciliation
- [ ] **Complete PO reconciliation**:
  - Verify all line items received
  - Confirm all payments made
  - Close any open items
- [ ] **Update vendor performance** metrics
- [ ] **Archive PO documentation**

## Quality Control Checkpoints

### Receiving Quality Checks
- [ ] **Physical inspection** of all items
- [ ] **Documentation verification** (certificates, warranties)
- [ ] **Compliance verification** (safety, environmental standards)
- [ ] **Performance testing** (if applicable)

### Financial Controls
- [ ] **Budget verification** before PO creation
- [ ] **Approval limits** compliance
- [ ] **Three-way matching** accuracy
- [ ] **Payment authorization** verification

## Exception Handling

### Common Discrepancies
- **Quantity variances**: Document and notify vendor
- **Quality issues**: Initiate return/replacement process
- **Pricing differences**: Verify against contracts
- **Delivery delays**: Update stakeholders and reschedule

### Resolution Process
1. **Identify discrepancy** and document details
2. **Notify vendor** of issue within 24 hours
3. **Escalate to manager** if not resolved in 48 hours
4. **Document resolution** and update procedures if needed

## Performance Metrics

### Key Performance Indicators
- **PO cycle time**: Creation to delivery
- **First-time match rate**: PO/Invoice/Receipt alignment
- **Vendor performance**: On-time delivery, quality
- **Cost accuracy**: Budget vs. actual spending

### Reporting Requirements
- [ ] **Weekly PO status report** to management
- [ ] **Monthly vendor performance** review
- [ ] **Quarterly process improvement** analysis
- [ ] **Annual vendor evaluation** updates

## System Integration Points

### Required System Updates
- **Inventory system**: Update stock levels
- **Financial system**: Record liabilities and payments
- **Vendor management**: Update performance metrics
- **Reporting system**: Generate analytics and reports

### Data Quality Requirements
- [ ] **Accurate vendor information** maintenance
- [ ] **Current pricing data** updates
- [ ] **Real-time inventory** synchronization
- [ ] **Complete audit trail** documentation

## Troubleshooting Guide

### System Issues
- **PO generation failures**: Check vendor master data
- **Approval routing problems**: Verify approval matrix
- **Integration errors**: Contact IT support
- **Reporting discrepancies**: Review data mapping

### Process Issues
- **Missing approvals**: Escalate to appropriate level
- **Vendor non-compliance**: Initiate vendor review
- **Budget overruns**: Require additional approvals
- **Quality problems**: Implement corrective actions

## Success Criteria
- [ ] PO created and approved within 24 hours
- [ ] Vendor acknowledgment received within 48 hours
- [ ] Goods received and inspected within 5 business days
- [ ] Invoice processed and paid within payment terms
- [ ] All documentation properly filed and archived

## Related Documentation
- Vendor Management Procedures
- Inventory Management Guidelines
- Financial Controls Manual
- Quality Assurance Standards

---
**Last Updated**: 2025-10-22  
**Next Review**: 2025-11-22  
**Owner**: Support Team
