-- Create function to initialize knowledge base table
CREATE OR REPLACE FUNCTION create_knowledge_base_if_not_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Create the table if it doesn't exist
    CREATE TABLE IF NOT EXISTS knowledge_base (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('course', 'university', 'career', 'general')),
        created_by TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes if they don't exist
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_by ON knowledge_base(created_by);

    -- Enable RLS if not already enabled
    ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

    -- Create or replace policies
    DO $$ 
    BEGIN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Allow public read access" ON knowledge_base;
        DROP POLICY IF EXISTS "Allow authenticated users to insert" ON knowledge_base;
        DROP POLICY IF EXISTS "Allow users to update own entries" ON knowledge_base;
        DROP POLICY IF EXISTS "Allow users to delete own entries" ON knowledge_base;
        
        -- Create new policies
        CREATE POLICY "Allow public read access"
            ON knowledge_base
            FOR SELECT
            USING (true);

        CREATE POLICY "Allow authenticated users to insert"
            ON knowledge_base
            FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Allow users to update own entries"
            ON knowledge_base
            FOR UPDATE
            USING (auth.uid()::text = created_by)
            WITH CHECK (auth.uid()::text = created_by);

        CREATE POLICY "Allow users to delete own entries"
            ON knowledge_base
            FOR DELETE
            USING (auth.uid()::text = created_by);
    END $$;

    -- Create or replace the updated_at trigger
    DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
    CREATE TRIGGER update_knowledge_base_updated_at
        BEFORE UPDATE ON knowledge_base
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END;
$$;
