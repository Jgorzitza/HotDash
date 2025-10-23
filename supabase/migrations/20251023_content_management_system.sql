-- Content Management System Migration
-- Creates tables for content types, content entries, and content versions

-- Content Types Table
CREATE TABLE IF NOT EXISTS content_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT content_types_name_unique UNIQUE (name)
);

-- Content Entries Table
CREATE TABLE IF NOT EXISTS content_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    version INTEGER NOT NULL DEFAULT 1,
    fields JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    published_by VARCHAR(255),
    
    CONSTRAINT content_entries_slug_unique UNIQUE (content_type_id, slug),
    CONSTRAINT content_entries_version_positive CHECK (version > 0)
);

-- Content Entry Versions Table (for versioning)
CREATE TABLE IF NOT EXISTS content_entry_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_entry_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    fields JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    
    CONSTRAINT content_entry_versions_unique UNIQUE (content_entry_id, version)
);

-- Content Approvals Table (for approval workflow)
CREATE TABLE IF NOT EXISTS content_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_entry_id UUID NOT NULL REFERENCES content_entries(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by VARCHAR(255) NOT NULL,
    approved_by VARCHAR(255),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    
    CONSTRAINT content_approvals_one_per_entry UNIQUE (content_entry_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_types_created_at ON content_types(created_at);
CREATE INDEX IF NOT EXISTS idx_content_types_name ON content_types(name);

CREATE INDEX IF NOT EXISTS idx_content_entries_content_type_id ON content_entries(content_type_id);
CREATE INDEX IF NOT EXISTS idx_content_entries_status ON content_entries(status);
CREATE INDEX IF NOT EXISTS idx_content_entries_created_at ON content_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_content_entries_updated_at ON content_entries(updated_at);
CREATE INDEX IF NOT EXISTS idx_content_entries_slug ON content_entries(slug);
CREATE INDEX IF NOT EXISTS idx_content_entries_title ON content_entries(title);
CREATE INDEX IF NOT EXISTS idx_content_entries_published_at ON content_entries(published_at);

CREATE INDEX IF NOT EXISTS idx_content_entry_versions_content_entry_id ON content_entry_versions(content_entry_id);
CREATE INDEX IF NOT EXISTS idx_content_entry_versions_version ON content_entry_versions(version);
CREATE INDEX IF NOT EXISTS idx_content_entry_versions_created_at ON content_entry_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_content_approvals_content_entry_id ON content_approvals(content_entry_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_status ON content_approvals(status);
CREATE INDEX IF NOT EXISTS idx_content_approvals_requested_at ON content_approvals(requested_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_content_types_updated_at 
    BEFORE UPDATE ON content_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_entries_updated_at 
    BEFORE UPDATE ON content_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to create version when content entry is updated
CREATE OR REPLACE FUNCTION create_content_entry_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create version if this is an update (not insert)
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO content_entry_versions (
            content_entry_id,
            version,
            title,
            slug,
            status,
            fields,
            created_by
        ) VALUES (
            OLD.id,
            OLD.version,
            OLD.title,
            OLD.slug,
            OLD.status,
            OLD.fields,
            OLD.updated_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for versioning
CREATE TRIGGER create_content_entry_version_trigger
    BEFORE UPDATE ON content_entries
    FOR EACH ROW EXECUTE FUNCTION create_content_entry_version();

-- Insert default content types
INSERT INTO content_types (name, description, fields) VALUES 
(
    'Article',
    'Standard article content type for blog posts and articles',
    '[
        {
            "id": "title",
            "name": "Title",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"max": 255}
        },
        {
            "id": "slug",
            "name": "Slug",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"pattern": "^[a-z0-9-]+$"}
        },
        {
            "id": "excerpt",
            "name": "Excerpt",
            "type": "textarea",
            "required": false,
            "localized": false,
            "validation": {"max": 500}
        },
        {
            "id": "content",
            "name": "Content",
            "type": "rich_text",
            "required": true,
            "localized": false
        },
        {
            "id": "featured_image",
            "name": "Featured Image",
            "type": "image",
            "required": false,
            "localized": false
        },
        {
            "id": "publish_date",
            "name": "Publish Date",
            "type": "date",
            "required": false,
            "localized": false
        }
    ]'::jsonb
),
(
    'Page',
    'Standard page content type for static pages',
    '[
        {
            "id": "title",
            "name": "Title",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"max": 255}
        },
        {
            "id": "slug",
            "name": "Slug",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"pattern": "^[a-z0-9-]+$"}
        },
        {
            "id": "content",
            "name": "Content",
            "type": "rich_text",
            "required": true,
            "localized": false
        },
        {
            "id": "meta_description",
            "name": "Meta Description",
            "type": "textarea",
            "required": false,
            "localized": false,
            "validation": {"max": 160}
        }
    ]'::jsonb
),
(
    'Product',
    'Product content type for e-commerce products',
    '[
        {
            "id": "title",
            "name": "Title",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"max": 255}
        },
        {
            "id": "slug",
            "name": "Slug",
            "type": "text",
            "required": true,
            "localized": false,
            "validation": {"pattern": "^[a-z0-9-]+$"}
        },
        {
            "id": "description",
            "name": "Description",
            "type": "rich_text",
            "required": true,
            "localized": false
        },
        {
            "id": "price",
            "name": "Price",
            "type": "number",
            "required": true,
            "localized": false,
            "validation": {"min": 0}
        },
        {
            "id": "images",
            "name": "Images",
            "type": "file",
            "required": false,
            "localized": false
        },
        {
            "id": "in_stock",
            "name": "In Stock",
            "type": "boolean",
            "required": true,
            "localized": false
        }
    ]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_entry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your auth requirements)
CREATE POLICY "Allow all operations on content_types" ON content_types
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on content_entries" ON content_entries
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on content_entry_versions" ON content_entry_versions
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on content_approvals" ON content_approvals
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON content_types TO authenticated;
GRANT ALL ON content_entries TO authenticated;
GRANT ALL ON content_entry_versions TO authenticated;
GRANT ALL ON content_approvals TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
