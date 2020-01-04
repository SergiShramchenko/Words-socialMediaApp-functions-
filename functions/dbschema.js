let db = {
  users: [
    {
      userId: 'yfds83zaq1qr1mg35df',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-08-26T15:54:54.649Z',
      imageUrl: 'image/dsfsdf23441vscs',
      bio: 'Hhllo, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lugansk, UA'
    }
  ],
  words: [
    {
      userHandle: 'user',
      body: 'this is the word body',
      createdAt: '2019-08-26T15:54:54.649Z',
      likeCount: 5,
      commentCount: 2
    }
  ],
  comments: [
    {
      userHandle: 'user',
      wordId: 'fdFfGw23r1afa3F',
      body: 'nice one mate!',
      createdAt: '2019-08-26T15:54:54.649Z'
    }
  ],
  notifications: [
    {
      recipient: 'user',
      sender: 'john',
      read: 'true | false',
      wordId: '12fdsgf23rfr',
      type: 'like | comment',
      createdAt: '2019-08-26T15:54:54.649Z'
    }
  ]
};

const userDetails = {
  // Redux data
  credentials: {
    bio: 'Hello, my name is Emma',
    createdAt: '2019-08-28T06:09:39.172Z',
    email: 'Emma@email.com',
    handle: 'Emma',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/say-something-social-med-bf78a.appspot.com/o/1024386617.jpg?alt=media',
    location: 'Lugansk, UA',
    userId: '2ZQDOS6joCScFXZqVJlWWSzv4Ss2',
    website: 'https://emma.com'
  },
  likes: [
    {
      userHandle: 'user',
      wordId: 'dsf2adasAF34az'
    },
    {
      userHandle: 'user',
      wordId: 'dZXCf23dAD4fds'
    }
  ]
};
