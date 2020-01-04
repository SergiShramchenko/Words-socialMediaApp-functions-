const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

const { db } = require('./util/admin');

const {
  getAllWords,
  postOneWord,
  getWord,
  commentOnWord,
  likeWord,
  unlikeWord,
  deleteWord
} = require('./handlers/words');
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
} = require('./handlers/users');

// Word routes
app.get('/words', getAllWords);
app.post('/word', FBAuth, postOneWord);
app.get('/word/:wordId', getWord);
app.delete('/word/:wordId', FBAuth, deleteWord);
app.get('/word/:wordId/like', FBAuth, likeWord);
app.get('/word/:wordId/unlike', FBAuth, unlikeWord);
app.post('/word/:wordId/comment', FBAuth, commentOnWord);

// User routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', markNotificationsRead);

exports.api = functions.region('europe-west2').https.onRequest(app);

exports.createNotificationOnLike = functions
  .region('europe-west2')
  .firestore.document('likes/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/words/${snapshot.data().wordId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });

exports.deleteNotificationOnUnLike = functions
  .region('europe-west2')
  .firestore.document('likes/{id}')
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region('europe-west2')
  .firestore.document('comments/{id}')
  .onCreate(snapshot => {
    return db
      .doc(`/words/${snapshot.data().wordId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions
  .region('europe-west2')
  .firestore.document('/users/{userId}')
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log('Image has changed');
      const batch = db.batch();
      return db
        .collection('words')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const word = db.doc(`/words/${doc.id}`);
            batch.update(word, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

exports.onWordDeleted = functions
  .region('europe-west2')
  .firestore.document('/words/{wordId}')
  .onDelete((snapshot, context) => {
    const wordId = context.params.wordId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('wordId', '==', wordId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('wordId', '==', wordId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('wordId', '==', wordId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => {
        console.error(err);
      });
  });
