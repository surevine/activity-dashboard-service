/**
 * Copyright Surevine Ltd. 2013
 *
 * The code herein is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The code herein is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = {
  
  app: {
    secure: false, // whether application should use https.
    ssl: {
      key: '', // path to SSL key (only required if secure = true)
      cert: '' // path to SSL cert (only required if secure = true)
    },
    port: 3000 // port to listen on (should be 443 if secure = true)
  },
  
  polls: {
    github: 60000,  // poll frequency in millis
    blog: 60000     // poll frequency in millis
  },
  
  db: {
    host: '',
    port: '',
    user: '',
    password: '',
    database: '',
    table: ''
  },
  
  twitter: {
    enabled: true, // enable / disable module
    consumer_key: '',
    consumer_secret: '',
    access_token_key: '',
    access_token_secret: '',
    follow: ''  // user account ID to follow.
  },
  
  github: {
    enabled: true, // enable / disable module    
    username: '', // account to authenticate Github API with
    password: '',
    organisation: '' // orgnisation name to poll feed for
  },
  
  blog: {
    enabled: true, // enable / disable module    
    title: '', // blog title, used in activity markup (in header of each activity)
    url: '', // main URL of blog, used for activity stream target
    feed_url: '', // feed URL to poll
    author_url: '' // author URL prefix for author hyperlinks. E.g. http://www.example.com/author/<authorname>
  }
  
};
