require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    const { data, error } = await supabase.storage.getBucket('proctoring-snapshots');
    if (error && error.message.includes('not found')) {
        console.log('Bucket not found, creating...');
        const { data: createData, error: createError } = await supabase.storage.createBucket('proctoring-snapshots', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png'],
            fileSizeLimit: 2097152 // 2MB
        });
        if (createError) {
            console.error('Error creating bucket:', createError);
        } else {
            console.log('Bucket created successfully!');
        }
    } else if (error) {
        console.error('Error checking bucket:', error);
    } else {
        console.log('Bucket already exists.');
        
        // Ensure it is public
        if (!data.public) {
            await supabase.storage.updateBucket('proctoring-snapshots', {
                public: true
            });
            console.log('Made bucket public');
        }
    }
}

setupBucket().then(() => process.exit(0));
