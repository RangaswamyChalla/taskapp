export const TEMPLATES = {
  todo: `PROJECT: Task Management Application v1.0

1. OVERVIEW
A collaborative web-based task management system for small teams. Users can create, assign, and track tasks through completion.

2. FUNCTIONAL REQUIREMENTS
FR-01: Users register with email/password, login returns JWT (access + refresh tokens)
FR-02: Create tasks: title, description, priority (low/medium/high/urgent), due_date
FR-03: Assign tasks to team members; assignee receives notification
FR-04: Task workflow: Todo → In Progress → Review → Done
FR-05: Dashboard: task counts by status, overdue alerts, team workload
FR-06: Filter/search tasks by status, priority, assignee, date range
FR-07: Audit log records all state changes

3. NON-FUNCTIONAL REQUIREMENTS
NFR-01: REST API p95 latency < 150ms
NFR-02: PostgreSQL with proper foreign keys, indexes on status+priority
NFR-03: Stateless JWT authentication, 15min access / 7d refresh
NFR-04: Docker deployment with Nginx reverse proxy

4. DATA ENTITIES
User: id(uuid), email, password_hash, name, avatar_url, created_at
Team: id(uuid), name, slug, owner_id→User
Task: id(uuid), title, description, status, priority, due_date, creator_id→User, assignee_id→User, team_id→Team
AuditLog: id, table, record_id, action, user_id, old_data(jsonb), new_data(jsonb)`,
  ecom: `PROJECT: E-Commerce Platform v2.0

1. OVERVIEW
Full-featured online store with product catalog, cart, checkout, and admin panel.

2. REQUIREMENTS
FR-01: Product catalog with categories, tags, search, pagination
FR-02: Shopping cart (add, remove, update qty, persist to DB)
FR-03: Checkout with address, shipping, Stripe payment
FR-04: Order management: pending→confirmed→shipped→delivered
FR-05: Admin: product CRUD, inventory tracking, order management
FR-06: User accounts with order history, saved addresses
FR-07: Coupon/discount codes

3. DATA ENTITIES
Product: id, name, slug, price, stock, category_id, images[], tags[]
Order: id, user_id, status, total, shipping_address(jsonb), stripe_payment_id
OrderItem: id, order_id, product_id, quantity, unit_price`,
  blog: `PROJECT: Blog Publishing Platform

1. OVERVIEW
Developer blog with Markdown authoring, SEO, comments, and RSS.

2. REQUIREMENTS
FR-01: Auth with OAuth (GitHub) and email/password
FR-02: Write posts in Markdown with frontmatter
FR-03: Categories, tags, full-text search
FR-04: Comment system with nested replies
FR-05: Auto-generate RSS feed and sitemap
FR-06: Draft/Published/Archived post states`,
  auth: `PROJECT: Auth Microservice

1. OVERVIEW
Standalone authentication service: JWT, OAuth2, 2FA, refresh tokens.

2. REQUIREMENTS
FR-01: Email/password registration with email verification
FR-02: Login → access_token (15m) + refresh_token (30d, rotating)
FR-03: OAuth2: Google, GitHub providers
FR-04: TOTP-based 2FA (QR code setup)
FR-05: Password reset via signed email link
FR-06: Rate limiting: 5 failed logins → 15min lockout
FR-07: Session management: list active sessions, revoke session`,
};
