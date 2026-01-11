const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '..', 'src', 'routes', 'db.json');

function read() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function write(obj) {
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2));
}

function normalizeUser(u) {
  const a = Array.isArray(u.favorite) ? u.favorite : [];
  const b = Array.isArray(u.favorites) ? u.favorites : [];
  const merged = Array.from(new Set([...a, ...b]));
  if (merged.length > 0) {
    u.favorites = merged;
  } else {
    delete u.favorites;
  }
  if (u.favorite) delete u.favorite;
}

function main() {
  const db = read();
  if (!Array.isArray(db.users)) {
    console.error('No users array found in db.json');
    process.exit(1);
  }

  let changed = 0;
  for (const u of db.users) {
    const beforeFavs = (u.favorites || []).slice().sort();
    const a = Array.isArray(u.favorite) ? u.favorite : [];
    const b = Array.isArray(u.favorites) ? u.favorites : [];
    const merged = Array.from(new Set([...a, ...b]));
    const afterFavs = merged.slice().sort();
    const same = JSON.stringify(beforeFavs) === JSON.stringify(afterFavs);
    if (!same) {
      normalizeUser(u);
      changed++;
    }
  }

  if (changed > 0) {
    write(db);
    console.log(`Normalized favorites for ${changed} users in ${FILE}`);
  } else {
    console.log('No changes needed');
  }
}

main();
