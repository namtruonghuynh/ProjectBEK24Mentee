# Software Requirements Specification (for User Service)

## 1. Description
- **Readers**: Need fast, accurate news updates, easy to search and share.
- **Newsroom**: Need standardizes writing-editing-publishing workflow to reduce errors and time.
- **Editors**: Need content control tools to ensure quality and reputation.
- **System**: Must handle high traffic and scale.

## 2. Functional Requirements

### 2.1. User Segments & Permissions
Roles: Guest, Member, Reporter, Editor, Admin.
- Higher roles inherit lower role permissions.
- Reporter, Editor, Admin must login.

#### 2.1.1. Guest (Unauthenticated)
- **FR-01**: View news list (Home page).
- **FR-02**: View article detail.
- **FR-03**: Search articles (title/content).

#### 2.1.2. Authentication
- **FR-04**: Register (Member).
- **FR-05**: Login (Member, Reporter, Editor, Admin).
- **FR-06**: Logout.

#### 2.1.3. Member (Authenticated)
Inherits: FR-01 to FR-06.
- **FR-07**: Comment on articles.
- **FR-08**: Manage personal comments (Edit/Delete own).
- **FR-09**: Bookmark articles ("Read later").
- **FR-10**: View bookmarked articles.

#### 2.1.4. Reporter
Inherits: Member (FR-01 to FR-10).
- **FR-11**: Create article (Draft).
- **FR-12**: Edit article (Draft/Rejected).
- **FR-13**: Delete draft article.
- **FR-14**: Submit article (Draft -> Pending).
- **FR-15**: View own articles (all statuses).

#### 2.1.5. Editor
Inherits: Member (FR-01 to FR-10).
- **FR-16**: View pending articles.
- **FR-17**: Approve article (Pending -> Published).
- **FR-18**: Reject article (Pending -> Rejected, with reason).
- **FR-19**: Unpublish article (Published -> Unpublished).
- **FR-20**: Delete article (Severe violation).
- **FR-21**: Manage comments (Delete violating comments).

#### 2.1.6. Admin
Inherits: Editor (FR-01 to FR-21).
- **FR-22**: View all users.
- **FR-23**: Change user role.
- **FR-24**: Deactivate/Activate user account.
- **FR-25**: Manage Categories (CRUD).
- **FR-26**: View system statistics (articles, users, views).

### 2.2. Non-Functional Requirements
- **Performance**: NFR-01 Response time, NFR-02 Load handling, NFR-03 UI performance, NFR-04 DB performance.
- **Security**: NFR-05 Auth/RBAC, NFR-06 Password encryption, NFR-07 Input validation, NFR-08 Rate limiting, NFR-09 Safe data transmission, NFR-10 Security headers, NFR-11 3rd party lib safety.
- **Usability**: NFR-12 Friendly UI, NFR-13 UX feedback.
- **Reliability**: NFR-14 High availability, NFR-15 Error handling, NFR-16 Data consistency.
- **Scalability**: NFR-17 Horizontal scaling, NFR-18 Caching, NFR-19 Content distribution.
- **Maintainability**: NFR-20 Code quality, NFR-21 Logging/Monitoring.
- **Recoverability**: NFR-22 Backups, NFR-23 Disaster recovery.

### 2.3. Business Rules
- Reporters cannot publish directly.
- Articles must be approved by Editor/Admin.
- Article belongs to one category.
- Published articles can be unpublished.

### 2.4. Article Status Workflow
- **Draft**: Reporter creates/edits.
- **Pending**: Submitted for review (Reporter cannot edit).
- **Published**: Publicly visible.
- **Rejected**: Editor returns with reason (Reporter can edit -> Draft).
- **Unpublished**: Removed from public view (can be republished).

**Transitions**:
- Draft -> Pending (Reporter submits)
- Pending -> Published (Editor approves)
- Pending -> Rejected (Editor rejects)
- Published -> Unpublished (Editor removes)
- Rejected -> Draft (Reporter edits)
- Unpublished -> Published (Editor re-publishes)

## 3. Data Requirements

### 3.1. Database Schemas
- **User**: Username (unique, 3-50 chars), Email (unique), Password (hash), Role, Status (Active/Inactive).
- **Article**: Title (max 200), Slug (unique), Content, Author (ID/Name), Category (ID/Name), Status, RejectReason, Views, Times (created, updated, published).
- **Category**: Name (unique, max 100), Slug, Description, ParentID, ArticleCount.
- **Comment**: Content (max 1000), User (ID/Name), ArticleID, Times.
- **Bookmark**: UserID, Article (ID/Title), Time. Unique(User, Article).

### 3.2. Integrity Constraints
- Delete User -> Handle articles/comments/bookmarks.
- Delete Category -> Migrate articles first.
- Delete Article -> Delete related comments/bookmarks.
