-- Create schema for table reservation builder
CREATE SCHEMA IF NOT EXISTS table_reservation;

-- Enable RLS for all tables
ALTER SCHEMA table_reservation ENABLE ROW LEVEL SECURITY;

-- Users table in table_reservation schema
CREATE TABLE IF NOT EXISTS table_reservation.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Reservation sections table
CREATE TABLE IF NOT EXISTS table_reservation.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES table_reservation.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plugin downloads table
CREATE TABLE IF NOT EXISTS table_reservation.plugin_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES table_reservation.sections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES table_reservation.users(id) ON DELETE CASCADE,
  plugin_config JSONB NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table (for the actual reservations made through the forms)
CREATE TABLE IF NOT EXISTS table_reservation.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES table_reservation.sections(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guest_count INTEGER NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  ip_address INET,
  user_agent TEXT,
  recaptcha_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON table_reservation.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON table_reservation.users(username);
CREATE INDEX IF NOT EXISTS idx_sections_user_id ON table_reservation.sections(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_created_at ON table_reservation.sections(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_section_id ON table_reservation.reservations(section_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON table_reservation.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON table_reservation.reservations(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION table_reservation.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON table_reservation.users 
    FOR EACH ROW EXECUTE FUNCTION table_reservation.update_updated_at_column();

CREATE TRIGGER update_sections_updated_at 
    BEFORE UPDATE ON table_reservation.sections 
    FOR EACH ROW EXECUTE FUNCTION table_reservation.update_updated_at_column();

CREATE TRIGGER update_plugin_downloads_updated_at 
    BEFORE UPDATE ON table_reservation.plugin_downloads 
    FOR EACH ROW EXECUTE FUNCTION table_reservation.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON table_reservation.reservations 
    FOR EACH ROW EXECUTE FUNCTION table_reservation.update_updated_at_column();

-- Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON table_reservation.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON table_reservation.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Sections policies
CREATE POLICY "Users can view their own sections" ON table_reservation.sections
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own sections" ON table_reservation.sections
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own sections" ON table_reservation.sections
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own sections" ON table_reservation.sections
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Plugin downloads policies
CREATE POLICY "Users can view their own plugin downloads" ON table_reservation.plugin_downloads
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own plugin downloads" ON table_reservation.plugin_downloads
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Reservations policies (public read for form submissions)
CREATE POLICY "Allow public insert for reservations" ON table_reservation.reservations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Section owners can view their reservations" ON table_reservation.reservations
  FOR SELECT USING (
    section_id IN (
      SELECT id FROM table_reservation.sections WHERE user_id::text = auth.uid()::text
    )
  );

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE table_reservation.users;
ALTER PUBLICATION supabase_realtime ADD TABLE table_reservation.sections;
ALTER PUBLICATION supabase_realtime ADD TABLE table_reservation.plugin_downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE table_reservation.reservations;