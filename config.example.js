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
    follow: ''
  },
  
  github: {
    username: '',
    password: ''
  },
  
  blog: {
    title: '',
    url: '',
    feed_url: '',
    author_url: ''
  }
  

  
};
