-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('course', 'university', 'career', 'general')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster category searches
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Create index for searching by creator
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_by ON knowledge_base(created_by);

-- Enable Row Level Security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read
CREATE POLICY "Allow public read access"
    ON knowledge_base
    FOR SELECT
    USING (true);

-- Create policy to allow authenticated users to insert their own entries
CREATE POLICY "Allow authenticated users to insert"
    ON knowledge_base
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own entries
CREATE POLICY "Allow users to update own entries"
    ON knowledge_base
    FOR UPDATE
    USING (auth.uid()::text = created_by)
    WITH CHECK (auth.uid()::text = created_by);

-- Create policy to allow users to delete their own entries
CREATE POLICY "Allow users to delete own entries"
    ON knowledge_base
    FOR DELETE
    USING (auth.uid()::text = created_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
