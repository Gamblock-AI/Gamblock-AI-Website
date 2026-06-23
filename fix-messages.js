const fs = require('fs');

['id.json', 'en.json'].forEach(file => {
  const path = `./messages/${file}`;
  if (!fs.existsSync(path)) return;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (data['[locale]Page']) {
    data['LandingPage'] = { ...data['LandingPage'], ...data['[locale]Page'] };
    delete data['[locale]Page'];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Fixed ${file}`);
  }
});
