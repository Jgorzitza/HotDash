-- =====================================================
-- Migration: Enable RLS Policies for All Public Tables
-- Date: 2025-10-12
-- Purpose: Fix security vulnerability - 92 tables without RLS
-- =====================================================

-- Helper functions
CREATE OR REPLACE FUNCTION get_current_account_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(current_setting('app.account_id', TRUE), '')::INTEGER;
$$;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', TRUE), '')::INTEGER;
$$;

-- Accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account_isolation" ON accounts FOR ALL USING (id = get_current_account_id());

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_access" ON users FOR ALL USING (
  id = get_current_user_id() OR EXISTS (
    SELECT 1 FROM account_users
    WHERE account_users.user_id = users.id AND account_users.account_id = get_current_account_id()
  )
);

-- Account Users
ALTER TABLE account_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account_user_isolation" ON account_users FOR ALL 
  USING (account_id = get_current_account_id() OR user_id = get_current_user_id());


-- Standard account-based tables
DO $$
DECLARE
  table_name TEXT;
  tables_with_account_id TEXT[] := ARRAY[
    'inboxes', 'contacts', 'conversations', 'messages', 'notes',
    'notifications', 'labels', 'teams', 'webhooks',
    'canned_responses', 'automation_rules', 'campaigns', 'working_hours',
    'csat_survey_responses', 'sla_policies', 'sla_events', 'applied_slas',
    'custom_attribute_definitions', 'custom_filters', 'custom_roles',
    'data_imports', 'dashboard_apps', 'email_templates',
    'assignment_policies', 'agent_capacity_policies', 'agent_bots',
    'agent_bot_inboxes', 'articles', 'categories', 'folders',
    'captain_assistants', 'captain_assistant_responses', 'captain_documents',
    'captain_scenarios', 'copilot_threads', 'copilot_messages',
    'macros', 'mentions', 'leaves', 'reporting_events',
    'integrations_hooks', 'channel_api', 'channel_email', 'channel_facebook_pages',
    'channel_instagram', 'channel_line', 'channel_sms', 'channel_telegram',
    'channel_twilio_sms', 'channel_twitter_profiles', 'channel_voice',
    'channel_web_widgets', 'channel_whatsapp', 'account_saml_settings'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_with_account_id LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY "tenant_isolation" ON %I FOR ALL USING (account_id = get_current_account_id())', table_name);
  END LOOP;
END $$;


-- Team members (needs team → account lookup)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_member_isolation" ON team_members FOR ALL USING (
  user_id = get_current_user_id() OR EXISTS (
    SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.account_id = get_current_account_id()
  )
);

-- Conversation participants
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversation_participant_isolation" ON conversation_participants FOR ALL USING (
  user_id = get_current_user_id() OR EXISTS (
    SELECT 1 FROM conversations WHERE conversations.id = conversation_participants.conversation_id 
    AND conversations.account_id = get_current_account_id()
  )
);

-- Captain inboxes
ALTER TABLE captain_inboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "captain_inbox_isolation" ON captain_inboxes FOR ALL USING (
  EXISTS (SELECT 1 FROM inboxes WHERE inboxes.id = captain_inboxes.inbox_id AND inboxes.account_id = get_current_account_id())
);

-- Inbox members
ALTER TABLE inbox_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inbox_member_isolation" ON inbox_members FOR ALL USING (
  user_id = get_current_user_id() OR EXISTS (
    SELECT 1 FROM inboxes WHERE inboxes.id = inbox_members.inbox_id AND inboxes.account_id = get_current_account_id()
  )
);

-- Contact inboxes
ALTER TABLE contact_inboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_inbox_isolation" ON contact_inboxes FOR ALL USING (
  EXISTS (SELECT 1 FROM inboxes WHERE inboxes.id = contact_inboxes.inbox_id AND inboxes.account_id = get_current_account_id())
);

-- Inbox assignment policies
ALTER TABLE inbox_assignment_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inbox_assignment_isolation" ON inbox_assignment_policies FOR ALL USING (
  EXISTS (SELECT 1 FROM inboxes WHERE inboxes.id = inbox_assignment_policies.inbox_id AND inboxes.account_id = get_current_account_id())
);

-- Inbox capacity limits
ALTER TABLE inbox_capacity_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inbox_capacity_isolation" ON inbox_capacity_limits FOR ALL USING (
  EXISTS (SELECT 1 FROM inboxes WHERE inboxes.id = inbox_capacity_limits.inbox_id AND inboxes.account_id = get_current_account_id())
);


-- Portals
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_isolation" ON portals FOR ALL USING (account_id = get_current_account_id());

-- Portals members
ALTER TABLE portals_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portal_member_isolation" ON portals_members FOR ALL USING (
  EXISTS (SELECT 1 FROM portals WHERE portals.id = portals_members.portal_id AND portals.account_id = get_current_account_id())
  OR user_id = get_current_user_id()
);

-- Active storage tables
ALTER TABLE active_storage_blobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blob_access" ON active_storage_blobs FOR ALL USING (TRUE);

ALTER TABLE active_storage_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachment_access" ON active_storage_attachments FOR ALL USING (TRUE);

ALTER TABLE active_storage_variant_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variant_access" ON active_storage_variant_records FOR ALL USING (TRUE);

-- Tags and taggings
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_access" ON tags FOR ALL USING (TRUE);

ALTER TABLE taggings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tagging_access" ON taggings FOR ALL USING (TRUE);

-- Related categories
ALTER TABLE related_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "related_category_access" ON related_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM categories WHERE categories.id = category_id AND categories.account_id = get_current_account_id())
);

-- Platform apps
ALTER TABLE platform_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_app_access" ON platform_apps FOR ALL USING (TRUE);

ALTER TABLE platform_app_permissibles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_app_permissible_access" ON platform_app_permissibles FOR ALL USING (
  (permissible_type = 'Account' AND permissible_id = get_current_account_id())
  OR (permissible_type = 'User' AND permissible_id = get_current_user_id())
);

-- Access tokens
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "access_token_owner" ON access_tokens FOR ALL USING (
  (owner_type = 'User' AND owner_id = get_current_user_id())
  OR (owner_type = 'AgentBot' AND EXISTS (
    SELECT 1 FROM agent_bots WHERE agent_bots.id = owner_id AND agent_bots.account_id = get_current_account_id()
  ))
);

-- Attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachment_message_isolation" ON attachments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM messages m JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_id AND c.account_id = get_current_account_id()
  )
);

-- Article embeddings
ALTER TABLE article_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_embedding_isolation" ON article_embeddings FOR ALL USING (
  EXISTS (SELECT 1 FROM articles WHERE articles.id = article_id AND articles.account_id = get_current_account_id())
);

-- System tables
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schema_migrations_read" ON schema_migrations FOR SELECT USING (TRUE);

ALTER TABLE ar_internal_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_metadata_read" ON ar_internal_metadata FOR SELECT USING (TRUE);

ALTER TABLE installation_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "installation_config_read" ON installation_configs FOR SELECT USING (TRUE);

ALTER TABLE action_mailbox_inbound_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inbound_email_access" ON action_mailbox_inbound_emails FOR ALL USING (TRUE);

ALTER TABLE decision_sync_event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decision_sync_access" ON decision_sync_event_logs FOR ALL USING (TRUE);


-- Audits table (user-based, no direct account_id)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_user_access" ON audits FOR ALL USING (
  user_id = get_current_user_id()
);

