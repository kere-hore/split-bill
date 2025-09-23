# Split Bill Application - Project Setup Guide

This guide explains how to set up GitHub Projects and Issues for managing the Split Bill Application development.

## 📋 Overview

The Split Bill Application is a modern expense tracking and bill splitting system built with Next.js, TypeScript, and PostgreSQL. This setup guide helps organize development workflow using GitHub's native tools while following FSD architecture principles.

## 🚀 GitHub Project Setup

### 1. Create New Project
1. Go to your repository: `https://github.com/pradiktabagus/split-bill`
2. Click **Projects** tab
3. Click **New Project**
4. Choose **Board** layout
5. Name: `Split Bill Development`
6. Description: `Development tracking for Split Bill expense management application`

### 2. Configure Project Columns

#### Column Structure
- **📋 Backlog** - New issues and feature requests
- **🔄 In Progress** - Currently being worked on
- **👀 In Review** - Pull requests under review
- **✅ Done** - Completed items
- **🚀 Released** - Deployed to production

### 3. Project Settings
- **Visibility**: Public (if open source) or Private
- **Template**: None (custom setup)
- **Automation**: Enable GitHub Actions integration

## 🏷️ Issue Labels Setup

### Priority Labels
- `priority-high` - Critical issues, bugs, or important features
- `priority-medium` - Standard features and improvements
- `priority-low` - Nice-to-have features and minor enhancements

### Type Labels
- `enhancement` - New features and improvements
- `bug` - Bug reports and fixes
- `task` - Development tasks and chores
- `documentation` - Documentation updates

### Component Labels
- `entities` - Business entities (User, Group, Expense, Settlement)
- `features` - Business features (group management, expense tracking)
- `widgets` - UI widgets (dashboard, group list, expense summary)
- `shared` - Shared utilities and components
- `api` - API endpoints and backend logic
- `ui` - User interface components

### Technology Labels
- `nextjs` - Next.js related issues
- `typescript` - TypeScript improvements
- `prisma` - Database and ORM issues
- `clerk` - Authentication related
- `aws` - CloudFront, S3, and AWS services
- `cache` - Caching implementation

## 📝 Issue Templates

### Feature Request Template
```markdown
## 📋 Feature Description
**Feature Name:** [Name]
**Priority:** High/Medium/Low
**Component:** entities/features/widgets/shared/api

### What feature would you like to see?
[Description]

### Which FSD layer(s) will be affected?
- [ ] Entities
- [ ] Features  
- [ ] Widgets
- [ ] Shared
- [ ] App

## 🎯 User Story
As a [user type], I want [goal] so that [benefit].

## 📊 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## 🔧 Technical Requirements
### Database Changes
- [ ] New Prisma models needed
- [ ] Schema migrations required

### API Endpoints
- [ ] New endpoints required
- [ ] Existing endpoints to modify

## ✅ Definition of Done
- [ ] Feature implemented following FSD architecture
- [ ] Tests written and passing
- [ ] Documentation updated
```

### Bug Report Template
```markdown
## 🐛 Bug Description
**Component:** [entities/features/widgets/shared/api]
**Priority:** High/Medium/Low
**Environment:** Development/Staging/Production

### Describe the bug
[Clear description]

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

### Expected behavior
[What should happen]

### Actual behavior
[What actually happens]

### Screenshots
[If applicable]

### Environment Details
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]

### Additional context
[Any other context]
```

## 🔄 Workflow Setup

### 1. Development Workflow
1. **Issue Creation** → Backlog
2. **Assignment** → In Progress
3. **Pull Request** → In Review
4. **Merge** → Done
5. **Deploy** → Released

### 2. Automation Rules
- Auto-move to "In Progress" when PR is created
- Auto-move to "In Review" when PR is ready for review
- Auto-move to "Done" when PR is merged
- Auto-close issue when linked PR is merged

## 📊 Milestones

### Current Development Phases

#### Phase 1: Core Features ✅
- [x] User authentication (Clerk)
- [x] Group management
- [x] Basic expense tracking
- [x] Settlement calculation

#### Phase 2: Enhanced Features 🔄
- [ ] OCR receipt scanning
- [ ] WhatsApp integration
- [ ] Public bill sharing
- [ ] Advanced settlement tracking

#### Phase 3: Optimization 📋
- [ ] Performance improvements
- [ ] Advanced caching
- [ ] Analytics dashboard
- [ ] Mobile optimization

#### Phase 4: Advanced Features 📋
- [ ] Multi-currency support
- [ ] Recurring expenses
- [ ] Export functionality
- [ ] Advanced reporting

## 🎯 Project Metrics

### Key Performance Indicators
- **Issue Resolution Time**: Average time from creation to closure
- **Pull Request Review Time**: Time from creation to merge
- **Bug Fix Rate**: Percentage of bugs fixed within SLA
- **Feature Delivery**: Features delivered per sprint/milestone

### Tracking
- Use GitHub Insights for automatic metrics
- Weekly review of project board
- Monthly milestone assessment
- Quarterly roadmap updates

## 🤝 Team Collaboration

### Roles and Responsibilities
- **Maintainer**: Project oversight, architecture decisions
- **Contributors**: Feature development, bug fixes
- **Reviewers**: Code review, quality assurance

### Communication
- **Issues**: For bugs, features, and tasks
- **Discussions**: For questions and ideas
- **Pull Requests**: For code changes
- **Project Board**: For progress tracking

## 📚 Resources

### Documentation
- [README.md](./README.md) - Project overview
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [API Documentation](./src/app/docs/page.tsx) - API reference

### External Links
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [FSD Architecture](https://feature-sliced.design/)
- [Next.js Documentation](https://nextjs.org/docs)

---

This setup provides a solid foundation for managing the Split Bill Application development using GitHub's native tools while following established FSD architecture principles and modern development practices.