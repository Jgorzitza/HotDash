# Growth Engine Support Training Materials

## Overview

This document provides comprehensive training materials for the Growth Engine Support Team, covering technical knowledge, procedures, and best practices for supporting Growth Engine phases 9-12.

## Training Curriculum

### Module 1: Growth Engine Fundamentals

#### Learning Objectives
- Understand Growth Engine architecture and components
- Learn about MCP Evidence, Heartbeat, and Dev MCP Ban systems
- Understand CI Guards and their role in compliance
- Know the support framework and escalation procedures

#### Key Concepts
- **Growth Engine**: Comprehensive support infrastructure for phases 9-12
- **MCP Evidence**: JSONL-based tracking of MCP tool usage
- **Heartbeat**: NDJSON-based monitoring of agent activity
- **Dev MCP Ban**: Production safety enforcement
- **CI Guards**: Automated compliance validation

#### Technical Components
- **Services**: MCP Evidence, Heartbeat, Dev MCP Ban services
- **Workflows**: GitHub Actions for CI Guards
- **Templates**: PR templates for compliance
- **Documentation**: Comprehensive support documentation

### Module 2: MCP Evidence System

#### Learning Objectives
- Understand MCP Evidence system architecture
- Learn to troubleshoot common MCP Evidence issues
- Know how to validate and fix evidence files
- Understand compliance requirements

#### Technical Knowledge
- **File Format**: JSONL (JSON Lines) format
- **Required Fields**: tool, doc_ref, request_id, timestamp, purpose
- **File Location**: `artifacts/<agent>/<YYYY-MM-DD>/mcp/<topic>.jsonl`
- **Validation**: JSON format validation and field verification

#### Common Issues
- **Missing Files**: Evidence files not created
- **Invalid Format**: Malformed JSON in evidence files
- **Missing Fields**: Required fields not present
- **Permission Issues**: File access problems

#### Troubleshooting Procedures
1. **Check Directory Structure**: Verify evidence directories exist
2. **Validate JSON Format**: Check JSONL file format
3. **Verify Fields**: Ensure required fields are present
4. **Fix Issues**: Correct format and permission problems

#### Hands-on Exercises
- **Exercise 1**: Create evidence file structure
- **Exercise 2**: Validate JSONL format
- **Exercise 3**: Fix malformed evidence files
- **Exercise 4**: Troubleshoot permission issues

### Module 3: Heartbeat Monitoring

#### Learning Objectives
- Understand Heartbeat system architecture
- Learn to troubleshoot Heartbeat issues
- Know how to validate and fix heartbeat files
- Understand monitoring requirements

#### Technical Knowledge
- **File Format**: NDJSON (Newline Delimited JSON) format
- **Required Fields**: timestamp, task, status, progress, file
- **File Location**: `artifacts/<agent>/<YYYY-MM-DD>/heartbeat.ndjson`
- **Monitoring**: 15-minute interval monitoring for tasks >2 hours

#### Common Issues
- **Stale Heartbeats**: Heartbeat entries older than 15 minutes
- **Missing Files**: No heartbeat tracking for long-running tasks
- **Invalid Format**: Malformed JSON in heartbeat files
- **Monitoring Failures**: Heartbeat not updating regularly

#### Troubleshooting Procedures
1. **Check Heartbeat Status**: Verify last heartbeat entry
2. **Validate Format**: Check NDJSON file format
3. **Check Timing**: Verify heartbeat frequency
4. **Fix Issues**: Correct format and timing problems

#### Hands-on Exercises
- **Exercise 1**: Create heartbeat file structure
- **Exercise 2**: Validate NDJSON format
- **Exercise 3**: Fix stale heartbeat issues
- **Exercise 4**: Troubleshoot monitoring failures

### Module 4: Dev MCP Ban System

#### Learning Objectives
- Understand Dev MCP Ban system architecture
- Learn to troubleshoot Dev MCP Ban issues
- Know how to validate and fix violations
- Understand production safety requirements

#### Technical Knowledge
- **Banned Imports**: @shopify/mcp-server-dev, context7-mcp, chrome-devtools-mcp
- **Allowed Locations**: scripts/, tests/, .cursor/, docs/
- **Forbidden Locations**: app/ directory (production code)
- **CI Validation**: Automated scanning and validation

#### Common Issues
- **Dev MCP Imports**: Banned imports found in production code
- **False Positives**: Legitimate imports flagged as violations
- **CI Failures**: Build fails due to Dev MCP violations
- **Missing Checks**: Dev MCP Ban checks not running

#### Troubleshooting Procedures
1. **Scan for Violations**: Check for banned imports
2. **Verify Context**: Check if imports are actually Dev MCP
3. **Fix Violations**: Remove or move banned imports
4. **Validate CI**: Ensure CI checks are working

#### Hands-on Exercises
- **Exercise 1**: Scan for Dev MCP violations
- **Exercise 2**: Fix Dev MCP import violations
- **Exercise 3**: Troubleshoot false positives
- **Exercise 4**: Validate CI configuration

### Module 5: CI Guards System

#### Learning Objectives
- Understand CI Guards system architecture
- Learn to troubleshoot CI Guards issues
- Know how to validate and fix guard failures
- Understand compliance requirements

#### Technical Knowledge
- **Guard MCP**: MCP Evidence validation
- **Idle Guard**: Heartbeat validation
- **Dev MCP Ban**: Dev MCP Ban validation
- **Workflows**: GitHub Actions workflows for validation

#### Common Issues
- **Guard Failures**: CI Guards not passing
- **Missing Sections**: PR body missing required sections
- **Validation Errors**: Evidence or heartbeat validation failing
- **Workflow Issues**: CI workflows not running

#### Troubleshooting Procedures
1. **Check PR Body**: Verify required sections are present
2. **Validate Files**: Check evidence and heartbeat files
3. **Check Workflows**: Ensure CI workflows are running
4. **Fix Issues**: Correct validation and workflow problems

#### Hands-on Exercises
- **Exercise 1**: Create compliant PR body
- **Exercise 2**: Validate evidence and heartbeat files
- **Exercise 3**: Troubleshoot CI workflow issues
- **Exercise 4**: Fix guard validation failures

### Module 6: Support Procedures

#### Learning Objectives
- Understand support procedures and escalation
- Learn to handle different types of issues
- Know how to communicate with stakeholders
- Understand documentation and reporting

#### Support Procedures
- **Issue Triage**: Assess severity and impact
- **Initial Response**: First response procedures
- **Escalation**: When and how to escalate
- **Communication**: Stakeholder communication

#### Issue Types
- **Technical Issues**: System and configuration problems
- **Process Issues**: Workflow and procedure problems
- **Communication Issues**: Stakeholder and team communication
- **Documentation Issues**: Knowledge and documentation problems

#### Communication Skills
- **Active Listening**: Understanding user needs and concerns
- **Clear Communication**: Explaining technical concepts clearly
- **Empathy**: Understanding user frustration and impact
- **Professionalism**: Maintaining professional standards

#### Hands-on Exercises
- **Exercise 1**: Practice issue triage
- **Exercise 2**: Role-play escalation scenarios
- **Exercise 3**: Practice stakeholder communication
- **Exercise 4**: Document issue resolution

### Module 7: Advanced Troubleshooting

#### Learning Objectives
- Learn advanced troubleshooting techniques
- Understand system integration and dependencies
- Know how to use diagnostic tools
- Understand performance optimization

#### Advanced Techniques
- **System Analysis**: Deep system analysis and diagnosis
- **Performance Tuning**: Optimizing system performance
- **Integration Testing**: Testing system integrations
- **Security Analysis**: Security assessment and remediation

#### Diagnostic Tools
- **Log Analysis**: Analyzing system and application logs
- **Performance Monitoring**: Using monitoring tools
- **Network Diagnostics**: Network troubleshooting tools
- **Security Tools**: Security assessment and scanning tools

#### Troubleshooting Methodologies
- **Root Cause Analysis**: Identifying root causes of issues
- **Systematic Approach**: Step-by-step troubleshooting
- **Documentation**: Documenting troubleshooting steps
- **Knowledge Sharing**: Sharing learnings with team

#### Hands-on Exercises
- **Exercise 1**: Advanced log analysis
- **Exercise 2**: Performance optimization
- **Exercise 3**: Integration testing
- **Exercise 4**: Security assessment

### Module 8: Best Practices

#### Learning Objectives
- Understand support best practices
- Learn to maintain high service quality
- Know how to continuously improve
- Understand team collaboration

#### Best Practices
- **Proactive Support**: Anticipating and preventing issues
- **Knowledge Management**: Maintaining and sharing knowledge
- **Continuous Improvement**: Learning and improving processes
- **Team Collaboration**: Working effectively with team members

#### Quality Standards
- **Response Time**: Meeting SLA requirements
- **Resolution Quality**: High-quality issue resolution
- **Communication**: Clear and professional communication
- **Documentation**: Comprehensive documentation

#### Continuous Improvement
- **Process Optimization**: Improving support processes
- **Tool Enhancement**: Upgrading and improving tools
- **Training**: Ongoing training and development
- **Feedback**: Collecting and acting on feedback

#### Hands-on Exercises
- **Exercise 1**: Implement best practices
- **Exercise 2**: Practice quality standards
- **Exercise 3**: Continuous improvement planning
- **Exercise 4**: Team collaboration exercises

## Training Delivery

### Training Methods

#### Classroom Training
- **Duration**: 2 days (16 hours)
- **Format**: Instructor-led training
- **Location**: Training room or virtual
- **Materials**: Slides, handouts, exercises

#### Hands-on Labs
- **Duration**: 1 day (8 hours)
- **Format**: Practical exercises
- **Location**: Lab environment
- **Materials**: Lab exercises, test systems

#### Online Training
- **Duration**: Self-paced
- **Format**: Online modules
- **Location**: Learning management system
- **Materials**: Videos, documents, quizzes

#### Mentoring
- **Duration**: Ongoing
- **Format**: One-on-one mentoring
- **Location**: Workplace
- **Materials**: Real-world scenarios

### Training Schedule

#### Week 1: Fundamentals
- **Day 1**: Growth Engine Fundamentals
- **Day 2**: MCP Evidence System
- **Day 3**: Heartbeat Monitoring
- **Day 4**: Dev MCP Ban System
- **Day 5**: CI Guards System

#### Week 2: Advanced Topics
- **Day 1**: Support Procedures
- **Day 2**: Advanced Troubleshooting
- **Day 3**: Best Practices
- **Day 4**: Hands-on Labs
- **Day 5**: Assessment and Certification

### Assessment and Certification

#### Knowledge Assessment
- **Format**: Multiple choice and scenario-based questions
- **Duration**: 2 hours
- **Passing Score**: 80%
- **Retake Policy**: Unlimited retakes with 24-hour cooldown

#### Practical Assessment
- **Format**: Hands-on troubleshooting scenarios
- **Duration**: 4 hours
- **Passing Score**: 80%
- **Retake Policy**: Unlimited retakes with 48-hour cooldown

#### Certification Requirements
- **Knowledge Assessment**: Pass with 80% or higher
- **Practical Assessment**: Pass with 80% or higher
- **Attendance**: Attend all training sessions
- **Participation**: Active participation in exercises

## Training Resources

### Documentation
- **Growth Engine Support Framework**: Comprehensive framework documentation
- **Troubleshooting Guide**: Detailed troubleshooting procedures
- **Escalation Procedures**: Escalation and communication procedures
- **Best Practices**: Support best practices and standards

### Tools and Systems
- **Test Environment**: Isolated test environment for training
- **Monitoring Tools**: Access to monitoring and diagnostic tools
- **Documentation System**: Knowledge base and documentation system
- **Communication Tools**: Team communication and collaboration tools

### Support Materials
- **Quick Reference**: Quick reference cards and cheat sheets
- **Troubleshooting Checklists**: Step-by-step troubleshooting checklists
- **Escalation Contacts**: Contact information and escalation procedures
- **Emergency Procedures**: Emergency response procedures

## Ongoing Development

### Continuous Learning
- **Monthly Updates**: Monthly training updates and refreshers
- **New Features**: Training on new features and capabilities
- **Best Practices**: Sharing best practices and lessons learned
- **Tool Updates**: Training on updated tools and systems

### Skill Development
- **Technical Skills**: Advanced technical skills development
- **Soft Skills**: Communication and customer service skills
- **Leadership**: Leadership and mentoring skills
- **Specialization**: Specialized skills in specific areas

### Performance Monitoring
- **Training Effectiveness**: Measuring training effectiveness
- **Skill Assessment**: Regular skill assessment and evaluation
- **Feedback Collection**: Collecting feedback on training programs
- **Improvement Planning**: Planning and implementing improvements

### Career Development
- **Career Paths**: Clear career development paths
- **Advancement Opportunities**: Opportunities for advancement
- **Skill Recognition**: Recognition of skills and achievements
- **Professional Development**: Professional development opportunities

---

**Last Updated**: 2025-10-22  
**Next Review**: 2025-11-22  
**Owner**: Support Team  
**Version**: 1.0.0
