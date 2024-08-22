
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { env } from 'process';

const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    databaseURL: env.FIREBASE_DATABASE_URL,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(config);
export const firestore = getFirestore(app);


// (async () => {
//     console.log('STARTED')
//     // const coll = collection(db, 'crm-leads');
//     const coll = collection(db, 'instagram-queue');
//     console.log(coll)
//     console.log('---------')

//     const q = query(coll,
//         limit(10),
//         where("arg", "==", "growthsupplements"),
//         where("owner", "==", "qNlTzsjzvZSfpK4YUqHL0n2dpLC3"),
//         // where("leadOwner", "==", "qNlTzsjzvZSfpK4YUqHL0n2dpLC3"),
//         // where("status", "in", ["pending"])
//     )

//     const citySnapshot = await getDocs(q);
//     const cityList = citySnapshot.docs.map(doc => doc.data());
//     console.log(cityList[0].createdAt.seconds)
