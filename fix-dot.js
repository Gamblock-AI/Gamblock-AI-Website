const fs = require('fs');

['id.json', 'en.json'].forEach(file => {
  const path = `./messages/${file}`;
  if (!fs.existsSync(path)) return;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (data['empty-state.test']) {
    data['empty-state-test'] = data['empty-state.test'];
    delete data['empty-state.test'];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Fixed dot in ${file}`);
  }
});
