import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';
import config from './firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(config);
const storage = getStorage(app);
const auth = getAuth(app);

async function test() {
  try {
    const storageRef = ref(storage, 'test.txt');
    await uploadString(storageRef, 'hello world');
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR', e);
  }
  process.exit(0);
}
test();
