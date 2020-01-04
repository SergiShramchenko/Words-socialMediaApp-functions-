const { db } = require('../util/admin');

exports.getAllWords = (req, res) => {
  db.collection('words')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let words = [];
      data.forEach(doc => {
        words.push({
          wordId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage
        });
      });
      return res.json(words);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postOneWord = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({ body: 'Body must not be empty' });
  }

  const newWord = {
    body: req.body.body,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0
  };
  db.collection('words')
    .add(newWord)
    .then(doc => {
      const resWord = newWord;
      resWord.wordiD = doc.id;
      return res.json(resWord);
    })
    .catch(err => {
      res.status(500).json({ error: 'Something went wrong' });
      console.error(err);
    });
};

exports.getWord = (req, res) => {
  let wordData = {};
  db.doc(`/words/${req.params.wordId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Word not found' });
      }
      wordData = doc.data();
      wordData.wordId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('wordId', '==', req.params.wordId)
        .get();
    })
    .then(data => {
      wordData.comments = [];
      data.forEach(doc => {
        wordData.comments.push(doc.data());
      });
      return res.json(wordData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.commentOnWord = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    wordId: req.params.wordId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl
  };

  db.doc(`/words/${req.params.wordId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Wword not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    });
};

exports.likeWord = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('wordId', '==', req.params.wordId)
    .limit(1);

  const wordDocument = db.doc(`/words/${req.params.wordId}`);

  let wordData;

  wordDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        wordData = doc.data();
        wordData.wordId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Word not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        db.collection('likes')
          .add({
            wordId: req.params.wordId,
            userHandle: req.user.handle
          })
          .then(() => {
            wordData.likeCount++;
            return wordDocument.update({ likeCount: wordData.likeCount });
          })
          .then(() => {
            return res.json(wordData);
          });
      } else {
        return res.status(400).json({ error: 'Word already liked' });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.unlikeWord = (req, res) => {
  const likeDocument = db
    .collection('likes')
    .where('userHandle', '==', req.user.handle)
    .where('wordId', '==', req.params.wordId)
    .limit(1);

  const wordDocument = db.doc(`/words/${req.params.wordId}`);

  let wordData;

  wordDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        wordData = doc.data();
        wordData.wordId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Word not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Word not liked' });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            wordData.likeCount--;
            return wordDocument.update({ likeCount: wordData.likeCount });
          })
          .then(() => {
            res.json(wordData);
          });
      }
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteWord = (req, res) => {
  const document = db.doc(`/words/${req.params.wordId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Word not found' });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      return res.json({ message: 'Word deleted successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
