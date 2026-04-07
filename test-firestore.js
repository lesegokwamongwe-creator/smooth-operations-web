import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from './firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR', e);
  }
  process.exit(0);
}
test();
