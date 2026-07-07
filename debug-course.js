const fs = require('fs');
const path = require('path');

const envLocal = path.resolve(__dirname, '.env.local');
const env = fs.readFileSync(envLocal, 'utf8');
const match = env.match(/STRAPI_API_TOKEN=([^\n\r]+)/);
const token = match[1].trim().replace(/^["']|["']$/g, '');
const STRAPI_URL = 'http://localhost:1337';

async function main() {
  // Test getCourseBySlug logic like the app does
  const qs = new URLSearchParams({
    'filters[slug][$eq]': 'digital-marketing-2-masterclass-10',
    'publicationState': 'preview',
    'populate[category]': 'true',
    'populate[instructor][fields]': 'id,name,title',
    'populate[thumbnail]': 'true',
    'populate[lessons][fields]': 'id,title,slug,duration,order,isFree,chapter',
    'populate[lessons][sort]': 'order:asc',
    'populate[reviews][fields]': 'id,rating,comment,userName,createdAt',
  });
  const res = await fetch(`${STRAPI_URL}/api/courses?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Status:', res.status);
  console.log('Found:', data.data?.length);
  const c = data.data?.[0];
  if (c) {
    console.log('Title:', c.title);
    console.log('Slug:', c.slug);
    console.log('Lessons count:', c.lessons?.length || 0);
    c.lessons?.forEach(l => console.log('  Lesson:', l.slug));
  } else {
    console.log('Error:', JSON.stringify(data.error));
  }
}

main().catch(console.error);
