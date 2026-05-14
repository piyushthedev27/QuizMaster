import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

async function main() {
  console.log('Starting data deletion for Unit 1 and Unit 2...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Missing Supabase keys, aborting.')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  console.log('Deleting Unit-1 data from questions table (Supabase)...')
  const { error: err1 } = await supabase.from('questions').delete().eq('unit', 'unit-1')
  if (err1) console.error('Error deleting from questions (unit-1):', err1)
  
  console.log('Deleting Unit-2 data from questions table (Supabase)...')
  const { error: err2 } = await supabase.from('questions').delete().eq('unit', 'unit-2')
  if (err2) console.error('Error deleting from questions (unit-2):', err2)

  console.log('Deleting from unit_1 table (Supabase)...')
  const { error: err3 } = await supabase.from('unit_1').delete().neq('id', '0')
  if (err3) console.error('Error deleting from unit_1:', err3)

  console.log('Deleting from unit_2 table (Supabase)...')
  const { error: err4 } = await supabase.from('unit_2').delete().neq('id', '0')
  if (err4) console.error('Error deleting from unit_2:', err4)

  console.log('Deletion script finished.')
}

main().catch(console.error)
