module.exports = {
  
  app: {
    port: 3000 // port to listen on
  },
  
  polls: {
    github: 60000,  // poll frequency in millis
    blog: 60000     // poll frequency in millis
  },
  
  db: {
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
    table: ''
  },
  
  twitter: {
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: '',
    follow: ''  // User account ID to follow.
  },
  
  github: {
    username: '', // Account to authenticate Github API with
    password: ''
  },
  
  blog: {
    title: '', // Blog title, used in activity markup (in header of each activity)
    url: '', // Main URL of blog, used for activity stream target
    feed_url: '', // Feed URL to poll
    author_url: '' // Author URL prefix for author hyperlinks. E.g. http://www.example.com/author/<authorname>
  }
  

  
};
