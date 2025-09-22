const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert('serviceAccountKey.json') // Download from Firebase Console > Project Settings > Service Accounts > Generate new private key
});



// Replace with your user's UID from console
const uid = 'diMbhHGygnc9tqquqbIEh6eOHgq1'; // e.g., 'abc123...'

admin.auth().setCustomUserClaims(uid, { role: 'admin' })
  .then(() => {
    console.log('Custom claim set successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting custom claim:', error);
    process.exit(1);
  });